import json
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
from .models import User, Discussion, Message
from django.db.models import Q





from channels.consumer import SyncConsumer

import sys #for print

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("[CONNECT]", self.scope["user"], file=sys.stderr)
        self.room_group_name = self.scope["user"].username

        await self.set_state(self.scope["user"], User.State.ONLINE)

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        all_username =  await self.get_all()

        for username in all_username:
            print("[SEND_TO]", username, file=sys.stderr)
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
        await self.set_state(self.scope["user"], User.State.OFFLINE)
        all_username =  await self.get_all()

        for username in all_username:
            print("[SEND_TO]", username, file=sys.stderr)
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

        sender = text_data_json['sender']
        message = text_data_json['message']
        send_to = text_data_json['send_to']
        discu_id = text_data_json['discu_id']
        # save message in db
        await self.save_message(discu_id, sender, message, send_to)

        # send websocket message
        await self.channel_layer.group_send(
            send_to,
            {
                'type': 'chat_message',
                'sender': sender,
                'message': message
            }
        )



    @database_sync_to_async
    def save_message(self, discu_id, sender, message, send_to):
        current_discu =  get_object_or_404(Discussion, id=discu_id)
        interlocutor =  get_object_or_404(User, username=send_to)
        obj = Message()
        obj.discussion = current_discu
        obj.sender =  get_object_or_404(User, username=sender)
        obj.message = message
        obj.save()

    @database_sync_to_async
    def set_state(self, user, state):
        print("[STATE]", user, state, file=sys.stderr)
        user.state = state
        user.save()

    @database_sync_to_async
    def get_all(self):
        print("[SEND_TO_ALL]", file=sys.stderr)
        current_user = self.scope["user"]
        all_discussion = Discussion.objects.filter(Q(user1=current_user) | Q(user2=current_user))
        all_username = []
        for discussion in all_discussion:
            all_username.append(discussion.get_other_username(current_user.username))
        return all_username
        

    async def connect_message(self, event):
        sender = event['sender']
        print("[SEND WS]", event, file=sys.stderr)

        await self.send(text_data=json.dumps({
            'type': event['statut'],
            'sender': sender
        }))

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        print("[SEND WS]", event, file=sys.stderr)

        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message,
            'sender': sender
        }))  