import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const ChannelList = () => {
  const [channels, setChannels] = useState([]);
  const [newChannelName, setNewChannelName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await apiService.getChannels();
      setChannels(response.data.channels);
      setError('');
    } catch (err) {
      setError('Failed to fetch channels');
      console.error('Error fetching channels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    
    if (!newChannelName.trim()) {
      setError('Channel name is required');
      return;
    }

    if (newChannelName.length > 100) {
      setError('Channel name too long (max 100 characters)');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      await apiService.createChannel(newChannelName.trim(), user.username);
      
      setSuccess(`Channel '${newChannelName}' created successfully`);
      setNewChannelName('');
      
      // Refresh channels list
      await fetchChannels();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create channel');
      console.error('Error creating channel:', err);
    }
  };

  const handleJoinChannel = async (channelName) => {
    try {
      await apiService.joinChannel(channelName, user.username);
      navigate(`/chat/${encodeURIComponent(channelName)}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join channel');
      console.error('Error joining channel:', err);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading channels...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Welcome, {user.username}!</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Channels</h2>
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {success && (
          <div className="success">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateChannel} className="mb-4">
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-input flex-1"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Enter channel name"
              maxLength={100}
            />
            <button
              type="submit"
              className="btn btn-success"
              disabled={!newChannelName.trim()}
            >
              Create Channel
            </button>
          </div>
        </form>

        {channels.length === 0 ? (
          <div className="text-center text-muted">
            <p>No channels available. Create one to get started!</p>
          </div>
        ) : (
          <div className="channel-list">
            {channels.map((channel) => (
              <div key={channel.name} className="channel-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-1">
                    <div className="channel-name">#{channel.name}</div>
                    <div className="channel-info">
                      {channel.userCount} user{channel.userCount !== 1 ? 's' : ''} • 
                      {channel.messageCount} message{channel.messageCount !== 1 ? 's' : ''} • 
                      Created by {channel.createdBy}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinChannel(channel.name)}
                    className="btn btn-primary"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelList;
