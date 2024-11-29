import sys #for print
import random
import pygame
import numpy as np
import json
import pickle
import matplotlib.pyplot as plt
import time
from neural_network import Brain

def build_model(input_dim, action_space):
    model = Sequential([
        Dense(24, input_dim=input_dim, activation='relu'),
        Dense(24, activation='relu'),
        Dense(action_space, activation='linear')
    ])
    model.compile(optimizer='adam', loss='mse')
    return model

arenaWidth = 100
arenaLength = 150
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5
nbrHit = 0
winningScore = 50

all_data = {}

# Paramètres de la fenêtre Pygame
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
SCALE_FACTOR_X = SCREEN_WIDTH / arenaLength
SCALE_FACTOR_Y = SCREEN_HEIGHT / arenaWidth

# Initialisation de Pygame
pygame.init()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Pong avec Q-Learning")

# Q-Learning parameters
alpha = 0.4
gamma = 0.7
epsilon = 1.0  # Initial exploration rate
epsilon_decay = 0.000006  # Decay of exploration rate
min_epsilon = 0.2  # Minimum exploration rate
STAY = 0
UP = 1
DOWN = 2
# q_table = {}

rewards, episodes, average = [], [], []
# Crée le réseau pour gérer les décisions du joueur

brain = Brain(input_size=4, output_size=3)  # 4 entrées (état du jeu), 3 actions possibles


rewards_per_episode = []

# Possible actions
actions = [UP, DOWN, STAY]
# Possible actions
actions = [y for y in range(0, arenaWidth, 5)]


# Initialiser la police pour les statistiques
font = pygame.font.Font(None, 36)

update_interval = 1.0  # 1 seconde
last_update_time = time.time()

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
        self.difficulty = 0.95

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


def calcul_ball(id):
    global arenaWidth, arenaLength, thickness, ballRadius, paddleWidth, paddleHeight, baseSpeed, nbrHit, all_data, winningScore, action, total_reward, ball_returned, current_time, last_update_time

    ball_returned = True

    while True:
        # print("hello")
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                quit()

        state = get_game_state(id)
        action_scores = brain.think(state)
        action = np.argmax(action_scores)  # Choisit l'action avec le plus haut score


        if action == 1:  # UP
            move_paddle("up", 1, id)
        elif action == 2:  # DOWN
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
                if (all_data[id].score_player1 == winningScore or all_data[id].score_player2 == winningScore):
                    print("player 1 WON")
                    # stop_game(id)
                    return

        if (all_data[id].ball_x < thickness * 2):
            if (all_data[id].ball_y > all_data[id].paddle1_y - paddleHeight / 2 and all_data[id].ball_y < all_data[id].paddle1_y + paddleHeight / 2):
                nbrHit += 1
                all_data[id].ball_dx = baseSpeed + (0.02 * nbrHit)
                hitPos = all_data[id].ball_y - all_data[id].paddle1_y
                all_data[id].ball_dy = hitPos * 0.15
                ball_returned = True
            else:
                goal('player2' ,id)
                ball_returned = False
                if (all_data[id].score_player1 == winningScore or all_data[id].score_player2 == winningScore):
                    # print("player 2 WON")
                    # stop_game(id)
                    return

        reward = get_reward(id, ball_returned)
        # Ajuster le réseau
        target = action_scores.copy()
        target[0, action] = reward  # Met à jour la cible avec la récompense
        brain.train(state, target, learning_rate=0.01)

        total_reward += reward
        updateIA(id)
        if (all_data[id].id % 25 == 0 and all_data[id].score_player1 < 5 and all_data[id].score_player2 < 5):
            draw_game(id)
            time.sleep(0.005)
            # adjust the speed of the game

        
def stop_game(id):
    pygame.quit()
    quit()

def draw_game(id):
    screen.fill(BLACK)
    pygame.draw.circle(screen, WHITE, (int(all_data[id].ball_x * SCALE_FACTOR_X), int(all_data[id].ball_y * SCALE_FACTOR_Y)), int(ballRadius * SCALE_FACTOR_X))
    pygame.draw.rect(screen, WHITE, (10, int((all_data[id].paddle1_y - paddleHeight / 2) * SCALE_FACTOR_Y), 10, int(paddleHeight * SCALE_FACTOR_Y)))
    pygame.draw.rect(screen, WHITE, (SCREEN_WIDTH - 20, int((all_data[id].paddle2_y - paddleHeight / 2) * SCALE_FACTOR_Y), 10, int(paddleHeight * SCALE_FACTOR_Y)))
    pygame.display.flip()

def display_game_info(screen, game_number, epsilon):
    # Initialiser la police
    font = pygame.font.Font(None, 36)
    
    # Créer le texte pour la partie et l'epsilon
    game_text = font.render(f"Partie: {game_number}", True, WHITE)
    epsilon_text = font.render(f"Epsilon: {epsilon:.2f}", True, WHITE)
    
    # Positionner le texte dans le coin supérieur gauche de l'écran
    screen.blit(game_text, (10, 10))
    screen.blit(epsilon_text, (10, 50))

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


def goal(player, id):
    global all_data, nbrHit, arenaWidth, arenaLength

    if (player == 'player1'):
        all_data[id].score_player1 += 1
    else:
        all_data[id].score_player2 += 1
    nbrHit = 0
    
    all_data[id].ball_dy = random.random() - 0.5
    all_data[id].ball_dx = random.choice([0.5, -0.5])
    all_data[id].ball_x = arenaLength / 2
    all_data[id].ball_y = arenaWidth / 2

#   Q-LEARNING FUNCTIONS

# def predict_ball_position(id, anticipation_steps=15):
#     # Copie de la position et direction actuelle
#     predicted_x = all_data[id].ball_x
#     predicted_y = all_data[id].ball_y
#     predicted_dx = all_data[id].ball_dx
#     predicted_dy = all_data[id].ball_dy

#     # Simule la trajectoire en tenant compte des rebonds
#     for _ in range(anticipation_steps):
#         # Applique le déplacement
#         predicted_x += predicted_dx
#         predicted_y += predicted_dy

#         # Vérifie si la balle touche le mur supérieur ou inférieur
#         if predicted_y <= 0 or predicted_y >= SCREEN_HEIGHT:
#             predicted_dy *= -1  # Inverse la direction verticale pour simuler le rebond

#     # Retourne la position prédite
#     return predicted_x, predicted_y

def get_game_state(id):
    """
    Récupère l'état du jeu sous forme de tableau.
    """
    return np.array([[
        all_data[id].ball_x,
        all_data[id].ball_y,
        all_data[id].ball_dx,
        all_data[id].paddle1_y
    ]])



def update_q_table(state, action, reward, next_state):
    global q_table
    if next_state not in q_table:
        q_table[next_state] = np.zeros(3)
    td_target = reward + gamma * np.max(q_table[next_state])
    td_error = td_target - q_table[state][action]
    q_table[state][action] += alpha * td_error

def choose_action(state, epsilonn):
    global epsilon
    global q_table

    if state not in q_table:
        q_table[state] = np.zeros(3)
    epsilon = max(min_epsilon, epsilonn * (1 - epsilon_decay))
    if np.random.uniform() < epsilon:
        action = np.random.choice(3)
    else:
        action = np.argmax(q_table[state])
    return action

def get_reward(id, ball_returned):
    """
    Calcule la récompense pour le joueur 1.
    id : Identifiant de la partie
    ball_returned : True si la balle a été renvoyée, False sinon
    """
    if ball_returned:
        return 10  # Récompense pour avoir renvoyé la balle
    else:
        return -10  # Pénalité pour avoir raté la balle

for episode in range(501):
    action = 0
    total_reward = 0
    launch_game(episode)
    print("partie :", episode, "epsilon :", epsilon, "rewards :", total_reward)
    # print(episode)
    plot_model(total_reward, episode)
