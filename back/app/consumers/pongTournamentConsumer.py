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

        print("[TEST]", self.scope["user"].tournament_id, file=sys.stderr)
        tournamentName = await self.get_Name()
        # playerList = await self.get_playerList()


        self.room_group_name = "tournament_" + str(self.scope["user"].tournament_id)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'refresh_infos',
                'user_username': self.scope["user"].username,
                'user_rank': self.scope["user"].pong_rank,
                'tournamentName': tournamentName
            }
        )

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )



    async def disconnect(self):
        print("[WS PONG DISCONNECT]", file=sys.stderr)

    # async def receive(self, text_data):
    #     text_data_json = json.loads(text_data)
    #     print("[RECEIVE WS]", text_data_json, file=sys.stderr)

    #     print("[TEST2]", self.scope["user"].tournament_id, file=sys.stderr)
    #     tournamentName = await self.get_Name()

    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {
    #             'type': 'refresh_infos',
    #             'user_username': self.scope["user"].username,
    #             'user_rank': self.scope["user"].pong_rank,
    #             'tournamentName': tournamentName
    #         }
    #     )

    async def refresh_infos(self, event):
        print("[REFRESH INFOS]", event, file=sys.stderr)
        await self.send(text_data=json.dumps({
            'type': 'refresh_infos',
            'user_username': event['user_username'],
            'user_rank': event['user_rank'],
            'tournamentName': event['tournamentName']
        }))

    @database_sync_to_async
    def get_Name(self):
        tournamentID = self.scope["user"].tournament_id
        tournamentObj = Tournament.objects.get(id=tournamentID)
        tournamentName = tournamentObj.name
        return tournamentName

    # @database_sync_to_async
    # def get_playerList(self):
    #     tournamentID = self.scope["user"].tournament_id
    #     tournamentObj = Tournament.objects.get(tournament_id=tournament_id)
    #     playerList = tournamentObj.participants
    #     return playerList