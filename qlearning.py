import pygame
import random
import sys
import numpy as np
import matplotlib.pyplot as plt

# Paramètres du jeu
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

state_size = 111  # Taille de l'état (exemple)
action_size = 5   # Taille de l'action (exemple)

# Variables globales
all_data = {}
target_y = 0
actions = ['down far', 'down close', 'stay', 'up close', 'up far']

# Initialisation de Pygame
pygame.init()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Pong avec Q-Learning")
clock = pygame.time.Clock()

# Pour le traçage
rewards = []
episodes = []
average = []

class QLAgent:
    def __init__(self, state_size, action_size, lr=0.4, gamma=0.7, epsilon=1.0, epsilon_min=0.1, epsilon_decay=0.00001):
        self.state_size = state_size
        self.action_size = action_size
        self.lr = lr
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.q_table = np.zeros((state_size, action_size))

    def get_act(self, state):
        if random.random() < self.epsilon:
            return random.choice(range(self.action_size))
        return np.argmax(self.q_table[state])

    def train(self, state, action, reward, next_state, done):
        best_next_action = np.argmax(self.q_table[next_state])
        target = reward + (self.gamma * self.q_table[next_state, best_next_action] * (1 - done))
        self.q_table[state, action] += self.lr * (target - self.q_table[state, action])

        if self.epsilon > self.epsilon_min:
            self.epsilon -= self.epsilon_decay

agent = QLAgent(state_size, action_size)

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
    if action == 0:
        return all_data[id].paddle1_y - 0.6 * 20
    elif action == 1:
        return all_data[id].paddle1_y - 0.6 * 40
    elif action == 3:
        return all_data[id].paddle1_y + 0.6 * 20
    elif action == 4:
        return all_data[id].paddle1_y + 0.6 * 40
    else:
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
    pygame.draw.circle(screen, WHITE,  (int(x * SCALE_FACTOR_X), int(y * SCALE_FACTOR_Y)), int(ballRadius * SCALE_FACTOR_X))

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
            return next_y
    return next_y

def get_state(data, screen):
    predicted_ball = predict_ball(data)
    return int(data.paddle1_y // 10 * 10 + predicted_ball // 10)

def calcul_ball(id, screen, total_reward): 
    global arenaWidth, arenaLength, thickness, ballRadius, paddleWidth, paddleHeight, baseSpeed, nbrHit, all_data, agent
    reward = 0
    action = 2
    target_y = arenaWidth / 2
    for i in range(10000):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                quit()
        
        state = get_state(all_data[id], screen)
        if i % 120 == 0:
            action = agent.get_act(state)
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
            clock.tick(120)
    return total_reward

def stop_game():
    pygame.quit()
    quit()

def plot_model(reward, episode):
    rewards.append(reward)
    episodes.append(episode)
    average.append(sum(rewards) / len(rewards))
    plt.plot(episodes, average, 'r')
    plt.plot(episodes, rewards, 'b')
    plt.ylabel('Reward', fontsize=18)
    plt.xlabel('Games', fontsize=18)

    try:
        plt.savefig('player_2_evolution.png')
    except OSError as e:
        print(f"Error saving file: {e}")

five_games_reward = 0

for episode in range(1000):
    total_reward = 0
    total_reward = launch_game(episode, screen, total_reward)
    five_games_reward += total_reward
    print(f"Episode {episode + 1}, Total Reward: {total_reward}")
    if episode % 10 == 0:
        plot_model(five_games_reward, episode)
        five_games_reward = 0

pygame.quit()
