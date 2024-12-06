import sys  # for print
import random
import asyncio
from asgiref.sync import sync_to_async, async_to_sync
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from channels.db import database_sync_to_async
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import os
from pathlib import Path
import torch

BASE_DIR = Path(__file__).resolve().parent.parent.parent

model_path = os.path.join(BASE_DIR, 'static', 'ai_datasets', 'model_supervised.pth')

arenaWidth = 100
arenaLength = 150
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5
winningScore = 5

all_data = {}

class PolicyNetwork(nn.Module):
    def __init__(self, input_size=5, hidden_size=64, output_size=1):
        super(PolicyNetwork, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.fc3 = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        x = self.fc3(x)
        return x

network = PolicyNetwork()
optimizer = optim.Adam(network.parameters(), lr=1e-3)

network.load_state_dict(torch.load(model_path, weights_only=True))
network.eval()

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
        self.paddle2_target_y = arenaWidth / 2
        self.nbrHit = 0

@async_to_sync
async def launch_ai_game(id):
    global all_data

    print("[LAUNCH GAME]", id, file=sys.stderr)
    all_data[id] = PongData()
    asyncio.create_task(calcul_ai_ball(id))

async def get_state(data):
    bx = data.ball_x / arenaLength
    by = data.ball_y / arenaWidth
    bdx = data.ball_dx
    bdy = data.ball_dy
    py = data.paddle2_y / arenaWidth
    return np.array([bx, by, bdx, bdy, py])

async def get_target_y_from_network(network, state):
    with torch.no_grad():
        state_tensor = torch.tensor(state, dtype=torch.float32).unsqueeze(0)
        y_pred = network(state_tensor)
        return y_pred.item()

# async def get_ai_paddle_target_position(pong_data):
#     target_y = pong_data.ball_y
#     return target_y

async def calcul_ai_ball(id):
    global arenaWidth, arenaLength, thickness, ballRadius, paddleWidth, paddleHeight, baseSpeed, winningScore, all_data

    await asyncio.sleep(1)
    await send_ai_countdown("3", id)
    await asyncio.sleep(1)
    await send_ai_countdown("2", id)
    await asyncio.sleep(1)
    await send_ai_countdown("1", id)
    await asyncio.sleep(1)
    await send_ai_countdown("GO", id)
    await asyncio.sleep(1)


    last_ai_update_time = asyncio.get_event_loop().time()
    ai_update_interval = 1.0
    i = 0;

    while True:
        await asyncio.sleep(0.01)
        i+=1
        current_time = asyncio.get_event_loop().time()
        if current_time - last_ai_update_time >= ai_update_interval:
            print("Iteration", i, file=sys.stderr)
            i = 0;
            last_ai_update_time = current_time
            state = await get_state(all_data[id])
            target_y = await get_target_y_from_network(network, state)
            all_data[id].paddle2_target_y = target_y
            print("[AI TARGET Y]", target_y, file=sys.stderr)
            print("[AI PADDLE Y]", all_data[id].paddle2_target_y, file=sys.stderr)

        all_data[id].ball_x += all_data[id].ball_dx
        all_data[id].ball_y += all_data[id].ball_dy

        if all_data[id].paddle2_y + 1 < all_data[id].paddle2_target_y:
            all_data[id].player2_up = True
            all_data[id].player2_down = False
        elif all_data[id].paddle2_y - 1 > all_data[id].paddle2_target_y:
            all_data[id].player2_up = False
            all_data[id].player2_down = True
        else:
            all_data[id].player2_up = False
            all_data[id].player2_down = False

        paddle_speed = 0.6
        if (all_data[id].player1_up and all_data[id].paddle1_y + paddle_speed < arenaWidth - thickness / 2 - paddleHeight / 2):
            all_data[id].paddle1_y += paddle_speed
        if (all_data[id].player1_down and all_data[id].paddle1_y - paddle_speed > thickness / 2 + paddleHeight / 2):
            all_data[id].paddle1_y -= paddle_speed
        if (all_data[id].player2_up and all_data[id].paddle2_y + paddle_speed < arenaWidth - thickness / 2 - paddleHeight / 2):
            all_data[id].paddle2_y += paddle_speed
        if (all_data[id].player2_down and all_data[id].paddle2_y - paddle_speed > thickness / 2 + paddleHeight / 2):
            all_data[id].paddle2_y -= paddle_speed

        await send_updates(id)

        if (all_data[id].ball_y + all_data[id].ball_dy > arenaWidth - thickness/2 - ballRadius or all_data[id].ball_y + all_data[id].ball_dy < thickness/2 + ballRadius ):
            print("[PONG WALL]", file=sys.stderr)
            await send_ai_bump('wall', 0, id)
            all_data[id].ball_dy = -all_data[id].ball_dy

        if (all_data[id].ball_x > arenaLength - thickness * 2):
            if (all_data[id].ball_y > all_data[id].paddle2_y - paddleHeight / 2 and all_data[id].ball_y < all_data[id].paddle2_y + paddleHeight / 2):
                all_data[id].nbrHit += 1
                await send_ai_bump('paddle', 2, id)
                all_data[id].ball_dx = -baseSpeed - (0.02 * all_data[id].nbrHit)
                hitPos = all_data[id].ball_y - all_data[id].paddle2_y
                all_data[id].ball_dy = hitPos * 0.15
            else:
                await ai_goal('player1', id)
                if (all_data[id].score_player1 == winningScore or all_data[id].score_player2 == winningScore):
                    await stop_ai_game(id)
                    return

        if (all_data[id].ball_x < thickness * 2):
            if (all_data[id].ball_y > all_data[id].paddle1_y - paddleHeight / 2 and all_data[id].ball_y < all_data[id].paddle1_y + paddleHeight / 2):
                all_data[id].nbrHit += 1
                await send_ai_bump('paddle', 1, id)
                all_data[id].ball_dx = baseSpeed + (0.02 * all_data[id].nbrHit)
                hitPos = all_data[id].ball_y - all_data[id].paddle1_y
                all_data[id].ball_dy = hitPos * 0.15
            else:
                await ai_goal('player2', id)
                if (all_data[id].score_player1 == winningScore or all_data[id].score_player2 == winningScore):
                    await stop_ai_game(id)
                    return

async def send_ai_countdown(countdown, id):
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "ai_pong_" + str(id),
        {
            'type': 'countdown',
            'countdown': countdown
        }
    )

async def send_ai_bump(obj, player, id):
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "ai_pong_" + str(id),
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
        "ai_pong_" + str(id),
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

async def stop_ai_game(id):
    global all_data

    game = await get_ai_game(id)

    await send_updates(id)

    await save_ai_winner(id)
    player = await get_username_of_game(id)
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "ai_pong_" + str(id),
        {
            'type': 'end_game',
            'score_player1': all_data[id].score_player1,
            'score_player2': all_data[id].score_player2,
            'player1': player,
        }
    )

    print("[STOP GAME] GAME STOPPED", id, file=sys.stderr)

@database_sync_to_async
def get_ai_game(id):
    from app.models import Game_Pong

    return get_object_or_404(Game_Pong, id=id)

@database_sync_to_async
def get_username_of_game(game_id):
    from app.models import Game_Pong

    game = get_object_or_404(Game_Pong, id=game_id)
    return game.player1.username

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

async def ai_goal(player, id):
    global all_data, arenaWidth, arenaLength

    if (player == 'player1'):
        all_data[id].score_player1 += 1
    else:
        all_data[id].score_player2 += 1
    all_data[id].nbrHit = 0
    await send_updates(id)
    await send_ai_bump('ball', 0, id)
    await asyncio.sleep(0.5)
    all_data[id].ball_dy = random.random() - 0.5
    all_data[id].ball_dx = random.choice([0.5, -0.5])
    all_data[id].ball_x = arenaLength / 2
    all_data[id].ball_y = arenaWidth / 2

@database_sync_to_async
def save_ai_winner(id):
    from app.models import Game_Pong, User
    import app.consumers.utils.user_utils as user_utils

    global winningScore, all_data

    game = get_object_or_404(Game_Pong, id=id)

    game.player1_rank = game.player1.pong_rank

    if (game.player1.state == User.State.INGAME):
        game.player1.state = User.State.ONLINE
    game.player1.game_status_url = 'none'
    game.player1.game_status_txt = 'none'

    user_utils.send_change_state(game.player1)

    game.player1.save()

    game.player1_score = all_data[id].score_player1
    game.player2_score = all_data[id].score_player2
    if (all_data[id].score_player1 == winningScore):
        game.winner = game.player1

    game.save()
