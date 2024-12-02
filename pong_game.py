import random
import torch
import sys
import pygame
import numpy as np
from ql_agent import QLAgent
# import time

# Game settings
arenaWidth = 100
arenaLength = 150
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5
nbrHit = 0

SCREEN_WIDTH = 1600
SCREEN_HEIGHT = 1200
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
SCALE_FACTOR_X = SCREEN_WIDTH / arenaLength
SCALE_FACTOR_Y = SCREEN_HEIGHT / arenaWidth
clock = pygame.time.Clock()

state_size = 999  # Example state size
action_size = 5  # Example action size

agent = QLAgent(state_size, action_size)

# Global variables
all_data = {}

target_y = 0

# states will be paddle pos and estimated ball pos in the future
# actions will be up, down, stay, up far and down far

actions = ['down far', 'down close', 'stay', 'up close', 'up far']

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

def launch_game(id, screen, total_reward):
    global all_data
    print("[LAUNCH GAME]", id, file=sys.stderr)
    all_data[id] = PongData()
    all_data[id].id = id
    return calcul_ball(id, screen, total_reward)

def move_paddle(move, player, id):
    global all_data, arenaWidth, paddleHeight
    if player == 1:
        if move == 'up' and all_data[id].paddle1_y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2:
            all_data[id].paddle1_y += 0.6
        if move == 'down' and all_data[id].paddle1_y - 0.6 > thickness / 2 + paddleHeight / 2:
            all_data[id].paddle1_y -= 0.6
    if player == 2:
        if move == 'up' and all_data[id].paddle2_y - 0.6 > thickness / 2 + paddleHeight / 2:
            all_data[id].paddle2_y -= 0.6
        if move == 'down' and all_data[id].paddle2_y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2:
            all_data[id].paddle2_y += 0.6

def get_target_y(action, id):
    match action:
        case 0:
            return all_data[id].paddle1_y - 0.6 * 20
        case 1:
            return all_data[id].paddle1_y - 0.6 * 40
        case 3:
            return all_data[id].paddle1_y + 0.6 * 20
        case 4:
            return all_data[id].paddle1_y + 0.6 * 40
        case _:
            return all_data[id].paddle1_y

def updateIA(id):
    if all_data[id].paddle2_y < all_data[id].ball_y:
        move_paddle("down", 2, id)
    elif all_data[id].paddle2_y > all_data[id].ball_y:
        move_paddle("up", 2, id)

def goal(player, id):
    global all_data, nbrHit, arenaWidth, arenaLength
    nbrHit = 0
    all_data[id].ball_dy = random.random() - 0.5
    all_data[id].ball_dx = random.choice([0.5, -0.5])
    all_data[id].ball_x = arenaLength / 2
    all_data[id].ball_y = arenaWidth / 2

def draw_game(id, screen):
    screen.fill(BLACK)
    pygame.draw.circle(screen, WHITE, (int(all_data[id].ball_x * SCALE_FACTOR_X), int(all_data[id].ball_y * SCALE_FACTOR_Y)), int(ballRadius * SCALE_FACTOR_X))
    pygame.draw.rect(screen, WHITE, (10, int((all_data[id].paddle1_y - paddleHeight / 2) * SCALE_FACTOR_Y), 10, int(paddleHeight * SCALE_FACTOR_Y)))
    pygame.draw.rect(screen, WHITE, (SCREEN_WIDTH - 20, int((all_data[id].paddle2_y - paddleHeight / 2) * SCALE_FACTOR_Y), 10, int(paddleHeight * SCALE_FACTOR_Y)))
    pygame.display.flip()

def draw_dot(screen, x, y):
    print (x, y)    
    pygame.draw.circle(screen, WHITE, (int(x * SCALE_FACTOR_X), int(y * SCALE_FACTOR_Y)), int(ballRadius * SCALE_FACTOR_X))

def predict_ball(data):
    if data.ball_dx > 0:
        return -1
    next_x = data.ball_x + data.ball_dx
    next_y = data.ball_y + data.ball_dy
    for i in range(0, 60):
        if next_x + data.ball_dx > 0:
            next_x += data.ball_dx
            next_y += data.ball_dy
        else:
            return (next_y)
    return (next_y)

def get_state(data, screen):
    # return something like an int that represents the state like  data.paddle1_y * 10 + predict_ball(data)
    predicted_ball = predict_ball(data)
    if predicted_ball >= 0:
        draw_dot(screen, 50, predicted_ball)
    return int(data.paddle1_y * 10 + predicted_ball // 10)

def calcul_ball(id, screen, total_reward): 
    global arenaWidth, arenaLength, thickness, ballRadius, paddleWidth, paddleHeight, baseSpeed, nbrHit, all_data, winningScore, action, agent

    reward = 0
    action = 2
    target_y = arenaWidth / 2
    for i in range(10000):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                quit()
        
        state =  get_state(all_data[id], screen)
        if i % 120 == 0:
            action = agent.get_act(state)
            # print (action)
            target_y = get_target_y(action, id)
        elif all_data[id].paddle1_y > target_y:
            move_paddle('up', 1, id)
        elif all_data[id].paddle1_y < target_y:
            move_paddle('down', 1, id)

        all_data[id].ball_x += all_data[id].ball_dx
        all_data[id].ball_y += all_data[id].ball_dy

        if all_data[id].ball_y + all_data[id].ball_dy > arenaWidth - thickness/2 - ballRadius or all_data[id].ball_y + all_data[id].ball_dy < thickness/2 + ballRadius:
            all_data[id].ball_dy = -all_data[id].ball_dy

        if all_data[id].ball_x > arenaLength - thickness * 2:
            if all_data[id].ball_y > all_data[id].paddle2_y - paddleHeight / 2 and all_data[id].ball_y < all_data[id].paddle2_y + paddleHeight / 2:
                nbrHit += 1
                all_data[id].ball_dx = -baseSpeed - (0.02 * nbrHit)
                hitPos = all_data[id].ball_y - all_data[id].paddle2_y
                all_data[id].ball_dy = hitPos * 0.15
            else:
                goal('player1', id)

        if all_data[id].ball_x < thickness * 2:
            if all_data[id].ball_y > all_data[id].paddle1_y - paddleHeight / 2 and all_data[id].ball_y < all_data[id].paddle1_y + paddleHeight / 2:
                nbrHit += 1
                all_data[id].ball_dx = baseSpeed + (0.02 * nbrHit)
                hitPos = all_data[id].ball_y - all_data[id].paddle1_y
                all_data[id].ball_dy = hitPos * 0.15
                reward = 1
            else:
                reward = -1
                goal('player2', id)

        total_reward += reward
        next_state = get_state(all_data[id], screen)
        done = all_data[id].ball_x < 0
        agent.train(state, action, reward, next_state, done)
        reward = 0
        updateIA(id)
        if all_data[id].id % 100 == 0 and i < 1000:
            draw_game(id, screen)
            # handle fps
            clock.tick(120)
            # printf agent data
    # if all_data[id].id % 5 == 0:
    #     torch.save(agent.model, 'model.pth')    
    return total_reward