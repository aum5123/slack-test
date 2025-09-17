import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  login: (username) => api.post('/login', { username }),
  
  // Channels
  getChannels: () => api.get('/channels'),
  createChannel: (name, createdBy) => api.post('/channels', { name, createdBy }),
  getChannelInfo: (name) => api.get(`/channels/${name}`),
  joinChannel: (name, username) => api.post(`/channels/${name}/join`, { username }),
  leaveChannel: (name, username) => api.post(`/channels/${name}/leave`, { username }),
  getChannelMessages: (name, limit = 50) => api.get(`/channels/${name}/messages?limit=${limit}`),
  
  // Messages
  publishMessage: (channel, text, username) => api.post('/publish', { channel, text, username }),
  
  // User
  getUserInfo: () => api.get('/user'),
  
  // System
  getHealth: () => api.get('/health'),
  getMetrics: () => api.get('/metrics'),
};

export default api;
