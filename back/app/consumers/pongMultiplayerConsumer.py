import json
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
import random
import asyncio

import sys #for print

nbr_waiter = 0
list_waiter = []
playerIDlist = []
all_data = {}


arenaWidth = 100
arenaLength = 150
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5
nbrHit = 0
winningScore = 2

class PongMultiplayerConsumer(AsyncWebsocketConsumer):
    data = None
    game = None

    async def connect(self):
        global nbr_waiter
        global list_waiter
        print("[CONNECT]", self.scope["user"], file=sys.stderr)
        self.room_group_name = self.scope["user"].username + "_pongMulti"
        self.should_calcul_ball = True  # New flag to control updates

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()


        nbr_waiter += 1
        list_waiter.append(self.room_group_name)
        print(nbr_waiter, "waiting...", file=sys.stderr)
        playerIDlist.append(self.scope["user"].id)

        if (nbr_waiter >= 2):
            print("Creating game...", file=sys.stderr)
            game = await self.create_game()

            for group in list_waiter:
                await self.channel_layer.group_send(
                    group,
                    {
                        'type': 'multi_match_found',
                        'game_id': game.id,
                    }
                )
                nbr_waiter -= 1

            asyncio.create_task(self.calcul_ball())
            list_waiter.clear()
            return


    async def disconnect(self, close_code):
        global nbr_waiter
        global list_waiter
        print("[DISCONNECT]", file=sys.stderr)

        if list_waiter.count(self.room_group_name) > 0:
            nbr_waiter -= 1
            list_waiter.remove(self.room_group_name)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        ) 

        if (playerIDlist.count(self.scope["user"].id) > 0):
            playerIDlist.remove(self.scope["user"].id)
    
    async def multi_match_found(self, event):
        print("[MATCH FOUND]", self.scope["user"], event, file=sys.stderr)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        self.room_group_name = "pong_multi_" + str(event['game_id'])
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.send(text_data=json.dumps({
            'type': 'multi_match_found',
            'game_id': event['game_id'],
        }))

    @database_sync_to_async
    def create_game(self):
        global arenaWidth, arenaLength, all_data, playerIDlist
        from app.models import User, Game_PongMulti, PongMultiDataGame

        print("[CREATE MULTI GAME]", file=sys.stderr)

        self.data = PongMultiDataGame()
        self.data.ball_dy = random.random() - 0.5
        self.data.ball_dx = random.choice([0.5, -0.5])
        self.data.ball_x = arenaLength / 2
        self.data.ball_y = arenaWidth / 2
        self.data.save()

        self.game = Game_PongMulti()
        self.game.save()
        for ID in playerIDlist:
            user = get_object_or_404(User, id=ID)
            if user:
                self.game.playerlist.add(user)
        self.game.data = self.data
        self.game.save()
        all_data[self.game.id] = self.data
        playerIDlist.clear()
        return self.game

    async def send_updates(self):
        # print("[SEND UPDATES 2]", file=sys.stderr)
        await self.channel_layer.group_send(
            "pong_multi_" + str(self.game.id),
            {
                'type': 'game_update',
                'x': all_data[self.game.id].ball_x,
                'y': all_data[self.game.id].ball_y,
                'dx': all_data[self.game.id].ball_dx,
                'dy': all_data[self.game.id].ball_dy,
            }
        )

    async def calcul_ball(self):
        global arenaWidth, arenaLength, thickness, ballRadius, paddleWidth, paddleHeight, baseSpeed, nbrHit, all_data

        await asyncio.sleep(4)

        while self.should_calcul_ball:
            await asyncio.sleep(0.01)  # Wait for 0.01 second
            all_data[self.game.id].ball_x += all_data[self.game.id].ball_dx
            all_data[self.game.id].ball_y += all_data[self.game.id].ball_dy
            await self.send_updates()
            
            # COLLISION AVEC LES PADDLES

            # COLLISION AVEC LE CERCLE ET MARQUAGE

    async def game_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))