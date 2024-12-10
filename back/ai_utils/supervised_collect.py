import random
import sys
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader


arenaWidth = 100
arenaLength = 150
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5
nbrHit = 0

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
SCALE_FACTOR_X = SCREEN_WIDTH / arenaLength
SCALE_FACTOR_Y = SCREEN_HEIGHT / arenaWidth
MODE = "COlLECT"

class PongData:
    def __init__(self):
        self.id = 0
        self.ball_dy = random.random() - 0.5
        self.ball_dx = random.choice([0.5, -0.5])
        self.ball_x = arenaLength / 2
        self.ball_y = arenaWidth / 2
        self.paddle1_y = arenaWidth / 2
        self.paddle2_y = arenaWidth / 2
        self.score_player1 = 0
        self.score_player2 = 0

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

def get_state(data):
    bx = data.ball_x / arenaLength
    by = data.ball_y / arenaWidth
    bdx = data.ball_dx
    bdy = data.ball_dy
    py = data.paddle2_y / arenaWidth  # Utilisation de paddle2_y
    return np.array([bx, by, bdx, bdy, py])

def get_state_p1(data):
    bx = data.ball_x / arenaLength
    by = data.ball_y / arenaWidth
    bdx = data.ball_dx
    bdy = data.ball_dy
    py = data.paddle1_y / arenaWidth  # Utilisation de paddle2_y
    return np.array([bx, by, bdx, bdy, py])

def move_paddle(direction, player, data_id):
    speed = 0.8
    if player == 1:
        if direction == 'up':
            all_data[data_id].paddle1_y -= speed
            if all_data[data_id].paddle1_y < paddleHeight/2:
                all_data[data_id].paddle1_y = paddleHeight/2
        elif direction == 'down':
            all_data[data_id].paddle1_y += speed
            if all_data[data_id].paddle1_y > arenaWidth - paddleHeight/2:
                all_data[data_id].paddle1_y = arenaWidth - paddleHeight/2
    elif player == 2:
        if direction == 'up':
            all_data[data_id].paddle2_y -= speed
            if all_data[data_id].paddle2_y < paddleHeight/2:
                all_data[data_id].paddle2_y = paddleHeight/2
        elif direction == 'down':
            all_data[data_id].paddle2_y += speed
            if all_data[data_id].paddle2_y > arenaWidth - paddleHeight/2:
                all_data[data_id].paddle2_y = arenaWidth - paddleHeight/2

def goal(player, id):
    global nbrHit
    nbrHit = 0
    all_data[id].ball_dy = random.random() - 0.5
    all_data[id].ball_dx = random.choice([0.5, -0.5])
    all_data[id].ball_x = arenaLength / 2
    all_data[id].ball_y = arenaWidth / 2
    if player == 'player1':
        all_data[id].score_player1 += 1
    else:
        all_data[id].score_player2 += 1

def updateIA(state):
    bx, by, bdx, bdy, py = state
    
    if bdx >= 0:
        return arenaWidth / 2
    
    sim_x = bx * arenaLength
    sim_y = by * arenaWidth
    sim_dx = bdx
    sim_dy = bdy
    
    while sim_x > thickness*2:
        sim_x += sim_dx
        sim_y += sim_dy
        if sim_y <= ballRadius + thickness/2:
            sim_y = ballRadius + thickness/2
            sim_dy = -sim_dy
        elif sim_y >= arenaWidth - ballRadius - thickness/2:
            sim_y = arenaWidth - ballRadius - thickness/2
            sim_dy = -sim_dy
    
    predicted_y = sim_y
    return predicted_y

def expert_policy(state):
    bx, by, bdx, bdy, py = state
    
    if bdx <= 0:
        return arenaWidth / 2
    
    sim_x = bx * arenaLength
    sim_y = by * arenaWidth
    sim_dx = bdx
    sim_dy = bdy

    paddle_x = arenaLength - thickness*2
    
    while sim_x < paddle_x:
        sim_x += sim_dx
        sim_y += sim_dy
        
        if sim_y <= ballRadius + thickness/2:
            sim_y = ballRadius + thickness/2
            sim_dy = -sim_dy
        elif sim_y >= arenaWidth - ballRadius - thickness/2:
            sim_y = arenaWidth - ballRadius - thickness/2
            sim_dy = -sim_dy
    
    predicted_y = max(ballRadius + thickness/2, min(sim_y, arenaWidth - ballRadius - thickness/2))
    
    return predicted_y

def get_target_y_from_network(network, state):
    with torch.no_grad():
        state_tensor = torch.tensor(state, dtype=torch.float32).unsqueeze(0)
        y_pred = network(state_tensor)
        return y_pred.item()

def calcul_ball(id, mode="COLLECT"):
    global nbrHit
    all_data[id] = PongData()
    done = False
    i = 0
    ai_target_y = all_data[id].paddle1_y
    target_y = all_data[id].paddle2_y
    max_steps = 2000
    total_reward = 0

    states_collected = []
    ys_collected = []

    while not done and i < max_steps:
        ai_target_y = updateIA(get_state_p1(all_data[id]))
        if i % 90 == 0:
            state = get_state(all_data[id])
            target_y = expert_policy(state)
            states_collected.append(state)
            ys_collected.append(target_y)

        if all_data[id].paddle2_y > target_y:
            move_paddle('up', 2, id)
        elif all_data[id].paddle2_y < target_y:
            move_paddle('down', 2, id)

        if all_data[id].paddle1_y > ai_target_y:
            move_paddle('up', 1, id)
        elif all_data[id].paddle1_y < ai_target_y:
            move_paddle('down', 1, id)

        all_data[id].ball_x += all_data[id].ball_dx
        all_data[id].ball_y += all_data[id].ball_dy

        if all_data[id].ball_y + all_data[id].ball_dy > arenaWidth - thickness/2 - ballRadius or all_data[id].ball_y + all_data[id].ball_dy < thickness/2 + ballRadius:
            all_data[id].ball_dy = -all_data[id].ball_dy

        reward = 0
        if all_data[id].ball_x > arenaLength - thickness*2:
            if (all_data[id].ball_y > all_data[id].paddle2_y - paddleHeight / 2 
                and all_data[id].ball_y < all_data[id].paddle2_y + paddleHeight / 2):
                nbrHit += 1
                all_data[id].ball_dx = -baseSpeed - (0.04 * nbrHit)
                hitPos = all_data[id].ball_y - all_data[id].paddle2_y
                all_data[id].ball_dy = hitPos * 0.15
            else:
                goal('player1', id)
                reward += 0.1
                done = True
        
        if all_data[id].ball_x < thickness*2:
            if (all_data[id].ball_y > all_data[id].paddle1_y - paddleHeight / 2 
                and all_data[id].ball_y < all_data[id].paddle1_y + paddleHeight / 2):
                nbrHit += 1
                all_data[id].ball_dx = baseSpeed + (0.04 * nbrHit)
                hitPos = all_data[id].ball_y - all_data[id].paddle1_y
                all_data[id].ball_dy = hitPos * 0.15
                reward = 2
            else:
                reward = -1
                goal('player2', id)
                done = True

        total_reward += reward

        i += 1

    return total_reward, states_collected, ys_collected

num_episodes = 2000
all_states = []
all_ys = []

for episode in range(num_episodes):
    total_reward, states_collected, ys_collected = calcul_ball(episode, mode="COLLECT")
    all_states.extend(states_collected)
    all_ys.extend(ys_collected)
    print(f"Episode {episode+1}/{num_episodes}, collected {len(states_collected)} samples.")

np.save("states_dataset.npy", np.array(all_states))
np.save("ys_dataset.npy", np.array(all_ys))
print("States and ys saved.")
sys.exit()