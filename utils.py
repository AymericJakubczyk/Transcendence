import matplotlib.pyplot as plt
import pygame

rewards, episodes, average = [], [], []

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