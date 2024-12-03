import sys #for print
import random
import asyncio, math
from asgiref.sync import sync_to_async, async_to_sync
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from channels.db import database_sync_to_async

all_multi_data = {}

arenaWidth = 100
arenaLength = 150

ringRadius = 50
paddleRadius = ringRadius - 3
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5

class PongMultiData():
    def __init__(self, nb):
        self.nb_players = nb
        self.active_players = nb

        self.should_calcul_ball = True

        self.ball_dy = random.random() - 0.5
        self.ball_dx = random.choice([0.5, -0.5])
        self.ball_x = arenaLength / 2
        self.ball_y = arenaWidth / 2

        self.zoneStart = [0] * self.nb_players
        self.paddleStart = [0] * self.nb_players
        self.lifes = [2] * self.nb_players
        self.playerid_table = [0] * self.nb_players

        self.playerZoneSize = (2 * math.pi) / self.nb_players
        self.playerPaddleSize = self.playerZoneSize / 4


@async_to_sync
async def launch_multi_game(id, playerlist):
    global all_multi_data

    if (len(playerlist) == 0):
        print("[MULTI PLAYERLIST ERROR]", len(playerlist), file=sys.stderr)
        return 
    
    print("[LAUNCH Multi GAME]", id, len(playerlist), file=sys.stderr)
    all_multi_data[id] = PongMultiData(len(playerlist))

    i = 0
    for user in playerlist:
        all_multi_data[id].playerid_table[i] = user.id
        i += 1

    for i in range(all_multi_data[id].nb_players):
        all_multi_data[id].zoneStart[i] = i * all_multi_data[id].playerZoneSize
        all_multi_data[id].paddleStart[i] = i * all_multi_data[id].playerZoneSize + all_multi_data[id].playerPaddleSize * 1.5

    print("zone size", all_multi_data[id].playerZoneSize, file=sys.stderr)

    asyncio.create_task(multi_calcul_ball(id))




async def calc_paddle_collision(id, startAngle, endAngle, ballAngle):
    global baseSpeed, all_multi_data

    print("[COLLISION PADDLE !!!]", file=sys.stderr)

    relativeAngle = (((startAngle +(all_multi_data[id].playerPaddleSize /2)) - ballAngle)/(all_multi_data[id].playerPaddleSize /2))
    bounceAngle = relativeAngle * (5*math.pi)

    all_multi_data[id].ball_dx = -(baseSpeed * math.cos(bounceAngle))
    all_multi_data[id].ball_dy = -(baseSpeed * -math.sin(bounceAngle))
    baseSpeed += baseSpeed * (5/100)


async def multi_calcul_ball(id):
        global arenaWidth, arenaLength, thickness, ringRadius, ballRadius, paddleRadius, paddleWidth, paddleHeight, baseSpeed, nbrHit

        await asyncio.sleep(4)

        all_multi_data[id].playerZoneSize = (2 * math.pi) / all_multi_data[id].active_players
        all_multi_data[id].playerPaddleSize = (2 * math.pi) / all_multi_data[id].active_players / 4

        while all_multi_data[id].should_calcul_ball:
            await asyncio.sleep(0.01)  # Wait for 0.01 second
            all_multi_data[id].ball_x += all_multi_data[id].ball_dx
            all_multi_data[id].ball_y += all_multi_data[id].ball_dy
            await send_updates(id)

            # COLLISION AVEC LES PADDLES
            calc_dx = (arenaLength / 2) - all_multi_data[id].ball_x
            calc_dy = (arenaWidth / 2) - all_multi_data[id].ball_y
            distance = math.sqrt(calc_dx * calc_dx + calc_dy * calc_dy)

            if (distance > paddleRadius - ballRadius):
                ballAngle = math.atan2(all_multi_data[id].ball_y - arenaWidth/2, all_multi_data[id].ball_x - arenaLength/2)
                
                for i in range(all_multi_data[id].nb_players):
                    if ( all_multi_data[id].lifes[i] > 0):
                        startAngle = all_multi_data[id].paddleStart[i] % (2 * math.pi)
                        endAngle = (all_multi_data[id].paddleStart[i] + all_multi_data[id].playerPaddleSize) % (2 * math.pi)
                        ballAngle = ballAngle % (2 * math.pi)

                        if (startAngle <= endAngle):
                            if (ballAngle >= startAngle and ballAngle <= endAngle):
                                await calc_paddle_collision(id, startAngle, endAngle, ballAngle)
                                break
                        else:
                            if (ballAngle >= startAngle or ballAngle <= endAngle):
                                await calc_paddle_collision(id, startAngle, endAngle, ballAngle)
                                break

            # COLLISION AVEC LE CERCLE ET MARQUAGE
            calc_dx = (arenaLength / 2) - all_multi_data[id].ball_x
            calc_dy = (arenaWidth / 2) - all_multi_data[id].ball_y
            distance = math.sqrt(calc_dx * calc_dx + calc_dy * calc_dy)

            if (distance > ringRadius):
                ballAngle = math.atan2(all_multi_data[id].ball_y - arenaWidth/2, all_multi_data[id].ball_x - arenaLength/2)

                for i in range(all_multi_data[id].nb_players):
                    if ( all_multi_data[id].lifes[i] > 0):
                        startAngle = all_multi_data[id].zoneStart[i] % (2 * math.pi)
                        endAngle = (all_multi_data[id].zoneStart[i] + all_multi_data[id].playerZoneSize) % (2 * math.pi)
                        ballAngle = ballAngle % (2 * math.pi)

                        # print("[DEBUG]", ballAngle, startAngle, endAngle, file=sys.stderr)
                        if (startAngle <= endAngle):
                            if (ballAngle >= startAngle and ballAngle <= endAngle):
                                if (all_multi_data[id].lifes[i] > 0):
                                    all_multi_data[id].lifes[i] -= 1
                                    # print("[BUUUUUUUUUUT !!!]", "player:", i+1, "lifes:", all_multi_data[id].lifes[i], file=sys.stderr)
                                    if (all_multi_data[id].lifes[i] == 0 and all_multi_data[id].active_players > 1):
                                        await player_is_dead(id, i)
                                all_multi_data[id].ball_dx = -all_multi_data[id].ball_dx
                                all_multi_data[id].ball_dy = -all_multi_data[id].ball_dy
                                break
                        else:
                            if (ballAngle >= startAngle or ballAngle <= endAngle):
                                if (all_multi_data[id].lifes[i] > 0):
                                    all_multi_data[id].lifes[i] -= 1
                                    # print("[BUUUUUUUUUUT !!!]", "player:", i+1, "lifes:", all_multi_data[id].lifes[i], file=sys.stderr)
                                    if (all_multi_data[id].lifes[i] == 0 and all_multi_data[id].active_players > 1):
                                        await player_is_dead(id, i)
                                all_multi_data[id].ball_dx = -all_multi_data[id].ball_dx
                                all_multi_data[id].ball_dy = -all_multi_data[id].ball_dy
                                break
    
async def player_is_dead(id, dead):
        global baseSpeed, all_multi_data

        print("player:", dead+1, "is DEAD", file=sys.stderr)
        all_multi_data[id].active_players -= 1
        baseSpeed = 0.5

        # CALCUL TAILLE ET START DES ZONES
        if (all_multi_data[id].active_players >= 2):
            all_multi_data[id].playerZoneSize = (2 * math.pi) / all_multi_data[id].active_players
        # print("zone size", all_multi_data[id].playerZoneSize, file=sys.stderr)

        it = 0
        index = 0
        while (it < all_multi_data[id].active_players):
            if (all_multi_data[id].lifes[index] > 0):
                all_multi_data[id].zoneStart[index] =  it * all_multi_data[id].playerZoneSize
                # print("zone start of", index+1, "is", all_multi_data[id].zoneStart[index], file=sys.stderr)
                it += 1
            index += 1

        all_multi_data[id].should_calcul_ball = False
        all_multi_data[id].ball_x = arenaLength / 2
        all_multi_data[id].ball_y = arenaWidth / 2
        send_updates(id)
        await send_death_signal(id, dead)
        await asyncio.sleep(2)

        if (all_multi_data[id].active_players == 1):
            await stop_game(id)
        else:
            all_multi_data[id].should_calcul_ball = True


@database_sync_to_async
def stop_game(id):
    from app.models import User, Game_PongMulti
    print("asking for the end of the game", file=sys.stderr)
    all_multi_data[id].should_calcul_ball = False

    game = get_object_or_404(Game_PongMulti, id=id)

    if (all_multi_data[id].active_players == 1):
        for i in range(all_multi_data[id].nb_players):
            if (all_multi_data[id].lifes[i] > 0):
                user = get_object_or_404(User, id=all_multi_data[id].playerid_table[i])
                if user:
                    game.winner = user
                    game.save()
    print("[END GAME] -", game.winner, "WON", file=sys.stderr)


async def send_updates(id):
    # print("[SEND UPDATES 2]", file=sys.stderr)
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "pong_multi_" + str(id),
        {
            'type': 'game_update',
            'x': all_multi_data[id].ball_x,
            'y': all_multi_data[id].ball_y,
            'dx': all_multi_data[id].ball_dx,
            'dy': all_multi_data[id].ball_dy,
            'paddles': all_multi_data[id].paddleStart,
            'lifes' : all_multi_data[id].lifes,
            'active_players': all_multi_data[id].active_players,
        }
    )

async def send_death_signal(id, dead_id):
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "pong_multi_" + str(id),
        {
            'type': 'update_after_death',
            'dead_id': dead_id,
            'active_players': all_multi_data[id].active_players,
        }
    )

