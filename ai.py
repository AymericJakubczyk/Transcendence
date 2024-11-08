import pygame
import numpy as np
import json
import pickle
import matplotlib.pyplot as plt

# Environment parameters
ARENA_WIDTH = 100
ARENA_LENGTH = 150
PADDLE_HEIGHT = 17
BALL_RADIUS = 1
base_speed = 0.5

# Paramètres de la fenêtre Pygame
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
SCALE_FACTOR_X = SCREEN_WIDTH / ARENA_LENGTH
SCALE_FACTOR_Y = SCREEN_HEIGHT / ARENA_WIDTH

STAY = 0
UP = 1
DOWN = 2


# Initialisation de Pygame
pygame.init()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Pong avec Q-Learning")

# Q-Learning parameters
alpha = 0.4
gamma = 0.7
epsilon = 1.0  # Initial exploration rate
epsilon_decay = 0.00001  # Decay of exploration rate
min_epsilon = 0.01  # Minimum exploration rate

q_table = {}

rewards, episodes, average = [], [], []

# Possible actions
actions = [UP, DOWN, STAY]

# Global variables for game state
ball_x, ball_y = ARENA_LENGTH / 2, ARENA_WIDTH / 2
ball_dx = 0.5
ball_dy = 0.5
paddle_y = ARENA_WIDTH / 2

# Initialiser la police pour les statistiques
font = pygame.font.Font(None, 36)

clock = pygame.time.Clock()

# Function to reset the game
def reset_game():
    global ball_x, ball_y, ball_dx, ball_dy, paddle_y
    ball_x, ball_y = ARENA_LENGTH / 2, ARENA_WIDTH / 2
    ball_dx = np.random.choice([-1, 1]) * base_speed
    ball_dy = (np.random.rand() - 0.5) * base_speed

# Fonction pour dessiner le jeu
def draw_game():
    screen.fill(BLACK)
    pygame.draw.circle(screen, WHITE, (int(ball_x * SCALE_FACTOR_X), int(ball_y * SCALE_FACTOR_Y)), int(BALL_RADIUS * SCALE_FACTOR_X))
    pygame.draw.rect(screen, WHITE, (10, int((paddle_y - PADDLE_HEIGHT / 2) * SCALE_FACTOR_Y), 10, int(PADDLE_HEIGHT * SCALE_FACTOR_Y)))
    pygame.display.flip()

# Fonction pour dessiner les statistiques
def draw_statistics(episode, total_reward):
    # Texte de l'épisode et de la récompense
    episode_text = font.render(f"Episode: {episode}", True, WHITE)
    reward_text = font.render(f"Total Reward: {total_reward}", True, WHITE)
    
    # Positionner le texte
    screen.blit(episode_text, (10, 10))  # En haut à gauche
    screen.blit(reward_text, (10, 40))   # Juste en dessous de l'épisode
    
    pygame.display.flip()  # Mettre à jour l'affichage

# Epsilon-greedy action selection
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

# Q-Table update function
def update_q_table(state, action, reward, next_state):
    global q_table
    if next_state not in q_table:
        q_table[next_state] = np.zeros(3)
    td_target = reward + gamma * np.max(q_table[next_state])
    td_error = td_target - q_table[state][action]
    q_table[state][action] += alpha * td_error
    # old_value = q_table.get((state, action), 0)
    # future_value = max([q_table.get((next_state, a), 0) for a in actions])
    # new_value = old_value + alpha * (reward + gamma * future_value - old_value)
    # q_table[(state, action)] = new_value

def distill_state():
    if ball_y < paddle_y - PADDLE_HEIGHT / 2:
        return 1  # Ball's y-value center is less than the paddle's y-value center
    elif ball_y > paddle_y + PADDLE_HEIGHT / 2:
        return 2  # Ball's y-value center is greater than the paddle's y-value center
    else :
        return 0

# Save rewards and Q-Table
def save(episode):
    with open(f'player_1_{episode}_qtable.pkl', 'wb') as file:
        pickle.dump(q_table, file)

def load(name):
    with open(name, 'rb') as file:
        q_table = pickle.load(file)

def plot_model(reward, episode):  
    rewards.append(reward)
    episodes.append(episode)
    average.append(sum(rewards) / len(rewards))
    plt.plot(episodes, average, 'r')
    plt.plot(episodes, rewards, 'b')
    plt.ylabel('Reward', fontsize=18)
    plt.xlabel('Games', fontsize=18)

    try:
        plt.savefig(f'player_1_evolution.png')
    except OSError as e:
        print(f"Error saving file: {e}")

def get_reward():
    max_reward =  PADDLE_HEIGHT // 2
    min_reward = -max_reward

    # Get the absolute y_distance between the paddle and ball centers
    y_distance = abs(paddle_y - ball_y)

    # Calculate the reward based on a decreasing function
    reward = - (y_distance / SCREEN_HEIGHT) * max_reward
    if y_distance < PADDLE_HEIGHT // 2:
        reward += max_reward  # Positive reward for proximity to center

    return max(min_reward, reward)


# # Simulation step for environment response
# def simulate_step(action):
# Training loop
rewards_per_episode = []

for episode in range(501):
    score = 0
    opponentScore = 0
    total_reward = 0
    done = False
    reset_game()
    action = 0
    while not done:
        # Gestion des événements Pygame
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                quit()
        # state = (ball_x, ball_y, ball_dx, ball_dy, paddle_y)  done:

        distilled_state = distill_state()
        state = (
            distilled_state,
            action
        )
        # print (state)
        reward = 0

        # Sélection et exécution de l'action
        action = choose_action(state, epsilon)

        # Update paddle position based on action
        if action == 1 and paddle_y + PADDLE_HEIGHT / 2 < ARENA_WIDTH:
            paddle_y += 1
        elif action == 2 and paddle_y - PADDLE_HEIGHT / 2 > 0:
            paddle_y -= 1

        # global ball_x, ball_y, ball_dx, ball_dy, paddle_y
        # reward = 0


        # Update ball position
        ball_x += ball_dx
        ball_y += ball_dy

        # Ball collision with walls
        if ball_y <= 0 or ball_y >= ARENA_WIDTH:
            ball_dy = -ball_dy
        if ball_x >= ARENA_LENGTH:
            ball_dx = -ball_dx

        # Check collision with paddle
        if ball_x <= BALL_RADIUS and paddle_y - PADDLE_HEIGHT / 2 <= ball_y <= paddle_y + PADDLE_HEIGHT / 2:
            ball_dx = abs(ball_dx)  # Reflect ball in X direction
        elif ball_x <= 0:
            score += 1
            reset_game()  # Reset game state

        reward = get_reward()
        distilled_state = distill_state()
        next_state = (
            distilled_state,
            action
        )

        update_q_table(state, action, reward, next_state)
        state = next_state
        total_reward += reward
        # print (action)

        # Mise à jour graphique
        # if (episode > 50):
        draw_game()
        # draw_statistics(episode, total_reward)

        pygame.display.flip()
        clock.tick(900)

        if score == 5:
            done = True

    # pygame.time.delay(5)  # Délai pour ralentir l'affichage
    
    print(f"game: {episode} epsilon A : {epsilon} rewards A : {total_reward}")

    if episode % 10 == 0:
        # print(q_table)
        save(episode)
    plot_model(total_reward, episode)


