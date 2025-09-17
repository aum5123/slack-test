import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length > 50) {
      setError('Username too long (max 50 characters)');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(username.trim());
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <div className="card-header text-center">
          <h1 className="card-title">Slack-lite</h1>
          <p className="text-muted">Enter your username to start chatting</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              maxLength={50}
              autoFocus
            />
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || !username.trim()}
          >
            {loading ? 'Logging in...' : 'Start Chatting'}
          </button>
        </form>

        <div className="mt-3 text-center">
          <small className="text-muted">
            No password required - just enter a username to get started
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
