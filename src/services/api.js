import axios from 'axios';
import { auth } from '../config/firebase';

// API Configuration - Updated with actual Render backend URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://https://todo-backend-production-5c0a.up.railway.app/api'  // ✅ Your actual Render URL
  : 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Firebase auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions matching your backend endpoints
export const todoAPI = {
  // Auth operations
  registerUser: () => api.post('/auth/register'),
  getUserProfile: () => api.get('/auth/profile'),
  
  // Namespace operations
  getNamespaces: () => api.get('/namespaces'),
  createNamespace: (data) => api.post('/namespaces', data),
  updateNamespace: (id, data) => api.put(`/namespaces/${id}`, data),
  deleteNamespace: (id) => api.delete(`/namespaces/${id}`),
  reorderNamespaces: (namespaceIds) => api.post('/namespaces/reorder', { namespaceIds }),

  // Task operations
  getTasks: (params = {}) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  toggleTask: (id) => api.patch(`/tasks/${id}/toggle`),
  
  // Checklist operations
  toggleChecklistItem: (taskId, itemId) => api.patch(`/tasks/${taskId}/checklist/${itemId}/toggle`),
  addChecklistItem: (taskId, data) => api.post(`/tasks/${taskId}/checklist`, data),
  deleteChecklistItem: (taskId, itemId) => api.delete(`/tasks/${taskId}/checklist/${itemId}`),
  
  // Statistics
  getTaskStats: () => api.get('/tasks/stats/summary'),
};

export default api; 