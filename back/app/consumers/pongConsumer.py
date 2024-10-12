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

        if (nbr_waiter >= 1):
            opponent = list_waiter[0]
            you = self.room_group_name
            game = await self.create_game(opponent, you)
            await self.channel_layer.group_send(
                you,
                {
                    'type': 'match_found',
                    'adversaire': opponent,
                    'game_id': game.id
                }
            )
            await self.channel_layer.group_send(
                opponent,
                {
                    'type': 'match_found',
                    'adversaire': you,
                    'game_id': game.id
                }
            )
            nbr_waiter -= 1
            list_waiter.remove(opponent)
            asyncio.create_task(self.calcul_ball())
            return
        nbr_waiter += 1
        list_waiter.append(self.room_group_name)

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
        if (text_data_json['type'] == 'move_paddle'):
            self.move_paddle(text_data_json['move'], text_data_json['player'])
            await self.send_updates()
    
    async def match_found(self, event):
        print("[MATCH FOUND]", self.scope["user"], event, file=sys.stderr)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.get_data(event['game_id'])
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

    @database_sync_to_async
    def create_game(self, player1_username, player2_username):
        global arenaWidth, arenaLength, all_data
        from app.models import User, Game_Pong, PongDataGame

        # remove _pong from username
        player1_username = player1_username[:-5]
        player2_username = player2_username[:-5]
        print("[CREATE CHESS GAME]", player1_username, player2_username, file=sys.stderr)

        player1 = get_object_or_404(User, username=player1_username)
        player2 = get_object_or_404(User, username=player2_username)
        self.data = PongDataGame()
        self.data.ball_dy = random.random() - 0.5
        self.data.ball_dx = random.choice([0.5, -0.5])
        self.data.ball_x = arenaLength / 2
        self.data.ball_y = arenaWidth / 2
        self.data.paddle1_y = arenaWidth / 2
        self.data.paddle2_y = arenaWidth / 2
        self.data.save()
        self.game = Game_Pong()
        self.game.player1 = player1
        self.game.player2 = player2
        self.game.data = self.data
        self.game.save()
        all_data[self.game.id] = self.data
        return self.game

        
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
        self.should_calcul_ball = False
        print("[END GAME]", file=sys.stderr)
        await self.send_updates() # Send final update for the score
        if (all_data[self.game.id].score_player1 == winningScore):
            win_elo = await self.save_winner(self.game.player1)
        elif (all_data[self.game.id].score_player2 == winningScore):
            win_elo = await self.save_winner(self.game.player2)
        await self.channel_layer.group_send(
            "ranked_pong_" + str(self.game.id),
            {
                'type': 'end_game',
                'score_player1': all_data[self.game.id].score_player1,
                'score_player2': all_data[self.game.id].score_player2,
                'player1' : self.game.player1.username,
                'player2' : self.game.player2.username,
                'win_elo_p1': win_elo['win_elo_p1'],
                'win_elo_p2': win_elo['win_elo_p2']
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


    @database_sync_to_async
    def get_data(self, game_id):
        from app.models import Game_Pong

        game = get_object_or_404(Game_Pong, id=game_id)
        print("[GET DATA]", game.data, file=sys.stderr)
        if (not self.game):
            self.game = game
        self.data = game.data

    @database_sync_to_async
    def save_winner(self, winner):
        global winningScore, all_data

        # calcul elo
        proba_win_p1 = 1 / (1 + 10 ** ((self.game.player2.pong_rank - self.game.player1.pong_rank) / 400))
        proba_win_p2 = 1 / (1 + 10 ** ((self.game.player1.pong_rank - self.game.player2.pong_rank) / 400))
        if (self.game.player1 == winner):
            win_elo_p1 = round(20 * (1 - proba_win_p1))
            win_elo_p2 = round(20 * (0 - proba_win_p2))
        else:
            win_elo_p1 = round(20 * (0 - proba_win_p1))
            win_elo_p2 = round(20 * (1 - proba_win_p2))
        self.game.player1_rank = self.game.player1.pong_rank
        self.game.player2_rank = self.game.player2.pong_rank
        self.game.player1_rank_win += win_elo_p1
        self.game.player2_rank_win += win_elo_p2
        self.game.player1.pong_rank += win_elo_p1
        self.game.player2.pong_rank += win_elo_p2
        self.game.player1.save()
        self.game.player2.save()
        
        self.game.player1_score = all_data[self.game.id].score_player1
        self.game.player2_score = all_data[self.game.id].score_player2
        self.game.winner = winner
        self.game.save()
        return ({'win_elo_p1': win_elo_p1, 'win_elo_p2': win_elo_p2})
    

    async def update_paddle(self, event):
        # Send message to WebSocket
        self.move_paddle(event['move'], event['player'])
        await self.send_updates()
        