const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Simple JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Generate JWT token
const generateToken = (username) => {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = (channelManager) => {
  // Login endpoint
  router.post('/login', (req, res) => {
    const { username } = req.body;
    
    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (username.length > 50) {
      return res.status(400).json({ error: 'Username too long (max 50 characters)' });
    }

    const token = generateToken(username);
    
    res.json({
      success: true,
      token,
      username,
      message: `Welcome ${username}!`
    });
  });

  // Get all channels
  router.get('/channels', (req, res) => {
    try {
      const channels = channelManager.getAllChannels();
      res.json({ channels });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch channels' });
    }
  });

  // Create a new channel
  router.post('/channels', (req, res) => {
    const { name, createdBy } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'Channel name too long (max 100 characters)' });
    }

    if (!createdBy) {
      return res.status(400).json({ error: 'Created by username is required' });
    }

    try {
      const channel = channelManager.createChannel(name, createdBy);
      res.status(201).json({
        success: true,
        channel: {
          name: channel.name,
          userCount: channel.users.size,
          messageCount: channel.messages.length,
          createdAt: channel.createdAt,
          createdBy: channel.createdBy
        },
        message: `Channel '${name}' created successfully`
      });
    } catch (error) {
      res.status(409).json({ error: error.message });
    }
  });

  // Get channel info
  router.get('/channels/:name', (req, res) => {
    const { name } = req.params;
    
    try {
      const channelInfo = channelManager.getChannelInfo(name);
      res.json({ channel: channelInfo });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // Join a channel
  router.post('/channels/:name/join', (req, res) => {
    const { name } = req.params;
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    try {
      const channel = channelManager.joinChannel(name, username);
      res.json({
        success: true,
        channel: {
          name: channel.name,
          userCount: channel.users.size,
          messageCount: channel.messages.length,
          createdAt: channel.createdAt,
          createdBy: channel.createdBy
        },
        message: `Successfully joined channel '${name}'`
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // Leave a channel
  router.post('/channels/:name/leave', (req, res) => {
    const { name } = req.params;
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    try {
      const success = channelManager.leaveChannel(name, username);
      if (success) {
        res.json({
          success: true,
          message: `Successfully left channel '${name}'`
        });
      } else {
        res.status(404).json({ error: 'Channel not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to leave channel' });
    }
  });

  // Get channel messages
  router.get('/channels/:name/messages', (req, res) => {
    const { name } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    try {
      const messages = channelManager.getChannelMessages(name, limit);
      res.json({ messages });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // Publish a message to a channel (REST API)
  router.post('/publish', (req, res) => {
    const { channel, text, username } = req.body;
    
    if (!channel || !text || !username) {
      return res.status(400).json({ 
        error: 'Channel, text, and username are required' 
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
    }

    try {
      const message = channelManager.addMessage(channel, { username, text });
      res.json({
        success: true,
        message: {
          id: message.id,
          channel: message.channel,
          username: message.username,
          text: message.text,
          timestamp: message.timestamp
        }
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // Get user info (if authenticated)
  router.get('/user', authenticateToken, (req, res) => {
    res.json({
      username: req.user.username,
      authenticated: true
    });
  });

  // Error handling middleware
  router.use((error, req, res, next) => {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

  return router;
};
