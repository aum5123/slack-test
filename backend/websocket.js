class WebSocketManager {
  constructor(channelManager) {
    this.channelManager = channelManager;
    this.connections = new Map(); // ws -> { username, subscribedChannels: Set }
    this.heartbeatInterval = null;
    this.startHeartbeat();
  }

  // Handle incoming WebSocket messages
  handleMessage(ws, message) {
    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(ws, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(ws, message);
        break;
      case 'publish':
        this.handlePublish(ws, message);
        break;
      case 'ping':
        this.handlePing(ws);
        break;
      case 'join':
        this.handleJoin(ws, message);
        break;
      case 'leave':
        this.handleLeave(ws, message);
        break;
      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  // Handle channel subscription
  handleSubscribe(ws, message) {
    const { channel, username } = message;
    
    if (!channel || !username) {
      ws.send(JSON.stringify({ type: 'error', message: 'Channel and username are required' }));
      return;
    }

    try {
      // Join the channel
      this.channelManager.joinChannel(channel, username);
      
      // Store connection info
      if (!this.connections.has(ws)) {
        this.connections.set(ws, { username, subscribedChannels: new Set() });
      }
      
      const connection = this.connections.get(ws);
      connection.username = username;
      connection.subscribedChannels.add(channel);

      // Send confirmation
      ws.send(JSON.stringify({
        type: 'subscribed',
        channel,
        username,
        message: `Successfully subscribed to channel '${channel}'`
      }));

      // Send recent messages
      const recentMessages = this.channelManager.getChannelMessages(channel, 20);
      ws.send(JSON.stringify({
        type: 'messages',
        channel,
        messages: recentMessages
      }));

      console.log(`${username} subscribed to channel '${channel}'`);
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  }

  // Handle channel unsubscription
  handleUnsubscribe(ws, message) {
    const { channel } = message;
    
    if (!channel) {
      ws.send(JSON.stringify({ type: 'error', message: 'Channel is required' }));
      return;
    }

    const connection = this.connections.get(ws);
    if (connection) {
      connection.subscribedChannels.delete(channel);
      this.channelManager.leaveChannel(channel, connection.username);
      
      ws.send(JSON.stringify({
        type: 'unsubscribed',
        channel,
        message: `Unsubscribed from channel '${channel}'`
      }));

      console.log(`${connection.username} unsubscribed from channel '${channel}'`);
    }
  }

  // Handle message publishing
  handlePublish(ws, message) {
    const { channel, text, username } = message;
    
    if (!channel || !text || !username) {
      ws.send(JSON.stringify({ type: 'error', message: 'Channel, text, and username are required' }));
      return;
    }

    try {
      // Add message to channel
      const messageObj = this.channelManager.addMessage(channel, { username, text });
      
      // Broadcast to all subscribers of this channel
      this.broadcastToChannel(channel, {
        type: 'new_message',
        message: messageObj
      });

      // Send confirmation to sender
      ws.send(JSON.stringify({
        type: 'message_sent',
        messageId: messageObj.id,
        channel,
        message: 'Message sent successfully'
      }));

      console.log(`Message published to channel '${channel}' by ${username}`);
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  }

  // Handle ping
  handlePing(ws) {
    ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
  }

  // Handle join (same as subscribe for now)
  handleJoin(ws, message) {
    this.handleSubscribe(ws, message);
  }

  // Handle leave (same as unsubscribe for now)
  handleLeave(ws, message) {
    this.handleUnsubscribe(ws, message);
  }

  // Broadcast message to all subscribers of a channel
  broadcastToChannel(channelName, message) {
    let sentCount = 0;
    
    for (const [ws, connection] of this.connections) {
      if (connection.subscribedChannels.has(channelName)) {
        try {
          ws.send(JSON.stringify(message));
          sentCount++;
        } catch (error) {
          console.error('Error sending message to client:', error);
          this.removeConnection(ws);
        }
      }
    }
    
    console.log(`Broadcasted message to ${sentCount} subscribers of channel '${channelName}'`);
  }

  // Remove a connection
  removeConnection(ws) {
    const connection = this.connections.get(ws);
    if (connection) {
      // Remove user from all channels
      this.channelManager.removeUserFromAllChannels(connection.username);
      this.connections.delete(ws);
      console.log(`Connection removed for user ${connection.username}`);
    }
  }

  // Start heartbeat to detect dead connections
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const deadConnections = [];
      
      for (const [ws, connection] of this.connections) {
        try {
          ws.ping();
        } catch (error) {
          deadConnections.push(ws);
        }
      }
      
      // Remove dead connections
      deadConnections.forEach(ws => this.removeConnection(ws));
      
      if (deadConnections.length > 0) {
        console.log(`Removed ${deadConnections.length} dead connections`);
      }
    }, 30000); // 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Get metrics
  getMetrics() {
    return {
      connectedSockets: this.connections.size,
      activeChannels: this.channelManager.getChannelCount(),
      totalMessages: this.channelManager.getTotalMessages()
    };
  }

  // Get active users for a channel
  getActiveUsers(channelName) {
    const channel = this.channelManager.channels.get(channelName);
    return channel ? Array.from(channel.users) : [];
  }
}

module.exports = { WebSocketManager };
