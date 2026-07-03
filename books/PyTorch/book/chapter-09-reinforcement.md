# Chapter 9: Reinforcement Learning

**By Manjunath Kalburgi**

---

## Introduction

Reinforcement Learning (RL) is the branch of machine learning where an agent learns to make sequential decisions by interacting with an environment. Unlike supervised learning, where the model learns from labeled examples, RL learns from trial and error — the agent takes actions, observes consequences (rewards), and gradually discovers which strategies maximize cumulative reward.

RL has produced landmark results: DeepMind's AlphaGo defeated the world champion at Go, OpenAI's agents learned to play Dota 2 at a professional level, and DeepMind's DQN learned to play Atari games directly from pixels, outperforming humans on many titles. These breakthroughs were powered by deep neural networks — and PyTorch is the framework of choice for modern RL research.

In this chapter, we will:

1. Understand the Markov Decision Process (MDP) framework that formalizes RL
2. Learn value-based methods — Q-learning and Deep Q-Networks (DQN)
3. Study policy gradient methods — REINFORCE, Actor-Critic, and PPO
4. Master environment setup using OpenAI Gymnasium (formerly Gym)
5. Build and train RL agents in PyTorch
6. Explore reward shaping, exploration strategies, and practical training tricks

---

## 1. RL Foundations

### 1.1 The Agent-Environment Loop

At every time step, the agent observes the environment, takes an action, and receives a reward:

```
┌──────────────────────────────────────────────────────────────────────┐
│                     AGENT-ENVIRONMENT LOOP                            │
│                                                                      │
│   ┌──────────┐                                    ┌──────────────┐   │
│   │          │  action aₜ                         │              │   │
│   │  AGENT   │──────────────────────────────────▶ │ ENVIRONMENT  │   │
│   │  (policy │                                    │  (MDP)       │   │
│   │   π)     │                                    │              │   │
│   │          │◀────────────────────────────────── │              │   │
│   └──────────┘  state sₜ₊₁, reward rₜ            └──────────────┘   │
│                                                                      │
│   At time step t:                                                    │
│     Agent observes state sₜ                                          │
│     Agent takes action aₜ = π(sₜ)                                   │
│     Environment returns reward rₜ and next state sₜ₊₁               │
│     Agent updates its policy based on (sₜ, aₜ, rₜ, sₜ₊₁)          │
│                                                                      │
│   Goal: Find policy π* that maximizes expected cumulative reward     │
│   Gₜ = rₜ + γ·rₜ₊₁ + γ²·rₜ₊₂ + ... = Σᵢ₌₀^∞ γⁱ·rₜ₊ᵢ           │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 Markov Decision Process (MDP)

An MDP is a 5-tuple (S, A, P, R, γ) that formally describes the RL problem:

| Symbol | Name | Description |
|--------|------|-------------|
| S | State space | Set of all possible states the environment can be in |
| A | Action space | Set of all possible actions the agent can take |
| P(s'\|s,a) | Transition probability | Probability of transitioning to state s' given state s and action a |
| R(s,a) | Reward function | Expected reward for taking action a in state s |
| γ | Discount factor | How much to value future rewards (0 < γ ≤ 1) |

```
MDP Example: Gridworld

  ┌────┬────┬────┬────┐
  │ S  │    │    │    │
  ├────┼────┼────┼────┤
  │    │ ██ │    │    │     S = Start state
  ├────┼────┼────┼────┤     G = Goal (+10 reward)
  │    │    │ ██ │    │     █ = Wall (impassable)
  ├────┼────┼────┼────┤     Each step: -1 reward
  │    │    │    │  G │     γ = 0.99
  └────┴────┴────┴────┘

  State space: 16 grid cells = {0, 1, ..., 15}
  Actions: {up, down, left, right}
  Transitions: deterministic (intended direction, unless wall)
  Reward: -1 per step, +10 at goal
```

### 1.3 Key Concepts

**Value Function V^π(s):** Expected cumulative reward starting from state s, following policy π:

```
V^π(s) = E_π[Gₜ | sₜ = s] = E_π[rₜ + γ·rₜ₊₁ + γ²·rₜ₊₂ + ... | sₜ = s]
```

**Action-Value Function Q^π(s, a):** Expected cumulative reward starting from state s, taking action a, then following policy π:

```
Q^π(s, a) = E_π[Gₜ | sₜ = s, aₜ = a] = E_π[rₜ + γ·V^π(sₜ₊₁) | sₜ = s, aₜ = a]
```

**Bellman Equation (for Q):**

```
Q^π(s, a) = R(s, a) + γ · Σ_{s'} P(s'|s,a) · V^π(s')
           = R(s, a) + γ · Σ_{s'} P(s'|s,a) · max_a' Q^π(s', a')  [for optimal π*]
```

**Optimal Policy π*:** The policy that achieves the highest value in every state:

```
π*(s) = argmax_a Q*(s, a)
```

### 1.4 RL Taxonomy

```
                          Reinforcement Learning
                                   │
                  ┌────────────────┼────────────────┐
                  │                │                 │
             Model-Free       Model-Based      Multi-Agent
                  │                │                 │
          ┌───────┼───────┐   Learn P(s'|s,a)   MARL, self-play
          │       │       │
       Value   Policy   Actor-Critic
       Based   Based
          │       │       │
        DQN   REINFORCE  A2C, A3C, PPO, SAC
        DDQN   PPO-PG    TD3, DDPG
        Dueling
```

| Category | Learns | Examples | Pros | Cons |
|----------|--------|---------|------|------|
| Value-based | Q-function | DQN, DDQN, Dueling DQN | Sample efficient, off-policy | Only discrete actions |
| Policy-based | Policy directly | REINFORCE, PPO-PG | Continuous actions, stochastic policies | High variance, on-policy |
| Actor-Critic | Both Q and π | A2C, PPO, SAC, DDPG | Lower variance, continuous actions | More complex, tuning |
| Model-Based | World model + planner | MCTS, MuZero | Very sample efficient | Complex, limited to known envs |

---

## 2. Deep Q-Networks (DQN)

### 2.1 From Tabular Q-Learning to Deep Q-Networks

Tabular Q-learning stores Q-values in a table: Q(s, a) for every state-action pair. This works for small, discrete state spaces but is impossible when the state space is large (e.g., Atari games with 10^84 possible frames).

DQN replaces the Q-table with a neural network that takes a state as input and outputs Q-values for each action:

```
Tabular Q-Learning:              Deep Q-Network:
┌──────────────────────┐        ┌──────────────────────────────────┐
│ State │ a₁ │ a₂ │ a₃│        │  Input: state s (e.g., 84×84×4) │
│   s₁  │ 0.3│ 0.1│ 0.8│        │         │                       │
│   s₂  │ 0.5│ 0.2│ 0.1│        │         ▼                       │
│   s₃  │ 0.1│ 0.7│ 0.4│        │  ┌─────────────┐               │
│   ... │    │    │    │        │  │ Conv layers  │               │
│ (finite states)      │        │  │  (features)  │               │
└──────────────────────┘        │  └──────┬──────┘               │
                                 │         │                       │
Can't handle large              │         ▼                       │
state spaces                    │  ┌─────────────┐               │
                                 │  │  FC layers   │               │
                                 │  │  (Q-values)  │               │
                                 │  └──────┬──────┘               │
                                 │         │                       │
                                 │         ▼                       │
                                 │  Output: [Q(s,a₁), Q(s,a₂),   │
                                 │           Q(s,a₃), ...]        │
                                 │  (one Q-value per action)       │
                                 └──────────────────────────────────┘

                                 Works with any state size!
```

### 2.2 DQN Algorithm

The DQN algorithm uses two key innovations to stabilize training:

1. **Experience Replay:** Store transitions (s, a, r, s', done) in a buffer and sample random mini-batches, breaking correlations in sequential data
2. **Target Network:** Use a separate "frozen" network to compute target Q-values, preventing the target from shifting during updates

```
DQN Training Loop:
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│  1. Observe state sₜ                                               │
│  2. Select action aₜ using ε-greedy:                              │
│     - With probability ε: random action (exploration)              │
│     - With probability 1-ε: aₜ = argmax_a Q(sₜ, a; θ)           │
│  3. Execute aₜ, observe reward rₜ and next state sₜ₊₁            │
│  4. Store (sₜ, aₜ, rₜ, sₜ₊₁, done) in replay buffer              │
│  5. Sample mini-batch from replay buffer                           │
│  6. Compute target: yₜ = rₜ + γ · max_a' Q(sₜ₊₁, a'; θ⁻)       │
│     (θ⁻ = target network params, updated periodically)            │
│  7. Minimize loss: L = (yₜ - Q(sₜ, aₜ; θ))²                     │
│  8. Update θ (online network)                                      │
│  9. Every C steps: copy θ → θ⁻ (update target network)           │
│                                                                    │
│  Repeat until convergence                                          │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 Implementing DQN from Scratch

```python
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
from collections import deque


class QNetwork(nn.Module):
    """Deep Q-Network that maps states to Q-values for each action."""

    def __init__(self, state_dim, action_dim, hidden_dim=128):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim),
        )

    def forward(self, state):
        """Returns Q-values for all actions given a state."""
        return self.network(state)


class ReplayBuffer:
    """Fixed-size buffer that stores experience tuples for DQN training."""

    def __init__(self, capacity=100_000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            torch.FloatTensor(np.array(states)),
            torch.LongTensor(actions),
            torch.FloatTensor(rewards),
            torch.FloatTensor(np.array(next_states)),
            torch.FloatTensor(dones),
        )

    def __len__(self):
        return len(self.buffer)


class DQNAgent:
    """Deep Q-Network agent with experience replay and target network."""

    def __init__(
        self,
        state_dim,
        action_dim,
        lr=1e-3,
        gamma=0.99,
        epsilon_start=1.0,
        epsilon_end=0.01,
        epsilon_decay=0.995,
        buffer_capacity=100_000,
        batch_size=64,
        target_update_freq=100,
    ):
        self.action_dim = action_dim
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_end = epsilon_end
        self.epsilon_decay = epsilon_decay
        self.batch_size = batch_size
        self.target_update_freq = target_update_freq

        # Online and target networks
        self.q_network = QNetwork(state_dim, action_dim)
        self.target_network = QNetwork(state_dim, action_dim)
        self.target_network.load_state_dict(self.q_network.state_dict())
        self.target_network.eval()

        self.optimizer = optim.Adam(self.q_network.parameters(), lr=lr)
        self.buffer = ReplayBuffer(buffer_capacity)
        self.steps = 0

    def select_action(self, state, greedy=False):
        """ε-greedy action selection."""
        if not greedy and random.random() < self.epsilon:
            return random.randint(0, self.action_dim - 1)

        with torch.no_grad():
            state_t = torch.FloatTensor(state).unsqueeze(0)
            q_values = self.q_network(state_t)
            return q_values.argmax(dim=1).item()

    def store_transition(self, state, action, reward, next_state, done):
        self.buffer.push(state, action, reward, next_state, done)

    def update(self):
        """Perform one gradient step on a mini-batch from the replay buffer."""
        if len(self.buffer) < self.batch_size:
            return None

        states, actions, rewards, next_states, dones = self.buffer.sample(
            self.batch_size
        )

        # Current Q-values: Q(s, a; θ)
        q_values = self.q_network(states).gather(1, actions.unsqueeze(1)).squeeze(1)

        # Target Q-values: r + γ · max_a' Q(s', a'; θ⁻)  (detached)
        with torch.no_grad():
            next_q_values = self.target_network(next_states).max(dim=1).values
            targets = rewards + self.gamma * next_q_values * (1 - dones)

        # Compute loss (Huber loss for stability)
        loss = nn.SmoothL1Loss()(q_values, targets)

        # Gradient step
        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.q_network.parameters(), max_norm=10.0)
        self.optimizer.step()

        # Update target network periodically
        self.steps += 1
        if self.steps % self.target_update_freq == 0:
            self.target_network.load_state_dict(self.q_network.state_dict())

        # Decay epsilon
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)

        return loss.item()
```

### 2.4 Training DQN on CartPole

```python
import gymnasium as gym


def train_dqn(
    env_name="CartPole-v1",
    num_episodes=500,
    lr=1e-3,
    gamma=0.99,
    epsilon_start=1.0,
    epsilon_decay=0.995,
    buffer_capacity=50_000,
    batch_size=64,
    target_update_freq=50,
):
    """Train a DQN agent on a Gymnasium environment."""
    env = gym.make(env_name)

    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n

    agent = DQNAgent(
        state_dim=state_dim,
        action_dim=action_dim,
        lr=lr,
        gamma=gamma,
        epsilon_start=epsilon_start,
        epsilon_end=0.01,
        epsilon_decay=epsilon_decay,
        buffer_capacity=buffer_capacity,
        batch_size=batch_size,
        target_update_freq=target_update_freq,
    )

    # Training metrics
    episode_rewards = []
    best_reward = 0
    solved = False

    print(f"Training DQN on {env_name}")
    print(f"State dim: {state_dim}, Action dim: {action_dim}")
    print(f"{'Episode':>8} │ {'Reward':>8} │ {'Epsilon':>8} │ {'Avg(10)':>8} │ {'Status'}")
    print("─" * 60)

    for episode in range(num_episodes):
        state, _ = env.reset()
        total_reward = 0
        done = False

        while not done:
            action = agent.select_action(state)
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated

            agent.store_transition(state, action, reward, next_state, float(done))
            loss = agent.update()

            state = next_state
            total_reward += reward

        episode_rewards.append(total_reward)
        avg_reward = np.mean(episode_rewards[-10:])

        # Status
        status = ""
        if avg_reward >= 475 and not solved:
            solved = True
            status = "✅ SOLVED!"
        if total_reward > best_reward:
            best_reward = total_reward

        if (episode + 1) % 25 == 0 or solved:
            print(
                f"{episode+1:8d} │ {total_reward:8.1f} │ "
                f"{agent.epsilon:8.4f} │ {avg_reward:8.1f} │ {status}"
            )

    env.close()
    return episode_rewards


# Run training
rewards = train_dqn(num_episodes=500)
```

### 2.5 DQN Improvements

| Algorithm | Key Idea | Benefit |
|-----------|----------|---------|
| **Double DQN** | Use online net to select action, target net to evaluate it | Reduces overestimation bias |
| **Dueling DQN** | Split Q(s,a) = V(s) + A(s,a) | Better state value estimation |
| **Prioritized Replay** | Sample transitions with high TD-error more often | More efficient learning |
| **Noisy Nets** | Replace ε-greedy with learned noise | More efficient exploration |
| **Rainbow** | Combine all improvements | State-of-the-art discrete control |

```python
# Double DQN modification (only the target computation changes):
def compute_double_dqn_target(agent, next_states, rewards, dones, gamma):
    """Double DQN: online net selects action, target net evaluates it."""
    with torch.no_grad():
        # Online network selects the best action
        next_actions = agent.q_network(next_states).argmax(dim=1)

        # Target network evaluates Q-value for that action
        next_q_values = agent.target_network(next_states)
        next_q = next_q_values.gather(1, next_actions.unsqueeze(1)).squeeze(1)

        targets = rewards + gamma * next_q * (1 - dones)
    return targets


# Dueling DQN architecture:
class DuelingQNetwork(nn.Module):
    """Dueling DQN: Q(s,a) = V(s) + A(s,a) - mean(A(s,:))"""

    def __init__(self, state_dim, action_dim, hidden_dim=128):
        super().__init__()
        self.feature = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
        )
        # Value stream: estimates V(s)
        self.value_stream = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1),
        )
        # Advantage stream: estimates A(s,a)
        self.advantage_stream = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim),
        )

    def forward(self, state):
        features = self.feature(state)
        value = self.value_stream(features)
        advantage = self.advantage_stream(features)
        # Combine: Q = V + (A - mean(A))
        q_values = value + advantage - advantage.mean(dim=1, keepdim=True)
        return q_values
```

---

## 3. Policy Gradient Methods

### 3.1 Why Policy Gradients?

Value-based methods (DQN) learn a value function and derive a policy indirectly. Policy gradient methods optimize the policy directly, which offers several advantages:

| Property | Value-Based (DQN) | Policy Gradient |
|----------|-------------------|-----------------|
| Action space | Discrete only | Discrete + continuous |
| Policy type | Deterministic (greedy) | Stochastic (probability distribution) |
| Convergence | Can oscillate | Guaranteed to improve (monotonic) |
| Exploration | ε-greedy (external) | Built into the policy |
| Multi-modal | ❌ Only one action per state | ✅ Can learn distributions |

### 3.2 The REINFORCE Algorithm

REINFORCE is the simplest policy gradient method. It uses Monte Carlo sampling to estimate the gradient of the expected return:

```
Policy Gradient Theorem:
  ∇_θ J(θ) = E_π[Gₜ · ∇_θ log π_θ(aₜ | sₜ)]

Where:
  J(θ) = expected cumulative reward under policy π_θ
  Gₜ = cumulative return from time step t
  π_θ(aₜ|sₜ) = probability of taking action aₜ in state sₜ

Intuition:
  - If Gₜ is positive (good outcome), increase probability of action aₜ
  - If Gₜ is negative (bad outcome), decrease probability of action aₜ
  - The magnitude of the update is proportional to the return
```

```python
class PolicyNetwork(nn.Module):
    """Policy network that outputs action probabilities."""

    def __init__(self, state_dim, action_dim, hidden_dim=128):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim),
        )

    def forward(self, state):
        """Returns action log-probabilities."""
        logits = self.network(state)
        return torch.distributions.Categorical(logits=logits)


class REINFORCEAgent:
    """REINFORCE policy gradient agent (no baseline)."""

    def __init__(self, state_dim, action_dim, lr=1e-3, gamma=0.99):
        self.gamma = gamma
        self.policy = PolicyNetwork(state_dim, action_dim)
        self.optimizer = optim.Adam(self.policy.parameters(), lr=lr)

        # Trajectory storage
        self.log_probs = []
        self.rewards = []

    def select_action(self, state):
        """Sample action from the policy distribution."""
        dist = self.policy(torch.FloatTensor(state))
        action = dist.sample()
        self.log_probs.append(dist.log_prob(action))
        return action.item()

    def store_reward(self, reward):
        self.rewards.append(reward)

    def update(self):
        """Compute policy gradient and update parameters."""
        # Compute discounted returns Gₜ
        returns = []
        G = 0
        for r in reversed(self.rewards):
            G = r + self.gamma * G
            returns.insert(0, G)

        returns = torch.FloatTensor(returns)
        # Normalize returns (reduces variance, stabilizes training)
        if len(returns) > 1:
            returns = (returns - returns.mean()) / (returns.std() + 1e-8)

        # Policy gradient: -E[Gₜ · log π(aₜ|sₜ)]
        loss = 0
        for log_prob, G in zip(self.log_probs, returns):
            loss -= log_prob * G  # negative because we minimize

        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        # Clear trajectory
        self.log_probs.clear()
        self.rewards.clear()

        return loss.item()


def train_reinforce(env_name="CartPole-v1", num_episodes=1000):
    """Train REINFORCE agent."""
    env = gym.make(env_name)
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n

    agent = REINFORCEAgent(state_dim, action_dim, lr=1e-3, gamma=0.99)
    episode_rewards = []

    print(f"Training REINFORCE on {env_name}")
    print(f"{'Episode':>8} │ {'Reward':>8} │ {'Avg(50)':>8}")
    print("─" * 40)

    for episode in range(num_episodes):
        state, _ = env.reset()
        total_reward = 0
        done = False

        while not done:
            action = agent.select_action(state)
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            agent.store_reward(reward)
            state = next_state
            total_reward += reward

        agent.update()
        episode_rewards.append(total_reward)

        if (episode + 1) % 50 == 0:
            avg = np.mean(episode_rewards[-50:])
            print(f"{episode+1:8d} │ {total_reward:8.1f} │ {avg:8.1f}")

    env.close()
    return episode_rewards
```

### 3.3 REINFORCE with Baseline

Adding a baseline reduces variance without introducing bias. The most common baseline is the state value V(s):

```
With baseline:
  ∇_θ J(θ) = E_π[(Gₜ - V(sₜ)) · ∇_θ log π_θ(aₜ | sₜ)]

  The term (Gₜ - V(sₜ)) is called the "advantage" Aₜ.
  If Gₜ > V(sₜ): the action was better than average → increase its probability
  If Gₜ < V(sₜ): the action was worse than average → decrease its probability
```

---

## 4. Actor-Critic Methods

### 4.1 Combining Value and Policy Learning

Actor-Critic methods combine the best of both worlds:
- **Actor (policy π_θ):** Decides which action to take
- **Critic (value function V_φ or Q_φ):** Evaluates how good the actor's decisions are

```
┌──────────────────────────────────────────────────────────┐
│                  ACTOR-CRITIC ARCHITECTURE                  │
│                                                            │
│   ┌─────────────────────┐                                  │
│   │    Shared Network    │                                  │
│   │    (optional)        │                                  │
│   └──────┬──────────┬───┘                                  │
│          │          │                                      │
│          ▼          ▼                                      │
│   ┌──────────┐  ┌──────────┐                               │
│   │  ACTOR   │  │  CRITIC  │                               │
│   │  π_θ(a|s)│  │  V_φ(s) │                               │
│   └────┬─────┘  └────┬─────┘                               │
│        │              │                                     │
│        ▼              ▼                                     │
│   Action probs    State value                               │
│   (sample action) (evaluate quality)                       │
│                                                            │
│   Actor uses advantage A(s,a) = Gₜ - V(sₜ) for updates   │
│   Critic uses TD error δ = r + γV(s') - V(s) for updates  │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Advantage Actor-Critic (A2C)

```python
class ActorCritic(nn.Module):
    """Shared-backbone Actor-Critic network."""

    def __init__(self, state_dim, action_dim, hidden_dim=128):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )
        # Actor head: outputs action probabilities
        self.actor = nn.Linear(hidden_dim, action_dim)
        # Critic head: outputs state value
        self.critic = nn.Linear(hidden_dim, 1)

    def forward(self, state):
        features = self.shared(state)
        action_logits = self.actor(features)
        state_value = self.critic(features)
        return action_logits, state_value

    def act(self, state):
        """Select action using current policy."""
        logits, value = self.forward(torch.FloatTensor(state))
        dist = torch.distributions.Categorical(logits=logits)
        action = dist.sample()
        return action.item(), dist.log_prob(action), value.squeeze(-1)

    def evaluate(self, states, actions):
        """Evaluate log-probs and values for given states and actions."""
        logits, values = self.forward(states)
        dist = torch.distributions.Categorical(logits=logits)
        return dist.log_prob(actions), dist.entropy(), values.squeeze(-1)


class A2CAgent:
    """Advantage Actor-Critic agent."""

    def __init__(self, state_dim, action_dim, lr=3e-4, gamma=0.99, entropy_coef=0.01):
        self.gamma = gamma
        self.entropy_coef = entropy_coef
        self.model = ActorCritic(state_dim, action_dim)
        self.optimizer = optim.Adam(self.model.parameters(), lr=lr)

    def update(self, rewards, log_probs, values, dones):
        """Compute advantage and update both actor and critic."""
        # Compute discounted returns
        returns = []
        G = 0
        for r, done in zip(reversed(rewards), reversed(dones)):
            G = r + self.gamma * G * (1 - done)
            returns.insert(0, G)

        returns = torch.FloatTensor(returns)
        log_probs = torch.stack(log_probs)
        values = torch.stack(values)

        # Advantage = Returns - Values
        advantages = returns - values.detach()

        # Normalize advantages
        if len(advantages) > 1:
            advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)

        # Actor loss: -log_prob * advantage
        actor_loss = -(log_probs * advantages).mean()

        # Critic loss: MSE between predicted value and actual return
        critic_loss = nn.MSELoss()(values, returns)

        # Entropy bonus for exploration
        entropy = torch.stack([
            torch.distributions.Categorical(logits=logits).entropy()
            for logits in []  # Would use stored entropies in practice
        ]).mean() if False else torch.tensor(0.0)

        # Combined loss
        loss = actor_loss + 0.5 * critic_loss

        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=0.5)
        self.optimizer.step()

        return loss.item(), actor_loss.item(), critic_loss.item()
```

### 4.3 Generalized Advantage Estimation (GAE)

GAE is the standard method for computing advantages in practice, balancing bias and variance through a parameter λ:

```
GAE(λ) — Generalized Advantage Estimation:

δₜ = rₜ + γ · V(sₜ₊₁) - V(sₜ)              (TD error at step t)

Aₜ^GAE(γ,λ) = δₜ + (γλ)δₜ₊₁ + (γλ)²δₜ₊₂ + ...
             = Σ_{l=0}^{∞} (γλ)^l · δₜ₊ₗ

Where:
  λ = 0: A = δₜ (TD(0), low variance, high bias)
  λ = 1: A = Σ γ^l · rₜ₊ₗ - V(sₜ) (Monte Carlo, high variance, low bias)
  λ ∈ (0,1): Balance between bias and variance

Typical values: γ = 0.99, λ = 0.95
```

```python
def compute_gae(rewards, values, dones, gamma=0.99, lam=0.95):
    """Compute Generalized Advantage Estimation (GAE)."""
    advantages = []
    gae = 0

    # Append a zero value for the terminal state
    values = values + [0.0]

    for t in reversed(range(len(rewards))):
        delta = rewards[t] + gamma * values[t + 1] * (1 - dones[t]) - values[t]
        gae = delta + gamma * lam * (1 - dones[t]) * gae
        advantages.insert(0, gae)

    returns = [adv + val for adv, val in zip(advantages, values[:-1])]
    return advantages, returns
```

---

## 5. Proximal Policy Optimization (PPO)

### 5.1 Why PPO?

PPO is the most widely used RL algorithm due to its simplicity, stability, and strong performance across diverse tasks. It addresses a fundamental problem in policy gradients: **how large should each policy update be?**

```
Policy Update Problem:

Small updates:     Safe but slow — may take millions of samples
                   ┌──────────────────────────────────────┐
                   │  θ₁ ──▶ θ₂ ──▶ θ₃ ──▶ ... ──▶ θ*  │
                   │  (tiny steps, always improving)      │
                   └──────────────────────────────────────┘

Large updates:     Fast but dangerous — can catastrophically degrade policy
                   ┌──────────────────────────────────────┐
                   │  θ₁ ──────▶ θ₂ ──────▶ θ₃ 💀       │
                   │  (big step, policy collapsed!)       │
                   └──────────────────────────────────────┘

PPO solution:      Clip updates to stay close to the previous policy
                   ┌──────────────────────────────────────┐
                   │  θ₁ ────▶ θ₂ ────▶ θ₃ ────▶ ...    │
                   │  (adaptive step, clipped constraint)  │
                   └──────────────────────────────────────┘
```

### 5.2 PPO-Clip Objective

```
PPO-Clip Objective:

r(θ) = π_θ(a|s) / π_θ_old(a|s)    (probability ratio)

L^CLIP(θ) = E_t[ min( r(θ) · A_t,  clip(r(θ), 1-ε, 1+ε) · A_t ) ]

Where:
  ε = clip range (typically 0.1–0.2)
  A_t = advantage at time t
  r(θ) = how much the new policy differs from the old one

When A_t > 0 (good action):
  r(θ) is allowed to increase up to 1+ε
  Prevents increasing probability of good actions too aggressively

When A_t < 0 (bad action):
  r(θ) is allowed to decrease down to 1-ε
  Prevents decreasing probability of bad actions too aggressively
```

```
PPO-Clip Visualization:

Probability      r(θ)·A  (A > 0)           r(θ)·A  (A < 0)
  ratio r(θ)     ┌─────────────────┐       ┌─────────────────┐
     │            │                 │       │                 │
 1+ε │─ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─│  -A   │╲                │
     │         ╱  │  min (clipped)  │       │  ╲   min        │
  1  │────────────┼─────────────────│  ─A── │───╲────────────│
     │         ╲  │                 │       │    ╲            │
 1-ε │─ ─ ─ ─ ─ ╲│─ ─ ─ ─ ─ ─ ─ ─│   A   │     ╲──────────│
     │            │  unclipped      │       │       unclipped │
     └────────────┴─────────────────┘       └─────────────────┘
                   r(θ) increases            r(θ) increases
                   (good → allow)            (bad → clipped, penalized)
```

### 5.3 Complete PPO Implementation

```python
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import gymnasium as gym
from torch.distributions import Normal, Categorical


class PPOActorCritic(nn.Module):
    """Actor-Critic network for PPO with separate actor and critic heads."""

    def __init__(self, state_dim, action_dim, hidden_dim=256, continuous=False):
        super().__init__()
        self.continuous = continuous

        # Shared feature extractor
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Tanh(),
        )

        # Actor (policy)
        if continuous:
            self.actor_mean = nn.Linear(hidden_dim, action_dim)
            # Learnable log standard deviation (not dependent on state)
            self.actor_log_std = nn.Parameter(torch.zeros(action_dim))
        else:
            self.actor = nn.Linear(hidden_dim, action_dim)

        # Critic (value function)
        self.critic = nn.Linear(hidden_dim, 1)

    def forward(self, state):
        features = self.shared(state)

        if self.continuous:
            mean = self.actor_mean(features)
            std = self.actor_log_std.exp().expand_as(mean)
            dist = Normal(mean, std)
        else:
            logits = self.actor(features)
            dist = Categorical(logits=logits)

        value = self.critic(features)
        return dist, value

    def act(self, state, deterministic=False):
        """Select action for environment interaction."""
        dist, value = self.forward(torch.FloatTensor(state))

        if deterministic:
            if self.continuous:
                action = dist.mean
            else:
                action = dist.probs.argmax(dim=-1)
        else:
            action = dist.sample()

        log_prob = dist.log_prob(action)
        if self.continuous:
            log_prob = log_prob.sum(dim=-1)

        return action.detach().numpy(), log_prob.detach(), value.squeeze(-1).detach()

    def evaluate(self, states, actions):
        """Evaluate actions for PPO update (used on collected trajectories)."""
        dist, values = self.forward(states)

        log_probs = dist.log_prob(actions)
        if self.continuous:
            log_probs = log_probs.sum(dim=-1)

        entropy = dist.entropy()
        if self.continuous:
            entropy = entropy.sum(dim=-1)

        return log_probs, entropy, values.squeeze(-1)


class RolloutBuffer:
    """Stores trajectories collected by the current policy for PPO updates."""

    def __init__(self):
        self.states = []
        self.actions = []
        self.rewards = []
        self.dones = []
        self.log_probs = []
        self.values = []

    def store(self, state, action, reward, done, log_prob, value):
        self.states.append(state)
        self.actions.append(action)
        self.rewards.append(reward)
        self.dones.append(done)
        self.log_probs.append(log_prob)
        self.values.append(value)

    def compute_returns_and_advantages(self, last_value, gamma=0.99, lam=0.95):
        """Compute GAE advantages and discounted returns."""
        rewards = self.rewards
        values = self.values + [last_value]
        dones = self.dones

        advantages = [0.0] * len(rewards)
        gae = 0.0

        for t in reversed(range(len(rewards))):
            delta = rewards[t] + gamma * values[t + 1] * (1 - dones[t]) - values[t]
            gae = delta + gamma * lam * (1 - dones[t]) * gae
            advantages[t] = gae

        returns = [adv + val for adv, val in zip(advantages, self.values)]
        return advantages, returns

    def get_batches(self, batch_size):
        """Yield mini-batches for PPO update."""
        n = len(self.states)
        indices = np.arange(n)
        np.random.shuffle(indices)

        states = torch.FloatTensor(np.array(self.states))
        actions = torch.FloatTensor(np.array(self.actions))
        old_log_probs = torch.FloatTensor(self.log_probs)

        for start in range(0, n, batch_size):
            end = min(start + batch_size, n)
            idx = indices[start:end]
            yield {
                "states": states[idx],
                "actions": actions[idx],
                "old_log_probs": old_log_probs[idx],
                "advantages": torch.FloatTensor(
                    np.array(self.advantages)[idx]
                ),
                "returns": torch.FloatTensor(
                    np.array(self.returns)[idx]
                ),
            }

    def clear(self):
        self.states.clear()
        self.actions.clear()
        self.rewards.clear()
        self.dones.clear()
        self.log_probs.clear()
        self.values.clear()


class PPOAgent:
    """Proximal Policy Optimization agent."""

    def __init__(
        self,
        state_dim,
        action_dim,
        lr=3e-4,
        gamma=0.99,
        lam=0.95,
        clip_range=0.2,
        entropy_coef=0.01,
        value_coef=0.5,
        max_grad_norm=0.5,
        ppo_epochs=10,
        mini_batch_size=64,
        continuous=False,
    ):
        self.gamma = gamma
        self.lam = lam
        self.clip_range = clip_range
        self.entropy_coef = entropy_coef
        self.value_coef = value_coef
        self.max_grad_norm = max_grad_norm
        self.ppo_epochs = ppo_epochs
        self.mini_batch_size = mini_batch_size

        self.model = PPOActorCritic(state_dim, action_dim, continuous=continuous)
        self.optimizer = optim.Adam(self.model.parameters(), lr=lr, eps=1e-5)
        self.buffer = RolloutBuffer()

    def select_action(self, state, deterministic=False):
        return self.model.act(state, deterministic)

    def store_transition(self, state, action, reward, done, log_prob, value):
        self.buffer.store(state, action, reward, done, log_prob, value)

    def compute_last_value(self, last_state):
        with torch.no_grad():
            _, value = self.model(torch.FloatTensor(last_state))
            return value.item()

    def update(self):
        """PPO update step — multiple epochs over collected data."""
        # Compute advantages and returns
        last_value = self.buffer.values[-1] if self.buffer.values else 0
        self.buffer.advantages, self.buffer.returns = (
            self.buffer.compute_returns_and_advantages(
                last_value, self.gamma, self.lam
            )
        )

        # PPO update for multiple epochs
        total_policy_loss = 0
        total_value_loss = 0
        total_entropy_loss = 0
        update_count = 0

        for epoch in range(self.ppo_epochs):
            for batch in self.buffer.get_batches(self.mini_batch_size):
                states = batch["states"]
                actions = batch["actions"]
                old_log_probs = batch["old_log_probs"]
                advantages = batch["advantages"]
                returns = batch["returns"]

                # Normalize advantages
                advantages = (advantages - advantages.mean()) / (
                    advantages.std() + 1e-8
                )

                # Evaluate current policy
                new_log_probs, entropy, values = self.model.evaluate(
                    states, actions
                )

                # Probability ratio
                ratio = torch.exp(new_log_probs - old_log_probs)

                # PPO-Clip loss
                surr1 = ratio * advantages
                surr2 = torch.clamp(
                    ratio, 1.0 - self.clip_range, 1.0 + self.clip_range
                ) * advantages
                policy_loss = -torch.min(surr1, surr2).mean()

                # Value loss (clipped)
                value_loss = nn.MSELoss()(values, returns)

                # Entropy bonus
                entropy_loss = -entropy.mean()

                # Total loss
                loss = (
                    policy_loss
                    + self.value_coef * value_loss
                    + self.entropy_coef * entropy_loss
                )

                # Gradient step
                self.optimizer.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(
                    self.model.parameters(), self.max_grad_norm
                )
                self.optimizer.step()

                total_policy_loss += policy_loss.item()
                total_value_loss += value_loss.item()
                total_entropy_loss += entropy_loss.item()
                update_count += 1

        self.buffer.clear()

        return {
            "policy_loss": total_policy_loss / max(update_count, 1),
            "value_loss": total_value_loss / max(update_count, 1),
            "entropy_loss": total_entropy_loss / max(update_count, 1),
        }
```

### 5.4 Training PPO on Continuous Control

```python
def train_ppo(
    env_name="Pendulum-v1",
    num_episodes=500,
    rollout_steps=2048,
    lr=3e-4,
    gamma=0.99,
    lam=0.95,
    clip_range=0.2,
    ppo_epochs=10,
    mini_batch_size=64,
):
    """Train PPO on a continuous control environment."""
    env = gym.make(env_name)
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.shape[0]
    continuous = True

    agent = PPOAgent(
        state_dim=state_dim,
        action_dim=action_dim,
        lr=lr,
        gamma=gamma,
        lam=lam,
        clip_range=clip_range,
        ppo_epochs=ppo_epochs,
        mini_batch_size=mini_batch_size,
        continuous=continuous,
    )

    episode_rewards = []
    global_step = 0

    print(f"Training PPO on {env_name}")
    print(f"{'Episode':>8} │ {'Reward':>8} │ {'Avg(50)':>8} │ {'Steps':>8}")
    print("─" * 50)

    episode = 0
    while episode < num_episodes:
        state, _ = env.reset()
        episode_reward = 0
        done = False

        # Collect rollout
        for _ in range(rollout_steps):
            action, log_prob, value = agent.select_action(state)
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated

            agent.store_transition(
                state, action, reward, float(done), log_prob.item(), value.item()
            )

            state = next_state
            episode_reward += reward
            global_step += 1

            if done:
                episode_rewards.append(episode_reward)
                episode += 1
                state, _ = env.reset()
                episode_reward = 0

                if episode % 50 == 0 and episode > 0:
                    avg = np.mean(episode_rewards[-50:])
                    print(
                        f"{episode:8d} │ {episode_reward:8.1f} │ "
                        f"{avg:8.1f} │ {global_step:8d}"
                    )

        # Bootstrap value for last state
        last_value = agent.compute_last_value(state)

        # PPO update
        losses = agent.update()

    env.close()
    print(f"\nFinal avg reward (last 50): {np.mean(episode_rewards[-50:]):.1f}")
    return episode_rewards
```

### 5.5 PPO Hyperparameters

| Parameter | Typical Range | Default | Description |
|-----------|--------------|---------|-------------|
| Learning rate | 1e-5 – 3e-3 | 3e-4 | Step size for optimizer |
| Clip range (ε) | 0.1 – 0.3 | 0.2 | Max policy update size |
| Gamma (γ) | 0.95 – 0.999 | 0.99 | Discount factor |
| Lambda (λ) | 0.9 – 0.99 | 0.95 | GAE parameter |
| PPO epochs | 3 – 20 | 10 | Passes over collected data |
| Mini-batch size | 32 – 512 | 64 | Batch size for updates |
| Rollout steps | 1024 – 4096 | 2048 | Steps per collection |
| Entropy coefficient | 0.001 – 0.05 | 0.01 | Exploration bonus |
| Value coefficient | 0.25 – 1.0 | 0.5 | Value loss weight |
| Max grad norm | 0.5 – 1.0 | 0.5 | Gradient clipping |

---

## 6. Environment Setup with Gymnasium

### 6.1 Gymnasium Basics

```python
import gymnasium as gym
import numpy as np

# ── Creating environments ──
# Discrete action space (e.g., left/right)
env = gym.make("CartPole-v1", render_mode="rgb_array")

# Continuous action space (e.g., torque)
env = gym.make("Pendulum-v1", render_mode="rgb_array")

# Atari (requires gymnasium[atari])
# env = gym.make("ALE/Pong-v5", render_mode="rgb_array")

# ── Observing the environment ──
print(f"Observation space: {env.observation_space}")
# Box([-4.8000002e+00 -3.4028235e+38 -4.1887903e-01 -3.4028235e+38],
#     [4.8000002e+00 3.4028235e+38 4.1887903e-01 3.4028235e+38], (4,), float32)

print(f"Action space: {env.action_space}")
# Discrete(2)  → 0=left, 1=right

print(f"State shape: {env.observation_space.shape}")
# (4,)  → [cart_pos, cart_vel, pole_angle, pole_angular_vel]

# ── Interacting with the environment ──
state, info = env.reset(seed=42)   # Reset and get initial state
print(f"Initial state: {state}")

action = env.action_space.sample()  # Random action
print(f"Random action: {action}")

next_state, reward, terminated, truncated, info = env.step(action)
# terminated = natural episode end (fell over, reached goal)
# truncated = time limit reached
done = terminated or truncated

print(f"Next state: {next_state}")
print(f"Reward: {reward}")
print(f"Done: {done}")

env.close()
```

### 6.2 Environment Reference

| Environment | State Shape | Action Space | Max Reward | Difficulty |
|------------|------------|-------------|-----------|-----------|
| `CartPole-v1` | (4,) | Discrete(2) | 500 | Easy |
| `MountainCar-v0` | (2,) | Discrete(3) | -110 | Medium |
| `Acrobot-v1` | (6,) | Discrete(3) | 0 | Medium |
| `Pendulum-v1` | (3,) | Continuous(1) | 0 | Medium |
| `LunarLander-v2` | (8,) | Discrete(4) | ~300 | Hard |
| `BipedalWalker-v3` | (24,) | Continuous(4) | ~300 | Hard |

### 6.3 Wrapping Environments

```python
import gymnasium as gym
from gymnasium.wrappers import TimeLimit, RecordEpisodeStatistics


def make_env(env_name, seed=42, max_episode_steps=1000):
    """Create a wrapped environment with standard settings."""
    env = gym.make(env_name)
    env = RecordEpisodeStatistics(env)       # Track episode rewards/length
    env = TimeLimit(env, max_episode_steps)  # Cap episode length
    env.reset(seed=seed)
    return env


# Vectorized environments for parallel data collection
def make_vec_env(env_name, num_envs=4, seed=42):
    """Create multiple env instances for parallel collection."""
    envs = gym.vector.SyncVectorEnv(
        [lambda: make_env(env_name, seed + i) for i in range(num_envs)]
    )
    return envs

# Example: 4 parallel CartPole envs
# vec_envs = make_vec_env("CartPole-v1", num_envs=4)
# states, _ = vec_envs.reset()          # shape: (4, 4)
# actions = vec_envs.action_space.sample()  # shape: (4,)
# next_states, rewards, terminateds, truncateds, infos = vec_envs.step(actions)
```

---

## 7. Exploration vs. Exploitation

### 7.1 The Dilemma

```
┌──────────────────────────────────────────────────────────────────┐
│              EXPLORATION vs. EXPLOITATION                         │
│                                                                    │
│  EXPLORE: Try new actions to discover unknown rewards              │
│           ┌────────────────────────────────────┐                   │
│           │  🎲 Random action                   │                   │
│           │  "What if I go left instead?"       │                   │
│           │  High short-term risk               │                   │
│           │  Long-term information gain         │                   │
│           └────────────────────────────────────┘                   │
│                                                                    │
│  EXPLOIT: Use known good actions to maximize reward                │
│           ┌────────────────────────────────────┐                   │
│           │  🏆 Greedy action                   │                   │
│           │  "I know right works, go right"     │                   │
│           │  Low short-term risk                │                   │
│           │  May miss better options            │                   │
│           └────────────────────────────────────┘                   │
│                                                                    │
│  THE DILEMMA:                                                     │
│  Too much exploration → waste time on bad actions                  │
│  Too much exploitation → get stuck in local optimum               │
│                                                                    │
│  Solution: Anneal exploration over time                            │
│  Start: high exploration (don't know anything)                     │
│  End:   high exploitation (know what's good)                       │
└──────────────────────────────────────────────────────────────────┘
```

### 7.2 Exploration Strategies

```python
import numpy as np
import torch


class EpsilonGreedy:
    """ε-greedy: with probability ε, take random action; otherwise greedy."""

    def __init__(self, epsilon_start=1.0, epsilon_end=0.01, decay=0.995):
        self.epsilon = epsilon_start
        self.epsilon_end = epsilon_end
        self.decay = decay

    def select(self, q_values):
        """q_values: array of Q-values for each action."""
        if np.random.random() < self.epsilon:
            return np.random.randint(len(q_values))  # explore
        return np.argmax(q_values)                     # exploit

    def step(self):
        self.epsilon = max(self.epsilon_end, self.epsilon * self.decay)


class BoltzmannExploration:
    """Boltzmann (softmax) exploration: probability ∝ exp(Q / τ)."""

    def __init__(self, temperature=1.0, decay=0.999):
        self.temperature = temperature
        self.decay = decay

    def select(self, q_values):
        probs = np.exp(q_values / self.temperature)
        probs = probs / probs.sum()
        return np.random.choice(len(q_values), p=probs)

    def step(self):
        self.temperature = max(0.01, self.temperature * self.decay)


class OUNoise:
    """Ornstein-Uhlenbeck process for temporally correlated exploration."""

    def __init__(self, size, mu=0.0, theta=0.15, sigma=0.2):
        self.mu = mu * np.ones(size)
        self.theta = theta
        self.sigma = sigma
        self.state = None
        self.reset()

    def reset(self):
        self.state = self.mu.copy()

    def sample(self):
        dx = self.theta * (self.mu - self.state) + self.sigma * np.random.randn(
            len(self.state)
        )
        self.state += dx
        return self.state


# Usage examples:
# Discrete: ε-greedy for DQN
explorer = EpsilonGreedy(epsilon_start=1.0, epsilon_end=0.01, decay=0.995)
q_vals = np.array([0.5, 1.2, 0.8, 0.3])
action = explorer.select(q_vals)

# Continuous: OU noise for DDPG/TD3
ou = OUNoise(size=4)  # 4-dimensional action
noise = ou.sample()   # temporally smooth noise to add to actions
```

### 7.3 Exploration by Network Parameters

```python
class NoisyLinear(nn.Module):
    """Noisy Linear Layer: adds learned noise to weights for exploration.

    Replaces ε-greedy with parameter noise — the agent explores by acting
    according to its own noisy policy, not by random actions.
    """

    def __init__(self, in_features, out_features, sigma_init=0.5):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features

        # Learnable parameters
        self.weight_mu = nn.Parameter(torch.empty(out_features, in_features))
        self.weight_sigma = nn.Parameter(torch.empty(out_features, in_features))
        self.bias_mu = nn.Parameter(torch.empty(out_features))
        self.bias_sigma = nn.Parameter(torch.empty(out_features))

        # Register buffers for noise (not learnable)
        self.register_buffer("weight_epsilon", torch.empty(out_features, in_features))
        self.register_buffer("bias_epsilon", torch.empty(out_features))

        self.sigma_init = sigma_init
        self.reset_parameters()
        self.reset_noise()

    def reset_parameters(self):
        mu_range = 1.0 / self.in_features**0.5
        self.weight_mu.data.uniform_(-mu_range, mu_range)
        self.weight_sigma.data.fill_(self.sigma_init / self.in_features**0.5)
        self.bias_mu.data.uniform_(-mu_range, mu_range)
        self.bias_sigma.data.fill_(self.sigma_init / self.out_features**0.5)

    def reset_noise(self):
        epsilon_in = self._scale_noise(self.in_features)
        epsilon_out = self._scale_noise(self.out_features)
        self.weight_epsilon.copy_(epsilon_out.outer(epsilon_in))
        self.bias_epsilon.copy_(epsilon_out)

    def _scale_noise(self, size):
        x = torch.randn(size)
        return x.sign() * x.abs().sqrt()

    def forward(self, x):
        if self.training:
            weight = self.weight_mu + self.weight_sigma * self.weight_epsilon
            bias = self.bias_mu + self.bias_sigma * self.bias_epsilon
        else:
            weight = self.weight_mu
            bias = self.bias_mu
        return torch.nn.functional.linear(x, weight, bias)
```

---

## 8. Reward Shaping

### 8.1 Designing Reward Functions

The reward function is the most critical and often the most difficult part of RL. A well-designed reward function guides the agent toward desired behavior; a poorly designed one leads to unexpected and often undesirable outcomes.

```
Reward Design Pitfalls:

Sparse Reward (only at goal):
  Episode: ......... +1
  Problem: Agent gets no signal until it stumbles onto the goal
  Solution: Dense reward shaping, curiosity-driven exploration

Reward Hacking:
  Goal: "collect coins in Mario"
  Bad reward: +1 for coins, -0.01 per step
  Agent learns: stand still and wait for coins to fall on you
  Fix: reward for progress, not just state

Misaligned Reward:
  Goal: "clean the room"
  Reward: +1 per item removed from view
  Agent learns: throw everything in the closet
  Fix: reward for correct placement, not just removal
```

### 8.2 Common Reward Shaping Techniques

| Technique | Description | When to Use |
|-----------|------------|-------------|
| **Dense rewards** | Give reward at every step, not just terminal | Sparse reward environments |
| **Curriculum** | Start easy, increase difficulty | Complex tasks with long horizons |
| **Curiosity** | Reward for visiting novel states | Large state spaces, sparse rewards |
| **Hindsight** | Relabel failed episodes as successes with different goals | Goal-conditioned tasks |
| **Potential-based** | Add Φ(s') - Φ(s) bonus (provably optimal shaping) | When you know the goal state |

```python
def dense_reward_shaping(state, next_state, original_reward, goal):
    """Add potential-based shaping reward.

    Potential Φ(s) = -distance(s, goal)
    Shaping reward = Φ(s') - Φ(s) = -(dist(s', goal) - dist(s, goal))
    This gives positive reward for moving toward the goal.
    """
    dist_before = np.linalg.norm(state - goal)
    dist_after = np.linalg.norm(next_state - goal)
    shaping_reward = -(dist_after - dist_before)  # positive if closer to goal
    return original_reward + shaping_reward


def curiosity_reward(state, next_state, forward_model, intrinsic_weight=0.1):
    """Intrinsic Curiosity Module (ICM) — reward for prediction error.

    The forward model tries to predict the next state's features given
    the current state features and action. High prediction error means
    the agent encountered something novel.
    """
    with torch.no_grad():
        state_feat = forward_model.feature_encoder(state)
        next_feat = forward_model.feature_encoder(next_state)
        predicted_feat = forward_model.forward_model(state_feat)
        intrinsic_reward = nn.MSELoss()(predicted_feat, next_feat).item()

    return intrinsic_reward * intrinsic_weight
```

### 8.3 Hindsight Experience Replay (HER)

```python
class HindsightReplayBuffer:
    """Replay buffer with Hindsight Experience Replay.

    Even if an episode fails to reach the original goal, we can relabel
    the trajectory as a success with a different (achieved) goal.
    """

    def __init__(self, capacity=100_000, num_her_goals=4):
        self.buffer = deque(maxlen=capacity)
        self.num_her_goals = num_her_goals

    def store_episode(self, states, actions, rewards, goal):
        """Store a full episode with the original goal."""
        for i in range(len(states)):
            self.buffer.append({
                "state": np.concatenate([states[i], goal]),
                "action": actions[i],
                "reward": rewards[i],
                "next_state": np.concatenate([states[min(i+1, len(states)-1)], goal]),
            })

            # Hindsight: also store with achieved goal
            if i < len(states) - 1 and self.num_her_goals > 0:
                achieved_goal = states[-1]  # final state as "goal"
                self.buffer.append({
                    "state": np.concatenate([states[i], achieved_goal]),
                    "action": actions[i],
                    "reward": 0.0,  # reached this sub-goal
                    "next_state": np.concatenate([states[i+1], achieved_goal]),
                })

    def sample(self, batch_size):
        batch = random.sample(self.buffer, batch_size)
        return {k: torch.FloatTensor(np.array([b[k] for b in batch]))
                for k in batch[0]}
```

---

## 9. Practical RL Training Tips

### 9.1 Debugging RL Training

RL is notoriously difficult to debug. Here is a systematic approach:

```
RL Debugging Flowchart:

Training is not improving?
├── Check rewards: Are they being computed correctly?
│   └── Print rewards every step for first few episodes
├── Check environment: Is reset() working? Are done signals correct?
│   └── Run random policy and check average return
├── Check network: Are gradients flowing?
│   └── Print gradient norms, check for NaN/inf
├── Check hyperparameters: Is learning rate appropriate?
│   └── Try lr ∈ {1e-5, 1e-4, 1e-3, 1e-2}
└── Check exploration: Is the agent exploring enough?
    └── Log action distribution, entropy, ε (for DQN)

Training is unstable (oscillating)?
├── Reduce learning rate
├── Increase batch size
├── Increase replay buffer size
├── Check for reward scale (normalize rewards)
└── Add gradient clipping

Training is sample-inefficient?
├── Use prioritized replay (DQN) or GAE (PPO)
├── Increase network capacity
├── Tune γ and λ
└── Use reward normalization
```

### 9.2 Reward Normalization

```python
class RewardNormalizer:
    """Normalize rewards using running statistics to stabilize training."""

    def __init__(self, gamma=0.99):
        self.return_rms = RunningMeanStd(shape=())
        self.returns = 0.0
        self.gamma = gamma

    def normalize(self, reward, done):
        self.returns = reward + self.gamma * self.returns * (1 - done)
        self.return_rms.update(self.returns)
        normalized = reward / (self.return_rms.std + 1e-8)
        if done:
            self.returns = 0.0
        return normalized


class RunningMeanStd:
    """Tracks running mean and variance using Welford's algorithm."""

    def __init__(self, shape=(), epsilon=1e-8):
        self.mean = np.zeros(shape, dtype=np.float64)
        self.var = np.ones(shape, dtype=np.float64)
        self.count = epsilon

    def update(self, x):
        batch_mean = np.mean(x, axis=0)
        batch_var = np.var(x, axis=0)
        batch_count = 1 if np.isscalar(x) else len(x)
        self._update_from_moments(batch_mean, batch_var, batch_count)

    def _update_from_moments(self, batch_mean, batch_var, batch_count):
        delta = batch_mean - self.mean
        total = self.count + batch_count
        new_mean = self.mean + delta * batch_count / total
        m_a = self.var * self.count
        m_b = batch_var * batch_count
        m2 = m_a + m_b + delta**2 * self.count * batch_count / total
        self.mean = new_mean
        self.var = m2 / total
        self.count = total

    @property
    def std(self):
        return np.sqrt(self.var)
```

### 9.3 Comparison Table: DQN vs. PPO

| Aspect | DQN | PPO |
|--------|-----|-----|
| **Algorithm family** | Value-based | Actor-Critic (policy gradient) |
| **Action space** | Discrete | Discrete + Continuous |
| **Off-policy** | Yes (replay buffer) | No (on-policy) |
| **Sample efficiency** | Higher (replays old data) | Lower (discards old data) |
| **Stability** | Good (target network) | Very good (clipping) |
| **Hyperparameter sensitivity** | Moderate | Low (robust defaults) |
| **Compute cost** | Low (one network) | Moderate (actor + critic) |
| **Best for** | Atari, discrete control | Continuous control, robotics |
| **Key trick** | Experience replay + target net | PPO-Clip + GAE |
| **Exploration** | ε-greedy or NoisyNets | Entropy bonus (implicit) |

---

## 10. Advanced Topics

### 10.1 Soft Actor-Critic (SAC)

SAC is an off-policy actor-critic method that maximizes both expected return and policy entropy — it learns a stochastic policy that is as random as possible while still achieving high rewards:

```
SAC Objective:
  J(π) = E_π[Σₜ γᵗ (rₜ + α · H(π(·|sₜ)))]

  Where H(π(·|sₜ)) is the entropy of the policy
  α is the temperature parameter (controls exploration-exploitation tradeoff)

  Higher α → more exploration, more stochastic policy
  Lower α → more exploitation, more deterministic policy

  SAC automatically tunes α to match a target entropy
```

### 10.2 Multi-Agent RL (MARL)

```python
# Simplified multi-agent setup
class MultiAgentEnv:
    """N agents interact in a shared environment."""

    def __init__(self, num_agents=2):
        self.num_agents = num_agents
        self.agents = [DQNAgent(state_dim=4, action_dim=2)
                       for _ in range(num_agents)]

    def step(self, actions):
        """All agents act simultaneously."""
        rewards = []
        for i, (agent, action) in enumerate(zip(self.agents, actions)):
            # Each agent sees its own observation and gets its own reward
            reward = self.compute_reward(i, action, actions)
            rewards.append(reward)
        return rewards

    def compute_reward(self, agent_id, action, all_actions):
        """Reward depends on all agents' actions (cooperative or competitive)."""
        if action == all_actions[1 - agent_id]:
            return 1.0   # coordination bonus
        return 0.0
```

### 10.3 RL with PyTorch — Putting It All Together

```python
"""
Complete RL Training Script
───────────────────────────
Train PPO on LunarLander-v2 (discrete) and Pendulum-v1 (continuous).
"""

import torch
import gymnasium as gym
import numpy as np


def evaluate_agent(agent, env_name, num_episodes=10, render=False):
    """Evaluate a trained agent without exploration."""
    env = gym.make(env_name)
    rewards = []

    for _ in range(num_episodes):
        state, _ = env.reset()
        total_reward = 0
        done = False

        while not done:
            action, _, _ = agent.select_action(state, deterministic=True)
            state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            total_reward += reward

        rewards.append(total_reward)

    env.close()
    mean_reward = np.mean(rewards)
    std_reward = np.std(rewards)
    print(f"Eval: {mean_reward:.1f} ± {std_reward:.1f} "
          f"(over {num_episodes} episodes)")
    return mean_reward, std_reward


def save_checkpoint(agent, path):
    """Save model checkpoint."""
    torch.save({
        "model_state_dict": agent.model.state_dict(),
        "optimizer_state_dict": agent.optimizer.state_dict(),
    }, path)


def load_checkpoint(agent, path):
    """Load model checkpoint."""
    checkpoint = torch.load(path, weights_only=False)
    agent.model.load_state_dict(checkpoint["model_state_dict"])
    agent.optimizer.load_state_dict(checkpoint["optimizer_state_dict"])


# ── Example: Train PPO on LunarLander-v2 ──
if __name__ == "__main__":
    env = gym.make("LunarLander-v2")
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n
    env.close()

    agent = PPOAgent(
        state_dim=state_dim,
        action_dim=action_dim,
        lr=3e-4,
        gamma=0.99,
        lam=0.95,
        clip_range=0.2,
        ppo_epochs=10,
        mini_batch_size=64,
        continuous=False,
    )

    # Training loop (simplified)
    print("Training PPO on LunarLander-v2")
    # ... (use train_ppo function from Section 5.4)

    # Evaluate trained agent
    # evaluate_agent(agent, "LunarLander-v2", num_episodes=20)
    # save_checkpoint(agent, "ppo_lunar_lander.pt")
```

---

## Summary

This chapter covered the foundations and practice of deep reinforcement learning with PyTorch:

| Topic | Key Takeaway |
|-------|-------------|
| **MDP Framework** | States, actions, transitions, rewards, discount factor (γ) |
| **Value Functions** | V(s) = expected return from state s; Q(s,a) = expected return from state s, action a |
| **DQN** | Neural network approximates Q-function; use replay buffer + target network |
| **Double DQN** | Online net selects action, target net evaluates → reduces overestimation |
| **Policy Gradients** | Optimize policy directly: ∇J = E[Gₜ · ∇ log π(aₜ|sₜ)] |
| **REINFORCE** | Monte Carlo policy gradient; high variance, add baseline to reduce it |
| **Actor-Critic** | Actor (policy) + Critic (value) combined; lower variance |
| **GAE** | Generalized Advantage Estimation balances bias and variance via λ |
| **PPO** | Clip policy updates for stability; most popular RL algorithm |
| **Exploration** | ε-greedy (DQN), entropy bonus (PPO), NoisyNets, OU noise (continuous) |
| **Reward Shaping** | Dense rewards, curiosity, HER, potential-based shaping |
| **Gymnasium** | Standard interface for RL environments; use wrappers for vectorization |

---

## Practice Exercises

### Exercise 1: DQN on MountainCar
Train DQN on `MountainCar-v0`. This environment has extremely sparse rewards (-1 per step, -100 at time limit). Modify the reward function to give +1 for each step the car reaches above a certain height. Does this help the agent learn?

### Exercise 2: Double DQN Implementation
Modify the DQN from Section 2.3 to implement Double DQN. Train on CartPole-v1 and compare with standard DQN. Measure: (1) sample efficiency, (2) final performance, (3) Q-value overestimation (plot estimated vs. true values).

### Exercise 3: PPO Hyperparameter Sweep
Train PPO on Pendulum-v1 with different hyperparameter combinations: clip_range ∈ {0.1, 0.2, 0.3}, lr ∈ {1e-4, 3e-4, 1e-3}, entropy_coef ∈ {0.0, 0.01, 0.05}. Which combination converges fastest and achieves the best final reward?

### Exercise 4: Exploration Comparison
Compare three exploration strategies on LunarLander-v2: (1) ε-greedy with linear decay, (2) ε-greedy with exponential decay, (3) Boltzmann exploration with annealing temperature. Plot exploration rate vs. episode for each.

### Exercise 5: Reward Shaping
Train PPO on `BipedalWalker-v3` with: (1) the default reward, (2) a shaped reward that penalizes body tilt and rewards forward velocity, (3) a curriculum that starts with flat terrain and gradually adds obstacles. Compare convergence speed and final performance.

### Exercise 6: Continuous vs. Discrete PPO
Implement PPO with both discrete and continuous action support. Train on: CartPole-v1 (discrete), Pendulum-v1 (continuous), and LunarLander-v2 (discrete). Verify that the same code works for all three.

### Exercise 7: Prioritized Experience Replay
Implement prioritized replay for DQN. Transitions with higher TD-error should be sampled more frequently. Train on CartPole-v1 and compare learning curves with uniform replay. How much faster does the agent learn?

### Exercise 8: Build a Complete RL Agent
Choose a Gymnasium environment of your choice. Implement a complete RL pipeline: environment setup, agent implementation, training loop with logging, evaluation, and checkpointing. Include at least two training improvements (e.g., GAE, reward normalization, gradient clipping). Achieve the environment's "solved" threshold.

---

*End of Chapter 9 — Next: Chapter 10 — Distributed Training*
