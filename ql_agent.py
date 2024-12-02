import random
import numpy as np

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

# # Example usage
# state_size = 2  # Example state size
# action_size = 5  # Example action size
# agent = QLAgent(state_size, action_size)

# # Example training loop
# for episode in range(1000):
#     state = random.randint(0, state_size - 1)
#     done = False
#     while not done:
#         action = agent.act(state)
#         next_state = random.randint(0, state_size - 1)
#         reward = random.random()
#         done = random.choice([True, False])
#         agent.train(state, action, reward, next_state, done)
#         state = next_state
