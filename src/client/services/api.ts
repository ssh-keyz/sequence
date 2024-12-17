import axios from 'axios';
import { Card, Position, GameState } from '../../server/models/game';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Remove token from requests
export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

// Authentication
export const auth = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password
    });
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', {
      username,
      password
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', {
      refreshToken
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Games
export const games = {
  create: async () => {
    const response = await api.post('/games');
    return response.data;
  },

  join: async (gameId: string) => {
    const response = await api.post(`/games/${gameId}/join`);
    return response.data;
  },

  start: async (gameId: string) => {
    const response = await api.post(`/games/${gameId}/start`);
    return response.data;
  },

  makeMove: async (gameId: string, card: Card, position: Position) => {
    const response = await api.post(`/games/${gameId}/move`, {
      card,
      position
    });
    return response.data;
  },

  getState: async (gameId: string) => {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/games');
    return response.data;
  }
};

// Error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      if (status === 401) {
        // Token expired or invalid
        removeAuthToken();
        // You might want to trigger a logout action here
      }

      throw {
        status,
        message: data.message || 'An error occurred',
        details: data.details
      };
    } else if (error.request) {
      // Request made but no response
      throw {
        status: 0,
        message: 'Network error',
        details: 'Could not connect to server'
      };
    } else {
      // Something else happened
      throw {
        status: 0,
        message: 'Request error',
        details: error.message
      };
    }
  }
);

export default {
  auth,
  games,
  setAuthToken,
  removeAuthToken
}; 