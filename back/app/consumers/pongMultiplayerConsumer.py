import json, math
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
ringRadius = 50
paddleRadius = ringRadius - 3
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5
nbrHit = 0
winningScore = 2
playerZoneSize = 0


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

        if (nbr_waiter >= 3):
            print("Creating game...", file=sys.stderr)
            self.game = await self.create_game()
            nb = nbr_waiter
            i = 0
            for group in list_waiter:
                print(i, file=sys.stderr)
                await self.channel_layer.group_send(
                    group,
                    {
                        'type': 'multi_match_found',
                        'game_id': self.game.id,
                        'player_id': i,
                        'player_nb': nb,
                    }
                )
                nbr_waiter -= 1
                i += 1
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
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # print("[RECEIVE WS]", text_data_json, file=sys.stderr)
        if (text_data_json['type'] == 'move_paddle'):
            self.move_paddle(text_data_json['move'], text_data_json['player'])
            await self.send_updates()

    async def multi_match_found(self, event):
        print("[MATCH FOUND]", self.scope["user"], event, file=sys.stderr)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        self.game = None
        self.game = await self.get_game(event['game_id'])
        self.room_group_name = "pong_multi_" + str(event['game_id'])
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.send(text_data=json.dumps({
            'type': 'multi_match_found',
            'game_id': event['game_id'],
            'player_id': event['player_id'],
            'player_nb': event['player_nb'],
        }))
            

    @database_sync_to_async
    def get_game(self, game_id):
        from app.models import Game_PongMulti

        game = get_object_or_404(Game_PongMulti, id=game_id)
        return game

    @database_sync_to_async
    def create_game(self):
        global arenaWidth, arenaLength, all_data, playerIDlist
        from app.models import User, Game_PongMulti, PongMultiDataGame

        print("[CREATE MULTI GAME]", file=sys.stderr)

        self.data = PongMultiDataGame()
        self.data.nb_players = len(playerIDlist)
        self.data.active_players = len(playerIDlist)
        self.data.ball_dy = random.random() - 0.5
        self.data.ball_dx = random.choice([0.5, -0.5])
        self.data.ball_x = arenaLength / 2
        self.data.ball_y = arenaWidth / 2

        self.data.zoneStart = [0] * self.data.nb_players
        self.data.paddleStart = [0] * self.data.nb_players
        self.data.lifes = [2] * self.data.nb_players
        self.data.playerid_table = [0] * self.data.nb_players
        i = 0
        for ID in playerIDlist:
            self.data.playerid_table[i] = ID
            i += 1

        for i in range(self.data.nb_players):
            playerZoneSize = (2 * math.pi) / len(playerIDlist)
            self.data.zoneStart[i] = i * playerZoneSize
            playerPaddleSize = playerZoneSize / 4
            self.data.paddleStart[i] = i * playerZoneSize + playerPaddleSize * 1.5

        self.data.save()
        print("zone size", playerZoneSize, file=sys.stderr)

        self.game = Game_PongMulti()
        self.game.save()
        for ID in playerIDlist:
            user = get_object_or_404(User, id=ID)
            if user:
                self.game.playerlist.add(user)
        self.game.data = self.data
        self.id = self.game.id
        self.game.save()
        all_data[self.game.id] = self.data
        all_data[self.id] = self.data
        playerIDlist.clear()
        return self.game

    @database_sync_to_async
    def stop_game(self):
        from app.models import User, Game_PongMulti, PongMultiDataGame
        print("asking for the end of the game", file=sys.stderr)
        self.should_calcul_ball = False
        if (self.data.active_players == 1):
            for i in range(self.data.nb_players):
                if (self.data.lifes[i] > 0):
                    user = get_object_or_404(User, id=self.data.playerid_table[i])
                    if user:
                        self.game.winner = user
                        self.game.save()
        print("[END GAME] -", self.game.winner, "WON", file=sys.stderr)

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
                'paddles': all_data[self.game.id].paddleStart,
                'lifes' : all_data[self.game.id].lifes,
            }
        )

    async def send_death_signal(self, dead_id):
        await self.channel_layer.group_send(
            "pong_multi_" + str(self.game.id),
            {
                'type': 'update_after_death',
                'dead_id': dead_id,
                'active_players': all_data[self.game.id].active_players,
            }
        )
    
    async def update_after_death(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    async def calc_paddle_collision(self, playerPaddleSize, startAngle, endAngle, ballAngle):
        global baseSpeed

        print("[COLLISION PADDLE !!!]", file=sys.stderr)

        relativeAngle = (((startAngle +(playerPaddleSize/2)) - ballAngle)/(playerPaddleSize/2))
        bounceAngle = relativeAngle * (5*math.pi)

        all_data[self.id].ball_dx = -(baseSpeed * math.cos(bounceAngle))
        all_data[self.id].ball_dy = -(baseSpeed * -math.sin(bounceAngle))
        baseSpeed += baseSpeed * (5/100)

    async def calcul_ball(self):
        global arenaWidth, arenaLength, thickness, ringRadius, ballRadius, paddleRadius, paddleWidth, paddleHeight, baseSpeed, nbrHit, all_data, playerZoneSize

        await asyncio.sleep(4)

        playerZoneSize = (2 * math.pi) / self.data.active_players
        playerPaddleSize = (2 * math.pi) / self.data.active_players / 4

        while self.should_calcul_ball:
            await asyncio.sleep(0.01)  # Wait for 0.01 second
            all_data[self.id].ball_x += all_data[self.id].ball_dx
            all_data[self.id].ball_y += all_data[self.id].ball_dy
            await self.send_updates()

            # COLLISION AVEC LES PADDLES
            calc_dx = (arenaLength / 2) - all_data[self.id].ball_x
            calc_dy = (arenaWidth / 2) - all_data[self.id].ball_y
            distance = math.sqrt(calc_dx * calc_dx + calc_dy * calc_dy)

            if (distance > paddleRadius - ballRadius):
                ballAngle = math.atan2(all_data[self.id].ball_y - arenaWidth/2, all_data[self.id].ball_x - arenaLength/2)
                
                for i in range(self.data.nb_players):
                    if ( self.data.lifes[i] > 0):
                        startAngle = self.data.paddleStart[i] % (2 * math.pi)
                        endAngle = (self.data.paddleStart[i] + playerPaddleSize) % (2 * math.pi)
                        ballAngle = ballAngle % (2 * math.pi)

                        if (startAngle <= endAngle):
                            if (ballAngle >= startAngle and ballAngle <= endAngle):
                                await self.calc_paddle_collision(playerPaddleSize, startAngle, endAngle, ballAngle)
                                break
                        else:
                            if (ballAngle >= startAngle or ballAngle <= endAngle):
                                await self.calc_paddle_collision(playerPaddleSize, startAngle, endAngle, ballAngle)
                                break

            # COLLISION AVEC LE CERCLE ET MARQUAGE
            calc_dx = (arenaLength / 2) - all_data[self.id].ball_x
            calc_dy = (arenaWidth / 2) - all_data[self.id].ball_y
            distance = math.sqrt(calc_dx * calc_dx + calc_dy * calc_dy)

            if (distance > ringRadius):
                ballAngle = math.atan2(all_data[self.id].ball_y - arenaWidth/2, all_data[self.id].ball_x - arenaLength/2)

                for i in range(self.data.nb_players):
                    if ( self.data.lifes[i] > 0):
                        startAngle = self.data.zoneStart[i] % (2 * math.pi)
                        endAngle = (self.data.zoneStart[i] + playerZoneSize) % (2 * math.pi)
                        ballAngle = ballAngle % (2 * math.pi)

                        # print("[DEBUG]", ballAngle, startAngle, endAngle, file=sys.stderr)
                        if (startAngle <= endAngle):
                            if (ballAngle >= startAngle and ballAngle <= endAngle):
                                if (self.data.lifes[i] > 0):
                                    self.data.lifes[i] -= 1
                                    # print("[BUUUUUUUUUUT !!!]", "player:", i+1, "lifes:", self.data.lifes[i], file=sys.stderr)
                                    if (self.data.lifes[i] == 0 and self.data.active_players > 1):
                                        await self.player_is_dead(i)
                                all_data[self.id].ball_dx = -all_data[self.id].ball_dx
                                all_data[self.id].ball_dy = -all_data[self.id].ball_dy
                                break
                        else:
                            if (ballAngle >= startAngle or ballAngle <= endAngle):
                                if (self.data.lifes[i] > 0):
                                    self.data.lifes[i] -= 1
                                    # print("[BUUUUUUUUUUT !!!]", "player:", i+1, "lifes:", self.data.lifes[i], file=sys.stderr)
                                    if (self.data.lifes[i] == 0 and self.data.active_players > 1):
                                        await self.player_is_dead(i)
                                all_data[self.id].ball_dx = -all_data[self.id].ball_dx
                                all_data[self.id].ball_dy = -all_data[self.id].ball_dy
                                break
    
    async def player_is_dead(self, dead):
        global playerZoneSize, baseSpeed

        print("player:", dead+1, "is DEAD", file=sys.stderr)
        self.data.active_players -= 1
        baseSpeed = 0.5

        # CALCUL TAILLE ET START DES ZONES
        if (self.data.active_players >= 2):
            playerZoneSize = (2 * math.pi) / self.data.active_players
        # print("zone size", playerZoneSize, file=sys.stderr)

        it = 0
        index = 0
        while (it < self.data.active_players):
            if (self.data.lifes[index] > 0):
                self.data.zoneStart[index] =  it * playerZoneSize
                # print("zone start of", index+1, "is", self.data.zoneStart[index], file=sys.stderr)
                it += 1
            index += 1

        self.should_calcul_ball = False
        all_data[self.game.id].ball_x = arenaLength / 2
        all_data[self.game.id].ball_y = arenaWidth / 2
        self.send_updates()
        await self.send_death_signal(dead)
        await asyncio.sleep(2)

        if (self.data.active_players == 1):
            await self.stop_game()
        else:
            self.should_calcul_ball = True

    def move_paddle(self, move, player):
        global all_data
        if (move == 'up'):
                all_data[self.game.id].paddleStart[player] += 0.05
        if (move == 'down'):
                all_data[self.game.id].paddleStart[player] -= 0.05
        
    
    async def game_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))
