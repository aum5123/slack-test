import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ChannelList from './pages/ChannelList';
import ChatRoom from './pages/ChatRoom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider, useWebSocket } from './contexts/WebSocketContext';
import './index.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <WebSocketProvider>
      <AppWithWebSocket />
    </WebSocketProvider>
  );
}

function AppWithWebSocket() {
  const { user } = useAuth();
  const { refreshConnection, updateUsername } = useWebSocket();
  const [lastUsername, setLastUsername] = useState(null);

  // Refresh WebSocket connection when username changes
  useEffect(() => {
    if (user && user.username !== lastUsername) {
      console.log(`Username changed from ${lastUsername} to ${user.username}, refreshing WebSocket connection`);
      setLastUsername(user.username);
      if (refreshConnection) {
        refreshConnection();
      }
      if (updateUsername) {
        updateUsername(user.username);
      }
    }
  }, [user, lastUsername, refreshConnection, updateUsername]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChannelList />} />
        <Route path="/channels" element={<ChannelList />} />
        <Route path="/chat/:channelName" element={<ChatRoom />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
