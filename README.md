# Transcendence

A modern web platform for playing Pong and Chess with real-time multiplayer capabilities, powered by Django and featuring 3D visualization, AI opponents, and blockchain integration.

## 🎓 42 School Project

This project is part of the 42 school curriculum, focusing on creating a modern web application with real-time gaming capabilities. It emphasizes:
- Full-stack development
- Real-time communication
- Modern web technologies
- Containerization
- Advanced gaming features


## 🎮 Features

### Gaming
- **Pong Game**
  - Real-time multiplayer matches
  - Tournament system for competitive play
  - 3D visualization mode for enhanced gaming experience
  - AI opponent with good difficulty level

- **Chess Game**
  - Real-time multiplayer matches
  - Matchmaking system for fair matches

### Social Features
- Real-time chat system
- User profiles and statistics
- Friend system and player matching

### Technical Features
- Blockchain integration for game results verification
- Secure authentication system
- Real-time game state updates

## 🛠 Technology Stack

- **Backend**: Django
- **Database**: PostgreSQL
- **Frontend**: Bootstrap
- **Containerization**: Docker
- **3D Graphics**: Three.js
- **Real-time Communication**: WebSocket

## 📋 Prerequisites

- Docker and Docker Compose
- Modern web browser (Google Chrome preferably)

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/AymericJakubczyk/Transcendence.git
cd Transcendence
```

2. Create a `.env` file in the root directory with the following variables:
```.env
#DJANGO
IPHOST = your_ip_address
SECRET_KEY = your_django_secret_key
DJANGO_SUPERUSER_USERNAME = your_superuser_username
DJANGO_SUPERUSER_PASSWORD = your_superuser_password
DJANGO_SUPERUSER_EMAIL = your_superuser_email

#POSTGRESQL
POSTGRES_USER = your_db_username
POSTGRES_PASSWORD = your_db_password
POSTGRES_DB = your_db_name

#WEB3
CONTRACT_ADDRESS = your_contract_address
PRIVATE_KEY = your_private_key
INFURA_SEPOLIA_API_KEY = your_api_key
ABI = your_abi
```

3. Build and run the Docker containers:
```bash
docker-compose up --build
```

4. Access the application:
```
https://localhost:8042
```
  


## 🤝 Authors

- [**Aymeric Jakubczyk**](https://github.com/AymericJakubczyk)
- [**Lilian Morel**](https://github.com/p1kaCode)
- [**Colin Projean**](https://github.com/42Colins)
- [**Ilyes Benhaimouda**](https://github.com/LiesXV)


## 🙏 Acknowledgments

- 42 School for the project requirements and support
- The open-source community for the various libraries and tools used in this project
