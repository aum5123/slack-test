# Slack-lite Chat Application

A real-time chat application built with Node.js, Express, WebSocket, and React. Features channel-based messaging, real-time updates, and a modern UI similar to Slack.

## 🚀 Features

### Core Features
- **Real-time Messaging**: WebSocket-based instant messaging
- **Channel System**: Create and join channels for organized conversations
- **User Authentication**: Simple username-based login (JWT tokens)
- **Message Persistence**: Last 50 messages stored per channel
- **Responsive UI**: Modern, mobile-friendly interface
- **Auto-reconnection**: Automatic WebSocket reconnection with exponential backoff

### Technical Features
- **REST API**: Full REST API for all operations
- **WebSocket Integration**: Real-time bidirectional communication
- **Heartbeat System**: Automatic connection health monitoring
- **Docker Support**: Containerized deployment
- **Error Handling**: Comprehensive error handling and logging
- **Metrics Endpoint**: System monitoring and statistics

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Express API   │    │  Channel Manager│
│   (Frontend)    │◄──►│   (Backend)     │◄──►│  (In-Memory)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│  WebSocket      │
                        │  Server         │
                        └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **WebSocket (ws)** - Real-time communication
- **JWT** - Authentication tokens
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Frontend web server
- **Docker Compose** - Multi-container orchestration

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose (optional)
- npm or yarn

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd slack_test
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health
   - Metrics: http://localhost:3001/metrics

### Manual Installation

1. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the backend**
   ```bash
   npm start
   ```

4. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Backend server port |
| `MAX_MESSAGES` | 50 | Max messages stored per channel |
| `JWT_SECRET` | your-secret-key | JWT signing secret |
| `NODE_ENV` | development | Environment mode |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | http://localhost:3001/api | Backend API URL |
| `REACT_APP_WS_URL` | ws://localhost:3001 | WebSocket URL |

## 📡 API Documentation

### Authentication

#### POST /api/login
Login with username (no password required).

**Request:**
```json
{
  "username": "john_doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "username": "john_doe",
  "message": "Welcome john_doe!"
}
```

### Channels

#### GET /api/channels
Get all available channels.

**Response:**
```json
{
  "channels": [
    {
      "name": "general",
      "userCount": 5,
      "messageCount": 23,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "admin"
    }
  ]
}
```

#### POST /api/channels
Create a new channel.

**Request:**
```json
{
  "name": "general",
  "createdBy": "john_doe"
}
```

#### GET /api/channels/:name
Get channel information.

#### POST /api/channels/:name/join
Join a channel.

#### POST /api/channels/:name/leave
Leave a channel.

### Messages

#### POST /api/publish
Publish a message to a channel.

**Request:**
```json
{
  "channel": "general",
  "text": "Hello everyone!",
  "username": "john_doe"
}
```

#### GET /api/channels/:name/messages
Get channel messages.

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50)

### System

#### GET /health
Health check endpoint.

#### GET /metrics
System metrics and statistics.

## 🔌 WebSocket API

### Connection
Connect to `ws://localhost:3001`

### Message Types

#### Subscribe to Channel
```json
{
  "type": "subscribe",
  "channel": "general",
  "username": "john_doe"
}
```

#### Unsubscribe from Channel
```json
{
  "type": "unsubscribe",
  "channel": "general"
}
```

#### Send Message
```json
{
  "type": "publish",
  "channel": "general",
  "text": "Hello everyone!",
  "username": "john_doe"
}
```

#### Ping (Heartbeat)
```json
{
  "type": "ping"
}
```

### Server Messages

#### New Message
```json
{
  "type": "new_message",
  "message": {
    "id": "msg_123",
    "channel": "general",
    "username": "john_doe",
    "text": "Hello everyone!",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Subscription Confirmation
```json
{
  "type": "subscribed",
  "channel": "general",
  "username": "john_doe",
  "message": "Successfully subscribed to channel 'general'"
}
```

## 🐳 Docker Commands

### Build and Run
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```bash
# Build backend only
docker build -f backend/Dockerfile -t slack-lite-backend .

# Build frontend only
docker build -f frontend/Dockerfile -t slack-lite-frontend ./frontend

# Run backend
docker run -p 3001:3001 slack-lite-backend

# Run frontend
docker run -p 3000:80 slack-lite-frontend
```

## 🧪 Testing

### Manual Testing
1. Open multiple browser tabs/windows
2. Login with different usernames
3. Create channels and join them
4. Send messages and verify real-time updates
5. Test reconnection by stopping/starting the backend

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test (create artillery.yml first)
artillery run artillery.yml
```

## 🔍 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Metrics
```bash
curl http://localhost:3001/metrics
```

**Sample Metrics Response:**
```json
{
  "connectedSockets": 5,
  "activeChannels": 3,
  "totalMessages": 150,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**
   - Set strong JWT secrets
   - Configure proper CORS origins
   - Set production NODE_ENV

2. **Database**
   - Replace in-memory storage with Redis/MongoDB
   - Implement proper data persistence
   - Add database connection pooling

3. **Security**
   - Implement rate limiting
   - Add input validation and sanitization
   - Use HTTPS/WSS in production
   - Implement proper authentication

4. **Scaling**
   - Use Redis for WebSocket scaling
   - Implement horizontal scaling
   - Add load balancing

### Docker Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Use environment-specific compose files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend is running on port 3001
   - Verify CORS configuration
   - Check firewall settings

2. **Messages Not Appearing**
   - Verify WebSocket connection status
   - Check browser console for errors
   - Ensure proper channel subscription

3. **Docker Issues**
   - Check Docker daemon is running
   - Verify port availability
   - Check container logs: `docker-compose logs`

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Check WebSocket connections
# Open browser dev tools → Network → WS tab
```

## 📝 Development

### Project Structure
```
slack_test/
├── backend/
│   ├── server.js          # Main server file
│   ├── routes.js          # REST API routes
│   ├── channels.js        # Channel management
│   ├── websocket.js       # WebSocket handling
│   └── Dockerfile         # Backend container
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   ├── public/            # Static assets
│   ├── Dockerfile         # Frontend container
│   └── nginx.conf         # Nginx configuration
├── docker-compose.yml     # Multi-container setup
├── package.json           # Backend dependencies
└── README.md             # This file
```

### Adding Features

1. **New API Endpoints**
   - Add routes in `backend/routes.js`
   - Update channel manager if needed
   - Add frontend service calls

2. **New WebSocket Events**
   - Add handlers in `backend/websocket.js`
   - Update frontend WebSocket context
   - Add UI components as needed

3. **Database Integration**
   - Replace in-memory storage in `channels.js`
   - Add database connection logic
   - Update Docker configuration

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy Chatting! 🎉**
