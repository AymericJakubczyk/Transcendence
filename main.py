import pygame
from pong_game import launch_game, draw_game, updateIA
from utils import plot_model, stop_game
from ql_agent import QLAgent


# Constants
SCREEN_WIDTH = 1600
SCREEN_HEIGHT = 1200

# Initialize Pygame
pygame.init()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Pong avec DQN")

five_games_reward = 0

for episode in range(1000):
    action = 0
    total_reward = 0
    total_reward = launch_game(episode, screen, total_reward)
    five_games_reward += total_reward
    print(f"Episode {episode + 1}, Total Reward: {total_reward}")
    if episode % 10 == 0:
        plot_model(five_games_reward, episode)
        five_games_reward = 0

pygame.quit()