class ChannelManager {
  constructor(maxMessages = 50) {
    this.channels = new Map(); // channelName -> { messages: [], users: Set }
    this.maxMessages = maxMessages;
  }

  // Create a new channel
  createChannel(channelName, createdBy) {
    if (this.channels.has(channelName)) {
      throw new Error('Channel already exists');
    }

    const channel = {
      name: channelName,
      messages: [],
      users: new Set(),
      createdAt: new Date(),
      createdBy
    };

    this.channels.set(channelName, channel);
    console.log(`Channel '${channelName}' created by ${createdBy}`);
    return channel;
  }

  // Join a channel
  joinChannel(channelName, username) {
    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error('Channel does not exist');
    }

    channel.users.add(username);
    console.log(`${username} joined channel '${channelName}'`);
    return channel;
  }

  // Leave a channel
  leaveChannel(channelName, username) {
    const channel = this.channels.get(channelName);
    if (!channel) {
      return false;
    }

    channel.users.delete(username);
    console.log(`${username} left channel '${channelName}'`);
    return true;
  }

  // Add a message to a channel
  addMessage(channelName, message) {
    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error('Channel does not exist');
    }

    const messageObj = {
      id: this.generateMessageId(),
      channel: channelName,
      username: message.username,
      text: message.text,
      timestamp: new Date(),
      type: message.type || 'message'
    };

    channel.messages.push(messageObj);

    // Keep only the last maxMessages messages
    if (channel.messages.length > this.maxMessages) {
      channel.messages = channel.messages.slice(-this.maxMessages);
    }

    console.log(`Message added to channel '${channelName}' by ${message.username}`);
    return messageObj;
  }

  // Get channel messages
  getChannelMessages(channelName, limit = null) {
    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error('Channel does not exist');
    }

    const messages = channel.messages;
    return limit ? messages.slice(-limit) : messages;
  }

  // Get channel info
  getChannelInfo(channelName) {
    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error('Channel does not exist');
    }

    return {
      name: channel.name,
      userCount: channel.users.size,
      messageCount: channel.messages.length,
      createdAt: channel.createdAt,
      createdBy: channel.createdBy,
      users: Array.from(channel.users)
    };
  }

  // Get all channels
  getAllChannels() {
    const channels = [];
    for (const [name, channel] of this.channels) {
      channels.push({
        name: channel.name,
        userCount: channel.users.size,
        messageCount: channel.messages.length,
        createdAt: channel.createdAt,
        createdBy: channel.createdBy
      });
    }
    return channels;
  }

  // Check if channel exists
  channelExists(channelName) {
    return this.channels.has(channelName);
  }

  // Get user count for a channel
  getUserCount(channelName) {
    const channel = this.channels.get(channelName);
    return channel ? channel.users.size : 0;
  }

  // Get total number of channels
  getChannelCount() {
    return this.channels.size;
  }

  // Get total messages across all channels
  getTotalMessages() {
    let total = 0;
    for (const channel of this.channels.values()) {
      total += channel.messages.length;
    }
    return total;
  }

  // Generate unique message ID
  generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Remove user from all channels (when user disconnects)
  removeUserFromAllChannels(username) {
    for (const channel of this.channels.values()) {
      channel.users.delete(username);
    }
    console.log(`User ${username} removed from all channels`);
  }
}

module.exports = { ChannelManager };
