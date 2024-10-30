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
    data = None
    game = None
    tournament = None

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
            # send ws to know what player you are (0 is spectator)
            if (self.scope["user"] == await self.get_player(self.game, 1)):
                await self.send(text_data=json.dumps({
                    'type': 'rejoin',
                    'player': 1
                }))
            elif (self.scope["user"] == await self.get_player(self.game, 2)):
                await self.send(text_data=json.dumps({
                    'type': 'rejoin',
                    'player': 2
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'rejoin',
                    'player': 0
                }))
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

    async def game_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    async def bump(self, event):
        await self.send(text_data=json.dumps(event))

    async def send_countdown(self, countdown):
        await self.channel_layer.group_send(
            "ranked_pong_" + str(self.game.id),
            {
                'type': 'countdown',
                'countdown': countdown
            }
        )

    async def stop_game(self):
        global all_data, winningScore

        self.should_calcul_ball = False
        print("[END GAME]", self.game.id, file=sys.stderr)
        await self.send_updates() # Send final update for the score
        win_elo = await self.save_winner()
        player = await self.get_username_of_game(self.game.id)
        await self.channel_layer.group_send(
            "ranked_pong_" + str(self.game.id),
            {
                'type': 'end_game',
                'score_player1': all_data[self.game.id].score_player1,
                'score_player2': all_data[self.game.id].score_player2,
                'player1' : player[0],
                'player2' : player[1],
                'win_elo_p1': win_elo['win_elo_p1'],
                'win_elo_p2': win_elo['win_elo_p2']
            }
        )
        if (self.game.tournament_pos != -1):
            await self.update_tournament()

    @database_sync_to_async
    def update_tournament(self):
        from app.models import Tournament

        # GET TOURNAMENT OBJ
        bracket_id = self.game.player1.tournament_id
        print("UPDATING TOURNAMENT", bracket_id, file=sys.stderr)
        tournament = get_object_or_404(Tournament, id=bracket_id)
        if (not tournament):
            return
        elif (not self.tournament):
            self.tournament = tournament

        # ADD LOSER TO RESULTS
        if self.game.winner == self.game.player1:
            if self.game.player2.id not in self.tournament.results:
                self.tournament.results.append(self.game.player2.id)
                self.tournament.save()
        elif self.game.winner == self.game.player2:
            if self.game.player1.id not in self.tournament.results:
                self.tournament.results.append(self.game.player1.id)
                self.tournament.save()

        # GET GAME POSITION IN TOURNAMENT
        game_position = self.game.tournament_pos
        if (game_position % 2 == 1):
            new_game_pos = 100 + game_position
        else :
            new_game_pos = 100 + game_position - 1
        # GET GAME WITH THIS POS
        next_game = None
        for game_obj in tournament.pong_matchs.all():
            if (game_obj.tournament_pos == new_game_pos):
                next_game = game_obj
        # IF NOT FOUND HE WON TOURNAMENT
        if next_game == None:
            self.tournament.winner = self.game.winner
            self.tournament.results.add(self.game.winner)
            self.tournament.save()
            print("UPDATING TOURNAMENT:", self.game.winner, "WON THE TOURNAMENT", file=sys.stderr)
        else:
            # PUT WINNER IN THE GAME
            if (not next_game.player1):
                next_game.player1 = self.game.winner
            elif (not next_game.player2):
                next_game.player2 = self.game.winner
            print("UPDATING TOURNAMENT:", self.game.winner, "will play in game_pos ", new_game_pos, file=sys.stderr)
            next_game.save()
        
        # UPDATE BARCKET (PAS SUR CA MARCHE LA)
        self.channel_layer.group_send(
            "pong_tournament_" + str(self.game.player1.tournament_id),
            {
                "type": "update_room",
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
        # start the game
        asyncio.create_task(self.calcul_ball())

    async def join_tournament_game(self, event):
        print("[JOIN TOURNAMENT GAME]", event, self.scope["user"].username, file=sys.stderr)
        self.game = await self.get_game(event['id'])
        all_data[self.game.id] = PongData()
        asyncio.create_task(self.calcul_ball())

    async def countdown(self, event):
        # get player1 and player2
        player = await self.get_username_of_game(self.game.id)
        if (player[0] == self.scope["user"].username):
            await self.send(text_data=json.dumps({
                'type': 'countdown',
                'countdown': event['countdown'],
                "player":1
            }))
        elif (player[1] == self.scope["user"].username):
            await self.send(text_data=json.dumps({
                'type': 'countdown',
                'countdown': event['countdown'],
                "player":2
            }))
        else: # for spectator
            await self.send(text_data=json.dumps({
                'type': 'countdown',
                'countdown': event['countdown'],
                "player":0
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
    def get_player(self, game, player):
        if (player == 1):
            return game.player1
        elif (player == 2):
            return game.player2

    @database_sync_to_async
    def save_winner(self):
        global winningScore, all_data

        # calcul elo
        proba_win_p1 = 1 / (1 + 10 ** ((self.game.player2.pong_rank - self.game.player1.pong_rank) / 400))
        proba_win_p2 = 1 / (1 + 10 ** ((self.game.player1.pong_rank - self.game.player2.pong_rank) / 400))
        if (all_data[self.game.id].score_player1 == winningScore):
            win_elo_p1 = round(20 * (1 - proba_win_p1))
            win_elo_p2 = round(20 * (0 - proba_win_p2))
        elif (all_data[self.game.id].score_player2 == winningScore):
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
        if (all_data[self.game.id].score_player1 == winningScore):
            self.game.winner = self.game.player1
        elif (all_data[self.game.id].score_player2 == winningScore):
            self.game.winner = self.game.player2        
        self.game.save()
        return ({'win_elo_p1': win_elo_p1, 'win_elo_p2': win_elo_p2})


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