import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://prestart-api1.azurewebsites.net/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper functions for API requests
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const validateToken = async (token) => {
  try {
    const response = await api.post('/auth/validate-token', { token });
    return response.data;
  } catch (error) {
    console.error('Token validation error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', { userId, currentPassword, newPassword });
    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const updateProfile = async (userId, profileData) => {
  try {
    const response = await api.post('/auth/update-profile', { userId, ...profileData });
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getUserByEmail = async (email) => {
  try {
    const response = await api.get(`/user/by-email?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error('Get user by email error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getUser = async (id) => {
  try {
    const response = await api.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/user/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    console.error('Get users error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`/user?role=${role}`);
    return response.data;
  } catch (error) {
    console.error('Get users by role error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const saveToken = async (tokenData) => {
  try {
    const response = await api.post('/token', tokenData);
    return response.data;
  } catch (error) {
    console.error('Save token error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getTokenByValue = async (token) => {
  try {
    const response = await api.get(`/token?value=${encodeURIComponent(token)}`);
    return response.data;
  } catch (error) {
    console.error('Get token by value error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const deleteToken = async (token) => {
  try {
    const response = await api.delete(`/token?value=${encodeURIComponent(token)}`);
    return response.data;
  } catch (error) {
    console.error('Delete token error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getBriefings = async () => {
  try {
    const response = await api.get('/briefing');
    return response.data;
  } catch (error) {
    console.error('Get briefings error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getBriefingsByUser = async (userId, role) => {
  try {
    const response = await api.get(`/briefing/by-user?userId=${userId}&role=${role}`);
    return response.data;
  } catch (error) {
    console.error('Get briefings by user error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getBriefing = async (id) => {
  try {
    const response = await api.get(`/briefing/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get briefing error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const createBriefing = async (briefingData) => {
  try {
    const response = await api.post('/briefing', briefingData);
    return response.data;
  } catch (error) {
    console.error('Create briefing error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const updateBriefing = async (briefingData) => {
  try {
    const response = await api.put(`/briefing/${briefingData.id}`, briefingData);
    return response.data;
  } catch (error) {
    console.error('Update briefing error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const deleteBriefing = async (id) => {
  try {
    const response = await api.delete(`/briefing/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete briefing error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getAttendances = async (briefingId) => {
  try {
    const response = await api.get(`/attendance?briefingId=${briefingId}`);
    return response.data;
  } catch (error) {
    console.error('Get attendances error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const createAttendance = async (attendanceData) => {
  try {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  } catch (error) {
    console.error('Create attendance error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const updateAttendance = async (attendanceData) => {
  try {
    const response = await api.put(`/attendance/${attendanceData.id}`, attendanceData);
    return response.data;
  } catch (error) {
    console.error('Update attendance error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const deleteAttendance = async (id) => {
  try {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete attendance error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getProjects = async () => {
  try {
    const response = await api.get('/project');
    return response.data;
  } catch (error) {
    console.error('Get projects error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getProject = async (id) => {
  try {
    const response = await api.get(`/project/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get project error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await api.post('/project', projectData);
    return response.data;
  } catch (error) {
    console.error('Create project error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const updateProject = async (projectData) => {
  try {
    const response = await api.put(`/project/${projectData.id}`, projectData);
    return response.data;
  } catch (error) {
    console.error('Update project error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await api.delete(`/project/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete project error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Create user error:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export default api;
