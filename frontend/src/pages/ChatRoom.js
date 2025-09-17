import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { apiService } from '../services/api';

const ChatRoom = () => {
  const { channelName } = useParams();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [channelInfo, setChannelInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { 
    isConnected, 
    messages, 
    subscribeToChannel, 
    unsubscribeFromChannel, 
    sendMessage 
  } = useWebSocket();
  const navigate = useNavigate();

  const decodedChannelName = decodeURIComponent(channelName);

  const fetchChannelInfo = async () => {
    try {
      setLoading(true);
      const response = await apiService.getChannelInfo(decodedChannelName);
      setChannelInfo(response.data.channel);
      setError('');
    } catch (err) {
      setError('Channel not found');
      console.error('Error fetching channel info:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchChannelInfo();
    return () => {
      // Cleanup: unsubscribe from channel when component unmounts
      unsubscribeFromChannel(decodedChannelName);
    };
  }, [decodedChannelName, fetchChannelInfo, unsubscribeFromChannel]);

  useEffect(() => {
    // Subscribe to channel when WebSocket is connected
    if (isConnected) {
      subscribeToChannel(decodedChannelName);
    }
  }, [isConnected, decodedChannelName, subscribeToChannel]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages, decodedChannelName]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    if (message.length > 1000) {
      setError('Message too long (max 1000 characters)');
      return;
    }

    try {
      if (isConnected) {
        // Use WebSocket for real-time messaging
        sendMessage(decodedChannelName, message.trim());
      } else {
        // Fallback to REST API
        await apiService.publishMessage(decodedChannelName, message.trim(), user.username);
      }
      
      setMessage('');
      setError('');
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleBackToChannels = () => {
    navigate('/channels');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading channel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={handleBackToChannels} className="btn btn-primary">
          Back to Channels
        </button>
      </div>
    );
  }

  const channelMessages = messages[decodedChannelName] || [];

  return (
    <div className="container">
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="user-info">
            <div className="user-name">{user.username}</div>
            <div className="text-muted">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>
          
          <div className="channel-info" style={{ padding: '15px 20px' }}>
            <h3>#{decodedChannelName}</h3>
            <p className="text-muted">
              {channelInfo?.userCount || 0} user{(channelInfo?.userCount || 0) !== 1 ? 's' : ''}
            </p>
            <button 
              onClick={handleBackToChannels}
              className="btn btn-secondary w-100"
            >
              Back to Channels
            </button>
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-header">
            <h2>#{decodedChannelName}</h2>
            <div className="text-muted">
              {channelInfo?.messageCount || 0} message{(channelInfo?.messageCount || 0) !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="chat-messages">
            {channelMessages.length === 0 ? (
              <div className="text-center text-muted">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              channelMessages.map((msg) => (
                <div key={msg.id} className="message">
                  <div className="message-header">
                    <span className="message-username">{msg.username}</span>
                    <span className="message-timestamp">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            {error && (
              <div className="error mb-3">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="chat-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message #${decodedChannelName}`}
                className="form-input"
                disabled={!isConnected}
                maxLength={1000}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!message.trim() || !isConnected}
              >
                Send
              </button>
            </form>
            
            {!isConnected && (
              <div className="text-muted text-center mt-2">
                <small>Reconnecting...</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
