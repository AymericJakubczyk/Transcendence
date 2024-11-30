
import sys #for print
import pickle
import matplotlib.pyplot as plt
import numpy as np
import pygame
import random
import time
import torch
import torch.nn as nn
import torch.optim as optim
from collections import deque

arenaWidth = 100
arenaLength = 150
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5
nbrHit = 0

all_data = {}

# Configurations
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
SCALE_FACTOR_X = SCREEN_WIDTH / arenaLength
SCALE_FACTOR_Y = SCREEN_HEIGHT / arenaWidth
FPS = 120

# Initialisation de Pygame
pygame.init()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Pong avec DQN")
clock = pygame.time.Clock()

rewards, episodes, average = [], [], []

class PongData():
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

# DQN minimaliste
class DQNModel(nn.Module):
	def __init__(self):
		super(DQNModel, self).__init__()
		# Réseau avec une seule couche cachée
		self.fc = nn.Sequential(
			nn.Linear(3, 128),  # 3 entrées : position balle x, balle y, position paddle y
			nn.ReLU(),
			nn.Linear(128, 2)  # 2 sorties : Q-value pour UP et DOWN
		)
	
	def forward(self, x):
		return self.fc(x)

class DQNAgent:
	def __init__(self):
		self.model = DQNModel()
		self.optimizer = optim.Adam(self.model.parameters(), lr=0.01)
		self.criterion = nn.MSELoss()  # Perte quadratique
		self.gamma = 0.99  # Discount factor
		self.epsilon = 1.0  # Exploration initiale
		self.epsilon_min = 0.01
		self.epsilon_decay = 0.995
		self.memory = ReplayBuffer()
		# self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
		# self.model.to(self.device)
		self.batch_size = 32


	def act(self, state):
		if random.random() < self.epsilon:
			return random.choice([0, 1])  # Exploration : UP ou DOWN
		state = torch.FloatTensor(state).unsqueeze(0)  # Convertir en tenseur
		q_values = self.model(state)
		return torch.argmax(q_values).item()  # Exploitation : action avec la meilleure Q-value

	def train(self, state, action, reward, next_state, done):
		self.memory.push(state, action, reward, next_state, done)

		if self.memory.size() > self.batch_size:
			states, actions, rewards, next_states, dones = self.memory.sample(self.batch_size)
			for i in range(self.batch_size):
				state = torch.FloatTensor(states[i]).unsqueeze(0)
				next_state = torch.FloatTensor(next_states[i]).unsqueeze(0)
				target = rewards[i] + (self.gamma * torch.max(self.model(next_state)) * (1 - int(dones[i])))
				q_value = self.model(state)[0, actions[i]]
				loss = self.criterion(q_value.unsqueeze(0), torch.FloatTensor([target]))
				self.optimizer.zero_grad()
				loss.backward()
				self.optimizer.step()

class ReplayBuffer:
    def __init__(self, capacity=5000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size):
        indices = random.sample(range(len(self.buffer)), batch_size)
        states, actions, rewards, next_states, dones = zip(*[self.buffer[idx] for idx in indices])
        return (np.array(states), np.array(actions), np.array(rewards), 
                np.array(next_states), np.array(dones))

    def size(self):
        return len(self.buffer)


def updateIA(id):
	# AI follows the ball with a slight delay based on difficulty
	target_y = all_data[id].ball_y
	if all_data[id].paddle2_y < target_y:
		move_paddle("down", 2, id)
	elif all_data[id].paddle2_y > target_y:
		move_paddle("up", 2, id)


def launch_game(id):
	global all_data

	print("[LAUNCH GAME]", id, file=sys.stderr)
	all_data[id] = PongData()
	all_data[id].id = id
	calcul_ball(id)

def move_paddle(move, player, id):
	global all_data, arenaWidth, paddleHeight
	if (player == 1):
		if (move == 'up' and all_data[id].paddle1_y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2):
			all_data[id].paddle1_y += 0.6
		if (move == 'down' and all_data[id].paddle1_y - 0.6 > thickness / 2 + paddleHeight / 2):
			all_data[id].paddle1_y -= 0.6
	if (player == 2):
		if (move == 'up' and all_data[id].paddle2_y - 0.6 > thickness / 2 + paddleHeight / 2):
			all_data[id].paddle2_y -= 0.6
		if (move == 'down' and all_data[id].paddle2_y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2):
			all_data[id].paddle2_y += 0.6

# def get_reward(id, ball_returned):
# 	if (all_data[id].ball_x < thickness * 2):
# 		if (all_data[id].ball_y > all_data[id].paddle1_y - paddleHeight / 2 and all_data[id].ball_y < all_data[id].paddle1_y + paddleHeight / 2):
# 			reward = 1  # Réussite
# 	elif ball.x < 0:
# 		reward = -1  # Échec
# 		ball.reset()
# 	else:
# 		reward = 0  # Rien de spécial

def stop_game(id):
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
		plt.savefig(f'player_2_evolution.png')
	except OSError as e:
		print(f"Error saving file: {e}")

def draw_game(id):
	screen.fill(BLACK)
	pygame.draw.circle(screen, WHITE, (int(all_data[id].ball_x * SCALE_FACTOR_X), int(all_data[id].ball_y * SCALE_FACTOR_Y)), int(ballRadius * SCALE_FACTOR_X))
	pygame.draw.rect(screen, WHITE, (10, int((all_data[id].paddle1_y - paddleHeight / 2) * SCALE_FACTOR_Y), 10, int(paddleHeight * SCALE_FACTOR_Y)))
	pygame.draw.rect(screen, WHITE, (SCREEN_WIDTH - 20, int((all_data[id].paddle2_y - paddleHeight / 2) * SCALE_FACTOR_Y), 10, int(paddleHeight * SCALE_FACTOR_Y)))
	pygame.display.flip()

def goal(player, id):
	global all_data, nbrHit, arenaWidth, arenaLength
	nbrHit = 0
	
	all_data[id].ball_dy = random.random() - 0.5
	all_data[id].ball_dx = random.choice([0.5, -0.5])
	all_data[id].ball_x = arenaLength / 2
	all_data[id].ball_y = arenaWidth / 2

def calcul_ball(id):
	global arenaWidth, arenaLength, thickness, ballRadius, paddleWidth, paddleHeight, baseSpeed, nbrHit, all_data, winningScore, action, total_reward, ball_returned, current_time, last_update_time

	agent = DQNAgent()
	
	reward = 0
	for i in range(500):
		# print("hello")
		for event in pygame.event.get():
			if event.type == pygame.QUIT:
				pygame.quit()
				quit()
		
		state = np.array([all_data[id].ball_x / arenaWidth, all_data[id].ball_y / arenaLength, all_data[id].paddle1_y / arenaLength])
		action = agent.act(state)  # 0 = UP, 1 = DOWN
		# print(action)

		if action == 0:  # UP
			move_paddle("up", 1, id)
		elif action == 1:  # DOWN
			move_paddle("down", 1, id)
			
		all_data[id].ball_x += all_data[id].ball_dx
		all_data[id].ball_y += all_data[id].ball_dy 

		# Gestion des collisions avec les murs
		if (all_data[id].ball_y + all_data[id].ball_dy > arenaWidth - thickness/2 - ballRadius or all_data[id].ball_y + all_data[id].ball_dy < thickness/2 + ballRadius ):
			all_data[id].ball_dy = -all_data[id].ball_dy

		# Gestion des collisions avec les paddles
		if (all_data[id].ball_x > arenaLength - thickness * 2):
			if (all_data[id].ball_y > all_data[id].paddle2_y - paddleHeight / 2 and all_data[id].ball_y < all_data[id].paddle2_y + paddleHeight / 2):
				nbrHit += 1
				all_data[id].ball_dx = -baseSpeed - (0.02 * nbrHit)
				hitPos = all_data[id].ball_y - all_data[id].paddle2_y
				all_data[id].ball_dy = hitPos * 0.15
			else:
				goal('player1', id)
				# print("GOAL player 1 !")

		if (all_data[id].ball_x < thickness * 2):
			if (all_data[id].ball_y > all_data[id].paddle1_y - paddleHeight / 2 and all_data[id].ball_y < all_data[id].paddle1_y + paddleHeight / 2):
				nbrHit += 1
				all_data[id].ball_dx = baseSpeed + (0.02 * nbrHit)
				hitPos = all_data[id].ball_y - all_data[id].paddle1_y
				all_data[id].ball_dy = hitPos * 0.15
				reward = 1
			else:
				reward = -1
				goal('player2' ,id)

		total_reward += reward

		next_state = np.array([all_data[id].ball_x / arenaWidth, all_data[id].ball_y / arenaLength, all_data[id].paddle1_y / arenaLength])
		done = all_data[id].ball_x < 0  # Fin de l'épisode si la balle sort
		agent.train(state, action, reward, next_state, done)

		reward = 0	
		updateIA(id)
		if (all_data[id].id % 100 == 0):
			draw_game(id)
			# time.sleep(0.001)
			# adjust the speed of the game

five_games_reward = 0

for episode in range(1000):
	action = 0
	total_reward = 0
	launch_game(episode)
	five_games_reward += total_reward
	print(f"Episode {episode + 1}, Total Reward: {total_reward}")
	# print(episode)
	if episode % 5 == 0:
		plot_model(five_games_reward, episode)
		five_games_reward = 0

# # Environnement du jeu
# def play_game():
# 	paddle = Paddle()
# 	ball = Ball()
# 	agent = DQNAgent()

# 	episodes = 1000
# 	for episode in range(episodes):
# 		ball_reset()
# 		paddle.y = HEIGHT // 2 - PADDLE_HEIGHT // 2
# 		total_reward = 0

# 		for _ in range(2000):  # Limite de pas par épisode
# 			# État : position relative de la balle et du paddle
# 			state = np.array([ball_x / WIDTH, ball.y / HEIGHT, paddle.y / HEIGHT])
# 			action = agent.act(state)  # 0 = UP, 1 = DOWN

# 			# Effectuer l'action
# 			paddle.move("UP" if action == 0 else "DOWN")
# 			ball.move()

# 			# Récompense
# 			if ball.x <= paddle.x + PADDLE_WIDTH and paddle.y < ball.y < paddle.y + PADDLE_HEIGHT:
# 				reward = 1  # Réussite
# 			elif ball.x < 0:
# 				reward = -1  # Échec
# 				ball.reset()
# 			else:
# 				reward = 0  # Rien de spécial

# 			total_reward += reward

# 			# État suivant
# 			next_state = np.array([ball.x / WIDTH, ball.y / HEIGHT, paddle.y / HEIGHT])
# 			done = ball.x < 0  # Fin de l'épisode si la balle sort
# 			agent.train(state, action, reward, next_state, done)

# 			if episode % 100 == 0:
# 				# Affichage
# 				screen.fill((0, 0, 0))
# 				paddle.draw()
# 				ball.draw()
# 				pygame.display.flip()
# 				clock.tick(FPS)

# 			if done:
# 				break

# 		print(f"Episode {episode + 1}, Total Reward: {total_reward}")

# 	pygame.quit()

# # Lancer le jeu
# play_game()

