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
winningScore = 2

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
    data = None
    game = None

    async def connect(self):
        global nbr_waiter
        global list_waiter
        print("[CONNECT]", self.scope["user"], file=sys.stderr)
        self.room_group_name = self.scope["user"].username + "_pong"
        self.should_calcul_ball = True  # New flag to control updates

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()


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


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # print("[RECEIVE WS]", text_data_json, file=sys.stderr)
        if (text_data_json['type'] == 'search'):
            print("[SEARCH PONG GAME]", text_data_json, file=sys.stderr)
            await self.search_game()

        if (text_data_json['type'] == 'join'):
            print("[JOIN PONG GAME]" , text_data_json, file=sys.stderr)
            self.game = None
            self.game = await self.get_game(text_data_json['game_id'])
            
            self.room_group_name = "ranked_pong_" + str(text_data_json['game_id'])
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            asyncio.create_task(self.calcul_ball())
        if (text_data_json['type'] == 'move_paddle'):
            self.move_paddle(text_data_json['move'], text_data_json['player'])
            await self.send_updates()


    async def search_game(self):
        global nbr_waiter, list_waiter

        if (nbr_waiter >= 1):
            opponent = list_waiter[0]
            you = self.room_group_name
            self.game = await self.create_game(opponent, you)
            await self.channel_layer.group_send(
                you,
                {
                    'type': 'match_found',
                    'adversaire': opponent,
                    'game_id': self.game.id
                }
            )
            await self.channel_layer.group_send(
                opponent,
                {
                    'type': 'match_found',
                    'adversaire': you,
                    'game_id': self.game.id
                }
            )
            nbr_waiter -= 1
            list_waiter.remove(opponent)
            asyncio.create_task(self.calcul_ball())
            return
        nbr_waiter += 1
        list_waiter.append(self.room_group_name)

    
    async def match_found(self, event):
        print("[MATCH FOUND]", self.scope["user"], event, file=sys.stderr)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        self.game = None
        self.game = await self.get_game(event['game_id'])
        self.room_group_name = "ranked_pong_" + str(event['game_id'])
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.send(text_data=json.dumps({
            'type': 'match_found',
            'adversaire': event['adversaire'],
            'game_id': event['game_id']
        }))

        
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

    async def calcul_ball(self):
        global arenaWidth, arenaLength, thickness, ballRadius, paddleWidth, paddleHeight, baseSpeed, nbrHit, all_data, winningScore

        await asyncio.sleep(4)

        while self.should_calcul_ball:
            await asyncio.sleep(0.01)  # Wait for 0.01 second
            all_data[self.game.id].ball_x += all_data[self.game.id].ball_dx
            all_data[self.game.id].ball_y += all_data[self.game.id].ball_dy
            await self.send_updates()
            if (all_data[self.game.id].ball_y + all_data[self.game.id].ball_dy > arenaWidth - thickness/2 - ballRadius or all_data[self.game.id].ball_y + all_data[self.game.id].ball_dy < thickness/2 + ballRadius ):
                print("[PONG WALL]", file=sys.stderr)
                all_data[self.game.id].ball_dy = -all_data[self.game.id].ball_dy

            # Gestion des collisions avec les paddles
            if (all_data[self.game.id].ball_x > arenaLength - thickness * 2):
                if (all_data[self.game.id].ball_y > all_data[self.game.id].paddle2_y - paddleHeight / 2 and all_data[self.game.id].ball_y < all_data[self.game.id].paddle2_y + paddleHeight / 2):
                    nbrHit += 1
                    all_data[self.game.id].ball_dx = -baseSpeed - (0.02 * nbrHit)
                    hitPos = all_data[self.game.id].ball_y - all_data[self.game.id].paddle2_y
                    all_data[self.game.id].ball_dy = hitPos * 0.15
                else:
                    nbrHit = 0
                    all_data[self.game.id].score_player1 += 1
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
                    all_data[self.game.id].ball_dx = baseSpeed + (0.02 * nbrHit)
                    hitPos = all_data[self.game.id].ball_y - all_data[self.game.id].paddle1_y
                    all_data[self.game.id].ball_dy = hitPos * 0.15
                else:
                    nbrHit = 0
                    all_data[self.game.id].score_player2 += 1
                    print("[SCORE]", all_data[self.game.id].paddle1_y, all_data[self.game.id].paddle2_y, file=sys.stderr)
                    all_data[self.game.id].ball_dy = random.random() - 0.5
                    all_data[self.game.id].ball_dx = random.choice([0.5, -0.5])
                    all_data[self.game.id].ball_x = arenaLength / 2
                    all_data[self.game.id].ball_y = arenaWidth / 2
                    if (all_data[self.game.id].score_player1 == winningScore or all_data[self.game.id].score_player2 == winningScore):
                        await self.stop_game()

    async def game_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))


    async def stop_game(self):
        global all_data, winningScore

        self.should_calcul_ball = False
        print("[END GAME]", self.game.id, file=sys.stderr)
        await self.send_updates() # Send final update for the score
        await self.save_winner()
        player = await self.get_username_of_game(self.game.id)
        await self.channel_layer.group_send(
            "ranked_pong_" + str(self.game.id),
            {
                'type': 'end_game',
                'score_player1': all_data[self.game.id].score_player1,
                'score_player2': all_data[self.game.id].score_player2,
                'player1' : player[0],
                'player2' : player[1]
            }
        )

    async def end_game(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    def move_paddle(self, move, player):
        global all_data, arenaWidth, paddleHeight
        if (player == 1):
            if (move == 'up' and all_data[self.game.id].paddle1_y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2):
                all_data[self.game.id].paddle1_y += 0.6
            if (move == 'down' and all_data[self.game.id].paddle1_y - 0.6 > thickness / 2 + paddleHeight / 2):
                all_data[self.game.id].paddle1_y -= 0.6
        if (player == 2):
            if (move == 'up' and all_data[self.game.id].paddle2_y - 0.6 > thickness / 2 + paddleHeight / 2):
                all_data[self.game.id].paddle2_y -= 0.6
            if (move == 'down' and all_data[self.game.id].paddle2_y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2):
                all_data[self.game.id].paddle2_y += 0.6
    

    async def update_paddle(self, event):
        # Send message to WebSocket
        self.move_paddle(event['move'], event['player'])
        await self.send_updates()

    async def is_accepted(self, event):
        print("[IS ACCEPTED]", event, file=sys.stderr)
        # create data for the game
        all_data[event['id']] = PongData()
        self.game = await self.get_game(event['id'])
        
        # add waiting player to the group_game
        self.room_group_name = "ranked_pong_" + str(event['id'])
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # send ws to the waiting player for join and redirect to the game
        await self.send(text_data=json.dumps({
            'type': 'join_game',
            'game_id': event['id']
        }))

    @database_sync_to_async
    def create_game(self, player1_username, player2_username):
        global arenaWidth, arenaLength, all_data
        from app.models import User, Game_Pong

        # remove _pong from username
        player1_username = player1_username[:-5]
        player2_username = player2_username[:-5]
        print("[CREATE PONG GAME]", player1_username, player2_username, file=sys.stderr)

        player1 = get_object_or_404(User, username=player1_username)
        player2 = get_object_or_404(User, username=player2_username)
        game = Game_Pong()
        game.player1 = player1
        game.player2 = player2
        game.save()
        all_data[game.id] = PongData()
        return game

    @database_sync_to_async
    def save_winner(self):
        global winningScore, all_data

        self.game.player1_score = all_data[self.game.id].score_player1
        self.game.player2_score = all_data[self.game.id].score_player2
        if (all_data[self.game.id].score_player1 == winningScore):
            self.game.winner = self.game.player1
        elif (all_data[self.game.id].score_player2 == winningScore):
            self.game.winner = self.game.player2
        self.game.save()

    @database_sync_to_async
    def get_game(self, game_id):
        from app.models import Game_Pong

        game = get_object_or_404(Game_Pong, id=game_id)
        return game

    @database_sync_to_async
    def get_username_of_game(self, game_id):
        from app.models import Game_Pong

        game = get_object_or_404(Game_Pong, id=game_id)
        return game.player1.username, game.player2.username
