import sys #for print
import random
import asyncio
from asgiref.sync import sync_to_async, async_to_sync
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from channels.db import database_sync_to_async

arenaWidth = 100
arenaLength = 150
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5
nbrHit = 0
winningScore = 1

all_data = {}

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
        self.player1_up = False
        self.player1_down = False
        self.player2_up = False
        self.player2_down = False


@async_to_sync
async def launch_game(id):
    global all_data

    print("[LAUNCH GAME]", id, file=sys.stderr)
    all_data[id] = PongData()
    asyncio.create_task(calcul_ball(id))

@async_to_sync
async def launch_ai_game(id):
    global all_data

    print("[LAUNCH AI GAME]", id, file=sys.stderr)
    all_data[id] = PongData()
    asyncio.create_task(calcul_ball(id))

async def send_ai_updates(id):
    global all_data

    await asyncio.sleep(1)
    # send ai updates
    target_y = all_data[id].ball_y
    if all_data[id].paddle2_y < target_y:
        move_paddle("up", False, 2, id)
        move_paddle("down", True, 2, id)
    elif all_data[id].paddle2_y > target_y:
        move_paddle("down", False, 2, id)
        move_paddle("up", True, 2, id)


async def calcul_ball(id):
    global arenaWidth, arenaLength, thickness, ballRadius, paddleWidth, paddleHeight, baseSpeed, nbrHit, all_data, winningScore

    await asyncio.sleep(1)
    await send_countdown("3", id)
    await asyncio.sleep(1)
    await send_countdown("2", id)
    await asyncio.sleep(1)
    await send_countdown("1", id)
    await asyncio.sleep(1)
    await send_countdown("GO", id)
    await asyncio.sleep(1)

    
    while True:
        await asyncio.sleep(0.01)  # Wait for 0.01 second
        asyncio.create_task(send_ai_updates(id))

        all_data[id].ball_x += all_data[id].ball_dx
        all_data[id].ball_y += all_data[id].ball_dy

        # Gestion des mouvements des paddles
        if (all_data[id].player1_up  and all_data[id].paddle1_y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2):
            all_data[id].paddle1_y += 0.6
        if (all_data[id].player1_down and all_data[id].paddle1_y - 0.6 > thickness / 2 + paddleHeight / 2):
            all_data[id].paddle1_y -= 0.6
        if (all_data[id].player2_up and all_data[id].paddle2_y - 0.6 > thickness / 2 + paddleHeight / 2):
            all_data[id].paddle2_y -= 0.6
        if (all_data[id].player2_down and all_data[id].paddle2_y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2):
            all_data[id].paddle2_y += 0.6

        await send_updates(id)

        # Gestion des collisions avec les murs
        if (all_data[id].ball_y + all_data[id].ball_dy > arenaWidth - thickness/2 - ballRadius or all_data[id].ball_y + all_data[id].ball_dy < thickness/2 + ballRadius ):
            print("[PONG WALL]", file=sys.stderr)
            await send_bump('wall', 0, id)
            all_data[id].ball_dy = -all_data[id].ball_dy

        # Gestion des collisions avec les paddles
        if (all_data[id].ball_x > arenaLength - thickness * 2):
            if (all_data[id].ball_y > all_data[id].paddle2_y - paddleHeight / 2 and all_data[id].ball_y < all_data[id].paddle2_y + paddleHeight / 2):
                nbrHit += 1
                await send_bump('paddle', 2, id)
                all_data[id].ball_dx = -baseSpeed - (0.02 * nbrHit)
                hitPos = all_data[id].ball_y - all_data[id].paddle2_y
                all_data[id].ball_dy = hitPos * 0.15
            else:
                await goal('player1', id)
                if (all_data[id].score_player1 == winningScore or all_data[id].score_player2 == winningScore):
                    await stop_game(id)
                    return

        if (all_data[id].ball_x < thickness * 2):
            if (all_data[id].ball_y > all_data[id].paddle1_y - paddleHeight / 2 and all_data[id].ball_y < all_data[id].paddle1_y + paddleHeight / 2):
                nbrHit += 1
                await send_bump('paddle', 1, id)
                all_data[id].ball_dx = baseSpeed + (0.02 * nbrHit)
                hitPos = all_data[id].ball_y - all_data[id].paddle1_y
                all_data[id].ball_dy = hitPos * 0.15
            else:
                await goal('player2' ,id)
                if (all_data[id].score_player1 == winningScore or all_data[id].score_player2 == winningScore):
                    await stop_game(id)
                    return




async def send_countdown(countdown, id):
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "ranked_pong_" + str(id),
        {
            'type': 'countdown',
            'countdown': countdown
        }
    )

async def send_bump(obj, player, id):
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "ranked_pong_" + str(id),
        {
            'type': 'bump',
            'x': all_data[id].ball_x,
            'y': all_data[id].ball_y,
            'object': obj,
            'player': player
        }
    )

async def send_updates(id):
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "ranked_pong_" + str(id),
        {
            'type': 'game_update',
            'x': all_data[id].ball_x,
            'y': all_data[id].ball_y,
            'dx': all_data[id].ball_dx,
            'dy': all_data[id].ball_dy,
            'paddle1_y': all_data[id].paddle1_y,
            'paddle2_y': all_data[id].paddle2_y,
            'score_player1': all_data[id].score_player1,
            'score_player2': all_data[id].score_player2
        }
    )


async def stop_game(id):
    global all_data

    game = await get_game(id)
    
    await send_updates(id) # Send final update for the score
    win_elo = await save_winner(id)
    player = await get_username_of_game(id)
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "ranked_pong_" + str(id),
        {
            'type': 'end_game',
            'score_player1': all_data[id].score_player1,
            'score_player2': all_data[id].score_player2,
            'player1' : player[0],
            'player2' : player[1],
            'win_elo_p1': win_elo['win_elo_p1'],
            'win_elo_p2': win_elo['win_elo_p2']
        }
    )
    if (game.tournament_pos != -1):
        await update_tournament(id) 


@database_sync_to_async
def get_game(id):
    from app.models import Game_Pong

    return get_object_or_404(Game_Pong, id=id)

@database_sync_to_async
def get_username_of_game(game_id):
    from app.models import Game_Pong

    game = get_object_or_404(Game_Pong, id=game_id)
    return game.player1.username, game.player2.username


async def move_paddle(move, pressed, player, id):
    global all_data, arenaWidth, paddleHeight

    if (player == 1):
        if (move == 'up' and pressed):
            all_data[id].player1_up = True
        if (move == 'down' and pressed):
            all_data[id].player1_down = True
        if (move == 'up' and not pressed):
            all_data[id].player1_up = False
        if (move == 'down' and not pressed):
            all_data[id].player1_down = False
    if (player == 2):
        if (move == 'up' and pressed):
            all_data[id].player2_up = True
        if (move == 'down' and pressed):
            all_data[id].player2_down = True
        if (move == 'up' and not pressed):
            all_data[id].player2_up = False
        if (move == 'down' and not pressed):
            all_data[id].player2_down = False


async def goal(player, id):
    global all_data, nbrHit, arenaWidth, arenaLength

    if (player == 'player1'):
        all_data[id].score_player1 += 1
    else:
        all_data[id].score_player2 += 1
    nbrHit = 0
    await send_updates(id)
    await send_bump('ball', 0, id)
    await asyncio.sleep(0.5)
    all_data[id].ball_dy = random.random() - 0.5
    all_data[id].ball_dx = random.choice([0.5, -0.5])
    all_data[id].ball_x = arenaLength / 2
    all_data[id].ball_y = arenaWidth / 2


@database_sync_to_async
def save_winner(id):
    from app.models import Game_Pong, User
    import app.consumers.utils.user_utils as user_utils
    
    global winningScore, all_data

    game = get_object_or_404(Game_Pong, id=id)

    # calcul elo
    proba_win_p1 = 1 / (1 + 10 ** ((game.player2.pong_rank - game.player1.pong_rank) / 400))
    proba_win_p2 = 1 / (1 + 10 ** ((game.player1.pong_rank - game.player2.pong_rank) / 400))
    if (all_data[id].score_player1 == winningScore):
        win_elo_p1 = round(20 * (1 - proba_win_p1))
        win_elo_p2 = round(20 * (0 - proba_win_p2))
    elif (all_data[id].score_player2 == winningScore):
        win_elo_p1 = round(20 * (0 - proba_win_p1))
        win_elo_p2 = round(20 * (1 - proba_win_p2))
    game.player1_rank = game.player1.pong_rank
    game.player2_rank = game.player2.pong_rank
    game.player1_rank_win += win_elo_p1
    game.player2_rank_win += win_elo_p2
    game.player1.pong_rank += win_elo_p1
    game.player2.pong_rank += win_elo_p2

    # change state of player
    if (game.player1.state == User.State.INGAME):
        game.player1.state = User.State.ONLINE
    if (game.player2.state == User.State.INGAME):
        game.player2.state = User.State.ONLINE
    game.player1.game_status_url = 'none'
    game.player1.game_status_txt = 'none'
    game.player2.game_status_url = 'none'
    game.player2.game_status_txt = 'none'

    user_utils.send_change_state(game.player1)
    user_utils.send_change_state(game.player2)

    game.player1.save()
    game.player2.save()
    
    game.player1_score = all_data[id].score_player1
    game.player2_score = all_data[id].score_player2
    if (all_data[id].score_player1 == winningScore):
        game.winner = game.player1
    elif (all_data[id].score_player2 == winningScore):
        game.winner = game.player2        
    game.save()
    return ({'win_elo_p1': win_elo_p1, 'win_elo_p2': win_elo_p2})


@database_sync_to_async
def update_tournament(id):
    from app.models import Tournament, Game_Pong

    # GET TOURNAMENT OBJ
    game = get_object_or_404(Game_Pong, id=id)
    bracket_id = game.player1.tournament_id
    print("UPDATING TOURNAMENT", bracket_id, file=sys.stderr)
    tournament = get_object_or_404(Tournament, id=bracket_id)

    # ADD LOSER TO RESULTS
    if game.winner == game.player1:
        if game.player2.id not in tournament.results:
            tournament.results.append(game.player2.id)
            tournament.save()
    elif game.winner == game.player2:
        if game.player1.id not in tournament.results:
            tournament.results.append(game.player1.id)
            tournament.save()

    # GET GAME POSITION IN TOURNAMENT
    game_position = game.tournament_pos
    if (game_position % 2 == 1):
        new_game_pos = game_position // 100 * 100 + 100 + (game_position % 100 + 1) // 2
    else :
        new_game_pos = game_position // 100 * 100 + 100 + game_position % 100 // 2
    # GET GAME WITH THIS POS
    next_game = None
    for game_obj in tournament.pong_matchs.all():
        if (game_obj.tournament_pos == new_game_pos):
            next_game = game_obj
    # IF NOT FOUND HE WON TOURNAMENT
    if next_game == None:
        tournament.winner = game.winner
        tournament.results.append(game.winner.id)
        tournament.save()
        print("UPDATING TOURNAMENT:", game.winner, "WON THE TOURNAMENT", file=sys.stderr)
    else:
        # PUT WINNER IN THE GAME
        if (not next_game.player1):
            next_game.player1 = game.winner
        elif (not next_game.player2):
            next_game.player2 = game.winner
            # send ws tournament game ready
            pong_tournament_game_ready(next_game)
        print("UPDATING TOURNAMENT:", game.winner, "will play in game_pos ", new_game_pos, file=sys.stderr)
        next_game.save()
    
    # UPDATE BARCKET (PAS SUR CA MARCHE LA)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "pong_tournament_" + str(game.player1.tournament_id),
        {
            "type": "update_room",
        }
    )

def pong_tournament_game_ready(game):
    from django.db.models import Q
    from app.models import Invite

    print("[TOURNAMENT] GAME READY", file=sys.stderr)
    channel_layer = get_channel_layer()
    print("[TOURNAMENT] SENDING WS TO", game.player1.username, "AND", game.player2.username, file=sys.stderr)

    # CREATE INVITATION
    new_invite = Invite()
    new_invite.to_user = game.player1
    new_invite.game_type = Invite.GameType.PONG
    new_invite.for_tournament = True
    new_invite.game_id = game.id
    new_invite.save()

    new_invite = Invite()
    new_invite.to_user = game.player2
    new_invite.game_type = Invite.GameType.PONG
    new_invite.for_tournament = True
    new_invite.game_id = game.id
    new_invite.save()

    async_to_sync(channel_layer.group_send)(
        game.player1.username,
        {
            'type': 'send_ws',
            'type2': 'invite',
            'game': 'pong',
            'player': game.player2.username,
            'id': new_invite.id,
            'game_id': game.id
        }
    )

    async_to_sync(channel_layer.group_send)(
        game.player2.username,
        {
            'type': 'send_ws',
            'type2': 'invite',
            'game': 'pong',
            'player': game.player1.username,
            'id': new_invite.id,
            'game_id': game.id
        }
    )
    