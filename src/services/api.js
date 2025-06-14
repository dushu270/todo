import axios from 'axios';

// TODO: Replace with your backend URL when deployed
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const todoAPI = {
  // Namespace operations
  getNamespaces: () => api.get('/namespaces'),
  createNamespace: (name) => api.post('/namespaces', { name }),
  deleteNamespace: (id) => api.delete(`/namespaces/${id}`),

  // Task operations
  getTasks: (namespaceId) => api.get(`/namespaces/${namespaceId}/tasks`),
  createTask: (namespaceId, task) => api.post(`/namespaces/${namespaceId}/tasks`, task),
  updateTask: (namespaceId, taskId, updates) => api.put(`/namespaces/${namespaceId}/tasks/${taskId}`, updates),
  deleteTask: (namespaceId, taskId) => api.delete(`/namespaces/${namespaceId}/tasks/${taskId}`),
  
  // Checklist operations
  updateChecklistItem: (namespaceId, taskId, itemIndex, completed) => 
    api.put(`/namespaces/${namespaceId}/tasks/${taskId}/checklist/${itemIndex}`, { completed }),
};

export default api; 