import json
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.db import database_sync_to_async
from app.models import User, Game_Chess, Tournament

import sys #for print
import time

class pongTournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("[WS PONG CONNECT]", self.scope["user"], file=sys.stderr)
        await self.accept()

        if (self.scope["user"].tournament_id):
            print("[WS PONG CONNECT] user already in a tournament", file=sys.stderr)
            self.room_group_name = "pong_tournament_" + str(self.scope["user"].tournament_id)
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        else:
            print("[WS PONG CONNECT] user not in a tournament", file=sys.stderr)


    async def disconnect(self, close_code):
        print("[WS PONG DISCONNECT] group : ", self.room_group_name, file=sys.stderr)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print("[RECEIVE WS]", text_data_json, file=sys.stderr)

        action = text_data_json['type']
        if ("type" in text_data_json and text_data_json["type"] == "join"):
            id_tournament = text_data_json['id_tournament']
        elif ("type" in text_data_json and text_data_json["type"] == "leave"):
            id_tournament = text_data_json['id_tournament']
        else :
            print("[ERROR]", file=sys.stderr)
            return
        self.room_group_name = "pong_tournament_" + str(id_tournament)

        tournamentName = await self.get_Name(id_tournament)
        tournamentNB = await self.get_NB(id_tournament)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'refresh_infos',
                'action': action,
                'user_username': self.scope["user"].username,
                'user_rank': self.scope["user"].pong_rank,
                'tournamentName': tournamentName,
                'tournamentNB': tournamentNB,
            }
        )

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

    async def refresh_infos(self, event):
        print("[REFRESH INFOS]", event, file=sys.stderr)
        await self.send(text_data=json.dumps({
            'type': 'refresh_infos',
            'action': event['action'],
            'user_username': event['user_username'],
            'user_rank': event['user_rank'],
            'tournamentName': event['tournamentName'],
            'tournamentNB': event['tournamentNB']
        }))

    @database_sync_to_async
    def get_Name(self, id):
        tournamentObj = Tournament.objects.get(id=id)
        if (tournamentObj == None):
            return None
        tournamentName = tournamentObj.name
        return tournamentName

    @database_sync_to_async
    def get_NB(self, id):
        tournamentObj = Tournament.objects.get(id=id)
        if (tournamentObj == None):
            return None
        tournamentNB = tournamentObj.participants.count()
        return tournamentNB

