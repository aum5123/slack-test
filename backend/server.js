const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const { ChannelManager } = require('./channels');
const { WebSocketManager } = require('./websocket');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration
const PORT = process.env.PORT || 3001;
const MAX_MESSAGES = parseInt(process.env.MAX_MESSAGES) || 50;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || (NODE_ENV === 'production' ? false : true),
  credentials: true
}));
app.use(express.json());

// Initialize managers
const channelManager = new ChannelManager(MAX_MESSAGES);
const wsManager = new WebSocketManager(channelManager);

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      wsManager.handleMessage(ws, message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    wsManager.removeConnection(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsManager.removeConnection(ws);
  });
});

// Routes
app.use('/api', routes(channelManager));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = wsManager.getMetrics();
  res.json({
    connectedSockets: metrics.connectedSockets,
    activeChannels: channelManager.getChannelCount(),
    totalMessages: channelManager.getTotalMessages(),
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`Max messages per channel: ${MAX_MESSAGES}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, wss };
