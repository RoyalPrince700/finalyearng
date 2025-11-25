import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const projectAPI = {
  getProjects: () => api.get('/project'),
  getProject: (id) => api.get(`/project/${id}`),
  createProject: (data) => api.post('/project', data),
  updateProject: (id, data) => api.put(`/project/${id}`, data),
  deleteProject: (id) => api.delete(`/project/${id}`),
  saveDraft: (id, data) => api.post(`/project/${id}/save`, data),
};

export const aiAPI = {
  generateTopics: (data) => api.post('/ai/topics', data),
  generateChapter: (data) => api.post('/ai/generate', data),
  chat: (data) => api.post('/ai/chat', data),
  chatTopicGeneration: (data) => api.post('/ai/chat/topic-generation', data),
  generateOutline: (projectId) => api.post('/ai/outline', { projectId }),
  getModels: () => api.get('/ai/models'),
};

export const conversationAPI = {
  // Conversation CRUD
  createConversation: (data) => api.post('/conversations', data),
  getConversations: (params) => api.get('/conversations', { params }),
  getConversation: (id) => api.get(`/conversations/${id}`),
  updateConversation: (id, data) => api.put(`/conversations/${id}`, data),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),

  // Message operations
  addMessage: (conversationId, messageData) => api.post(`/conversations/${conversationId}/messages`, messageData),

  // Statistics
  getStats: () => api.get('/conversations/stats'),
};

export default api;
