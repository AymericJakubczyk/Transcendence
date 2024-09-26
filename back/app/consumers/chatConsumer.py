import json
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
from django.db.models import Q
from channels.consumer import SyncConsumer

import sys #for print

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("[CONNECT]", self.scope["user"], file=sys.stderr)
        self.room_group_name = self.scope["user"].username

        await self.set_state(self.scope["user"], "online")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connect_message',
                'statut': 'connect',
                'sender': self.scope["user"].username,
            }
        )

        all_username =  await self.get_all()

        for username in all_username:
            await self.channel_layer.group_send(
                username,
                {
                    'type': 'connect_message',
                    'statut': 'connect',
                    'sender': self.scope["user"].username,
                }
        )
        await self.accept()

    async def disconnect(self, close_code):
        print("[DISCONNECT]", file=sys.stderr)
        await self.set_state(self.scope["user"], "offline")
        all_username =  await self.get_all()

        for username in all_username:
            await self.channel_layer.group_send(
                username,
                {
                    'type': 'connect_message',
                    'statut': 'disconnect',
                    'sender': self.scope["user"].username,
                }
        )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print("[RECEIVE WS]", text_data_json, file=sys.stderr)

        sender = self.scope["user"].username
        message = text_data_json['message']
        send_to = text_data_json['send_to']
        discu_id = text_data_json['discu_id']
        if (message == "" or len(message) > 420):
            if (message == ""):
                error_message = "Empty message"
            else:
                error_message = "Message too long (max 420 characters)"
            print("[ERROR MESSAGE]", error_message, file=sys.stderr)
            await self.channel_layer.group_send(
                self.scope["user"].username,
                {
                    'type': 'error_message',
                    'message': error_message,
                }
            )
            return
        # save message in db
        await self.save_message(discu_id, sender, message, send_to)

        user = self.scope["user"]
        user_obj = {'username': user.username, 'profile_picture': user.profile_picture.url}
        # send websocket message
        await self.channel_layer.group_send(
            send_to,
            {
                'type': 'chat_message',
                'sender': sender,
                'message': message,
                'discu_id': discu_id,
                'user': user_obj
            }
        )
        await self.channel_layer.group_send(
            sender,
            {
                'type': 'message_valid',
                'sender': sender,
                'send_to': send_to,
                'message': message,
                'discu_id': discu_id,
                'user': user_obj
            }
        )

    @database_sync_to_async
    def save_message(self, discu_id, sender, message, send_to):
        from app.models import User, Discussion, Message

        current_discu =  get_object_or_404(Discussion, id=discu_id)
        interlocutor =  get_object_or_404(User, username=send_to)
        obj = Message()
        obj.discussion = current_discu
        obj.sender =  get_object_or_404(User, username=sender)
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
        

    async def connect_message(self, event):
        print("[SEND WS]", event, file=sys.stderr)

        await self.send(text_data=json.dumps({
            'type': event['statut'],
            'sender': event['sender']
        }))

    async def chat_message(self, event):
        print("[SEND WS]", event, file=sys.stderr)
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': event['message'],
            'sender': event['sender'],
            'discu_id': event['discu_id'],
            'user': event['user']
        }))

    async def message_valid(self, event):
        print("[SEND WS]", event, file=sys.stderr)
        await self.send(text_data=json.dumps({
            'type': 'message_valid',
            'message': event['message'],
            'sender': event['sender'],
            'send_to': event['send_to'],
            'discu_id': event['discu_id'],
            'user': event['user']
        }))

    async def error_message(self, event):
        print("[SEND WS]", event, file=sys.stderr)
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': event['message'],
        }))