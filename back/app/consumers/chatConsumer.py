import json
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db.models import Q

import sys #for print

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("[CONNECT]", self.scope["user"].username, file=sys.stderr)
        self.room_group_name = self.scope["user"].username

        await self.set_state(self.scope["user"], "online")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # send to all friend user that the user is connected for update the state in real time
        all_username =  await self.get_all()
        for username in all_username:
            await self.channel_layer.group_send(
                username, {'type':'send_ws', 'type2':'connect', 'sender':self.scope["user"].username}
            )


    async def disconnect(self, close_code):
        print("[DISCONNECT]", self.scope["user"].username, file=sys.stderr)
        await self.set_state(self.scope["user"], "offline")

        # send to all friend user that the user is disconnected for update the state in real time
        all_username =  await self.get_all()
        for username in all_username:
            await self.channel_layer.group_send(
                username, {'type':'send_ws', 'type2':'disconnect', 'sender': self.scope["user"].username}
        )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )


    async def receive(self, text_data):
        data = json.loads(text_data)
        print("[RECEIVE WS]", data , text_data, file=sys.stderr)

        if (not data.get('type')):
            print("[ERROR] type not found", file=sys.stderr)
            return
            
        if (data['type'] == 'message'):
            await self.verif_and_send_msg(data)

        if (data['type'] == "decline"):
            sender = await self.decline_invatation(data['id'])
            await self.channel_layer.group_send(
                sender.username,{'type':'send_ws' ,'type2':'decline', 'id':data['id']}
            )


    async def verif_and_send_msg(self, data):
        print("[VERIF AND SEND MSG]", data, file=sys.stderr)
        sender = self.scope["user"]
        message = data['message']
        send_to = data['send_to']
        discu_id = data['discu_id']
        if (message == "" or len(message) > 420):
            if (message == ""):
                error_message = "Empty message"
            else:
                error_message = "Message too long (max 420 characters)"
            print("[ERROR MESSAGE]", error_message, file=sys.stderr)
            await self.channel_layer.group_send(
                sender.username, {'type':'send_ws', 'type2':'error_message', 'message':error_message,}
            )
            return
        # save message in db
        await self.save_message(discu_id, sender, message, send_to)

        # send websocket message to the both user of the discussion
        user_obj = {'username': sender.username, 'profile_picture': sender.profile_picture.url}
        await self.channel_layer.group_send(
            send_to, {'type':'send_ws', 'type2':'chat_message', 'sender':sender.username, 'message':message, 'discu_id':discu_id, 'user': user_obj}
        )
        await self.channel_layer.group_send(
            sender.username, {'type':'send_ws', 'type2':'message_valid', 'sender':sender.username, 'send_to': send_to,'message': message,'discu_id': discu_id,'user': user_obj}
        )


    @database_sync_to_async
    def save_message(self, discu_id, sender, message, send_to):
        from app.models import User, Discussion, Message

        current_discu =  get_object_or_404(Discussion, id=discu_id)
        interlocutor =  get_object_or_404(User, username=send_to)
        obj = Message()
        obj.discussion = current_discu
        obj.sender =  get_object_or_404(User, username=sender.username)
        obj.message = message
        current_discu.save() # update last_activity
        obj.save()

    @database_sync_to_async
    def set_state(self, user, state):
        from app.models import User

        # update user if there is changement before
        update_user = User.objects.get(id=user.id)
        user = update_user
        if (state == "online"):
            user.state = User.State.ONLINE
        elif (state == "offline"):
            user.state = User.State.OFFLINE
        user.save()

    @database_sync_to_async
    def get_all(self):
        from app.models import Discussion

        current_user = self.scope["user"]
        all_discussion = Discussion.objects.filter(Q(user1=current_user) | Q(user2=current_user))
        all_username = []
        for discussion in all_discussion:
            all_username.append(discussion.get_other_username(current_user.username))
        return all_username

    @database_sync_to_async
    def decline_invatation(self, id):
        from app.models import Invite

        invitation = get_object_or_404(Invite, id=id)
        stock_sender = invitation.from_user
        invitation.delete()
        return stock_sender


    async def send_ws(self, event):
        print("[SEND CHAT WS]", event, file=sys.stderr)
        event['type'] = event['type2']
        await self.send(text_data=json.dumps(event))