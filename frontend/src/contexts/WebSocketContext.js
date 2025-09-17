import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const [activeChannels, setActiveChannels] = useState(new Set());
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Use WSS for production, WS for development
    const wsUrl = process.env.REACT_APP_WS_URL || 
      (process.env.NODE_ENV === 'production' ? 'wss://localhost:3001' : 'ws://localhost:3001');
    const newWs = new WebSocket(wsUrl);
    
    newWs.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setWs(newWs);
      wsRef.current = newWs;
      reconnectAttempts.current = 0;
      
      // Re-subscribe to active channels
      activeChannels.forEach(channel => {
        subscribeToChannel(channel);
      });
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    newWs.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setWs(null);
      wsRef.current = null;
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setWs(null);
    setActiveChannels(new Set());
    setMessages({});
  };

  const handleMessage = (data) => {
    switch (data.type) {
      case 'subscribed':
        console.log(`Subscribed to channel: ${data.channel}`);
        break;
        
      case 'unsubscribed':
        console.log(`Unsubscribed from channel: ${data.channel}`);
        break;
        
      case 'messages':
        setMessages(prev => ({
          ...prev,
          [data.channel]: data.messages
        }));
        break;
        
      case 'new_message':
        setMessages(prev => ({
          ...prev,
          [data.message.channel]: [
            ...(prev[data.message.channel] || []),
            data.message
          ]
        }));
        break;
        
      case 'pong':
        // Heartbeat response
        break;
        
      case 'error':
        console.error('WebSocket error:', data.message);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const subscribeToChannel = (channelName) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const username = localStorage.getItem('username');
    if (!username) {
      console.error('No username found');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'subscribe',
      channel: channelName,
      username: username
    }));

    setActiveChannels(prev => new Set([...prev, channelName]));
  };

  const unsubscribeFromChannel = (channelName) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'unsubscribe',
      channel: channelName
    }));

    setActiveChannels(prev => {
      const newSet = new Set(prev);
      newSet.delete(channelName);
      return newSet;
    });
  };

  const sendMessage = (channelName, text) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const username = localStorage.getItem('username');
    if (!username) {
      console.error('No username found');
      return;
    }

    console.log(`Sending message as username: ${username}`);
    wsRef.current.send(JSON.stringify({
      type: 'publish',
      channel: channelName,
      text: text,
      username: username
    }));
  };

  // Method to refresh WebSocket connection when username changes
  const refreshConnection = () => {
    console.log('Refreshing WebSocket connection for new user');
    // Clear all active channels and messages
    setActiveChannels(new Set());
    setMessages({});
    // Force close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    // Disconnect and reconnect
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  };

  // Method to force update username in WebSocket messages
  const updateUsername = (newUsername) => {
    console.log(`Updating WebSocket username to: ${newUsername}`);
    // The username will be read from localStorage in sendMessage
    // This method is mainly for logging and future use
  };


  useEffect(() => {
    connect();

    // Ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      disconnect();
    };
  }, [connect, disconnect]);

  const value = {
    ws,
    isConnected,
    messages,
    activeChannels,
    subscribeToChannel,
    unsubscribeFromChannel,
    sendMessage,
    connect,
    disconnect,
    refreshConnection,
    updateUsername
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
