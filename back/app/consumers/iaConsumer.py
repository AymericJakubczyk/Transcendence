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
all_data = {}


arenaWidth = 100
arenaLength = 150
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5
nbrHit = 0
winningScore = 5

class PongData():
    def __init__(self):
        self.ball_dy = random.random() - 0.5
        self.ball_dx = random.choice([0.5, -0.5])
        self.ball_x = arenaLength / 2
        self.ball_y = arenaWidth / 2
        self.paddle1_y = arenaWidth / 2
        self.paddle2_y = arenaWidth / 2
        self.score_player1 = 0
        self.score_player2 = 0

class PongConsumer(AsyncWebsocketConsumer):
    async def calcul_ball(self):
        global arenaWidth, arenaLength, thickness, ballRadius, paddleWidth, paddleHeight, baseSpeed, nbrHit, all_data, winningScore

        await asyncio.sleep(1)
        await self.send_countdown("3")
        await asyncio.sleep(1)
        await self.send_countdown("2")
        await asyncio.sleep(1)
        await self.send_countdown("1")
        await asyncio.sleep(1)
        await self.send_countdown("GO")
        await asyncio.sleep(1)

        while self.should_calcul_ball:
            await asyncio.sleep(0.01)  # Wait for 0.01 second
            all_data[self.game.id].ball_x += all_data[self.game.id].ball_dx
            all_data[self.game.id].ball_y += all_data[self.game.id].ball_dy
            await self.send_updates()
            if (all_data[self.game.id].ball_y + all_data[self.game.id].ball_dy > arenaWidth - thickness/2 - ballRadius or all_data[self.game.id].ball_y + all_data[self.game.id].ball_dy < thickness/2 + ballRadius ):
                print("[PONG WALL]", file=sys.stderr)
                await self.send_bump('wall', 0)
                all_data[self.game.id].ball_dy = -all_data[self.game.id].ball_dy

            # Gestion des collisions avec les paddles
            if (all_data[self.game.id].ball_x > arenaLength - thickness * 2):
                if (all_data[self.game.id].ball_y > all_data[self.game.id].paddle2_y - paddleHeight / 2 and all_data[self.game.id].ball_y < all_data[self.game.id].paddle2_y + paddleHeight / 2):
                    nbrHit += 1
                    await self.send_bump('paddle', 2)
                    all_data[self.game.id].ball_dx = -baseSpeed - (0.02 * nbrHit)
                    hitPos = all_data[self.game.id].ball_y - all_data[self.game.id].paddle2_y
                    all_data[self.game.id].ball_dy = hitPos * 0.15
                else:
                    nbrHit = 0
                    all_data[self.game.id].score_player1 += 1
                    await self.send_updates()
                    await self.send_bump('ball', 0)
                    await asyncio.sleep(0.5)
                    print("[SCORE]", all_data[self.game.id].paddle1_y, all_data[self.game.id].paddle2_y, file=sys.stderr)
                    all_data[self.game.id].ball_dy = random.random() - 0.5
                    all_data[self.game.id].ball_dx = random.choice([0.5, -0.5])
                    all_data[self.game.id].ball_x = arenaLength / 2
                    all_data[self.game.id].ball_y = arenaWidth / 2
                    if (all_data[self.game.id].score_player1 == winningScore or all_data[self.game.id].score_player2 == winningScore):
                        await self.stop_game()

            if (all_data[self.game.id].ball_x < thickness * 2):
                if (all_data[self.game.id].ball_y > all_data[self.game.id].paddle1_y - paddleHeight / 2 and all_data[self.game.id].ball_y < all_data[self.game.id].paddle1_y + paddleHeight / 2):
                    nbrHit += 1
                    await self.send_bump('paddle', 1)
                    all_data[self.game.id].ball_dx = baseSpeed + (0.02 * nbrHit)
                    hitPos = all_data[self.game.id].ball_y - all_data[self.game.id].paddle1_y
                    all_data[self.game.id].ball_dy = hitPos * 0.15
                else:
                    nbrHit = 0
                    all_data[self.game.id].score_player2 += 1
                    await self.send_updates()
                    await self.send_bump('ball', 0)
                    await asyncio.sleep(0.5)
                    print("[SCORE]", all_data[self.game.id].paddle1_y, all_data[self.game.id].paddle2_y, file=sys.stderr)
                    all_data[self.game.id].ball_dy = random.random() - 0.5
                    all_data[self.game.id].ball_dx = random.choice([0.5, -0.5])
                    all_data[self.game.id].ball_x = arenaLength / 2
                    all_data[self.game.id].ball_y = arenaWidth / 2
                    if (all_data[self.game.id].score_player1 == winningScore or all_data[self.game.id].score_player2 == winningScore):
                        await self.stop_game()

    async def send_countdown(self, countdown):
        await self.channel_layer.group_send(
            "ranked_pong_" + str(self.game.id),
            {
                'type': 'countdown',
                'countdown': countdown
            }
        )

    async def send_updates(self):
        # print("[SEND UPDATES 2]", file=sys.stderr)

        await self.channel_layer.group_send(
            "ranked_pong_" + str(self.game.id),
            {
                'type': 'game_update',
                'x': all_data[self.game.id].ball_x,
                'y': all_data[self.game.id].ball_y,
                'dx': all_data[self.game.id].ball_dx,
                'dy': all_data[self.game.id].ball_dy,
                'paddle1_y': all_data[self.game.id].paddle1_y,
                'paddle2_y': all_data[self.game.id].paddle2_y,
                'score_player1': all_data[self.game.id].score_player1,
                'score_player2': all_data[self.game.id].score_player2
            }
        )

    async def send_bump(self, obj, player):
        await self.channel_layer.group_send(
            "ranked_pong_" + str(self.game.id),
            {
                'type': 'bump',
                'x': all_data[self.game.id].ball_x,
                'y': all_data[self.game.id].ball_y,
                'object': obj,
                'player': player
            }
        )
