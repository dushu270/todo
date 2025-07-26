import axios from 'axios';
import { auth } from '../config/firebase';

// API Configuration - Updated with Lambda API Gateway URL
// Debug environment variables
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API_URL:', process.env.API_URL);
console.log('API_KEY:', process.env.API_KEY);

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? `${process.env.API_URL}/api`  // ✅ Your Lambda API Gateway URL
  : 'http://localhost:4000/api';

console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.API_KEY, // ONLY ADDING API KEY
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

// Handle auth errors and API key issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // API key issue - show error message
      console.error('API Key Error:', error.response?.data);
      alert('API access denied. Please check your configuration.');
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