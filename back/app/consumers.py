import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import sys #for print

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("[LOG]", self.scope["user"].username, self.channel_name, file=sys.stderr)
        self.room_group_name = self.scope["user"].username

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print("[LOG]", text_data_json, file=sys.stderr)

        sender = text_data_json['sender']
        message = text_data_json['message']
        send_to = text_data_json['send_to']
        await self.channel_layer.group_send(
            send_to,
            {
                'type': 'chat_message',
                'sender': sender,
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        print("[LOG]", event, file=sys.stderr)

        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))


