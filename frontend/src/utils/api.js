// Base URL for your Azure Functions
const API_BASE_URL = 'https://prestart-api1.azurewebsites.net/api';

// Helper function for making API requests
const fetchWithError = async (url, options = {}) => {
  // Add authentication token to requests if available
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !url.includes('/login') && !url.includes('/register')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
  }

  return response.json();
};

// Authentication API methods
export const login = async (email, password) => {
  return fetchWithError(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (userData) => {
  return fetchWithError(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const validateToken = async (token) => {
  return fetchWithError(`${API_BASE_URL}/auth/validate-token`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
};

export const forgotPassword = async (email) => {
  return fetchWithError(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (token, newPassword) => {
  return fetchWithError(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  return fetchWithError(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    body: JSON.stringify({ userId, currentPassword, newPassword }),
  });
};

export const updateProfile = async (userId, profileData) => {
  return fetchWithError(`${API_BASE_URL}/auth/update-profile`, {
    method: 'POST',
    body: JSON.stringify({ userId, ...profileData }),
  });
};

export const getUserByEmail = async (email) => {
  return fetchWithError(`${API_BASE_URL}/user/by-email?email=${encodeURIComponent(email)}`);
};

export const getUser = async (id) => {
  return fetchWithError(`${API_BASE_URL}/user/${id}`);
};

export const updateUser = async (id, userData) => {
  return fetchWithError(`${API_BASE_URL}/user/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

// Token management
export const saveToken = async (tokenData) => {
  return fetchWithError(`${API_BASE_URL}/token`, {
    method: 'POST',
    body: JSON.stringify(tokenData),
  });
};

export const getTokenByValue = async (token) => {
  return fetchWithError(`${API_BASE_URL}/token?value=${encodeURIComponent(token)}`);
};

export const deleteToken = async (token) => {
  return fetchWithError(`${API_BASE_URL}/token?value=${encodeURIComponent(token)}`, {
    method: 'DELETE',
  });
};

// Briefing API methods
export const getBriefings = async () => {
  return fetchWithError(`${API_BASE_URL}/briefing`);
};

export const getBriefingsByUser = async (userId, role) => {
  return fetchWithError(`${API_BASE_URL}/briefing/by-user?userId=${userId}&role=${role}`);
};

export const getBriefing = async (id) => {
  return fetchWithError(`${API_BASE_URL}/briefing/${id}`);
};

export const createBriefing = async (briefingData) => {
  return fetchWithError(`${API_BASE_URL}/briefing`, {
    method: 'POST',
    body: JSON.stringify(briefingData),
  });
};

export const updateBriefing = async (briefingData) => {
  return fetchWithError(`${API_BASE_URL}/briefing/${briefingData.id}`, {
    method: 'PUT',
    body: JSON.stringify(briefingData),
  });
};

export const deleteBriefing = async (id) => {
  return fetchWithError(`${API_BASE_URL}/briefing/${id}`, {
    method: 'DELETE',
  });
};

// Attendance API methods
export const getAttendances = async (briefingId) => {
  return fetchWithError(`${API_BASE_URL}/attendance?briefingId=${briefingId}`);
};

export const createAttendance = async (attendanceData) => {
  return fetchWithError(`${API_BASE_URL}/attendance`, {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  });
};

export const updateAttendance = async (attendanceData) => {
  return fetchWithError(`${API_BASE_URL}/attendance/${attendanceData.id}`, {
    method: 'PUT',
    body: JSON.stringify(attendanceData),
  });
};

export const deleteAttendance = async (id) => {
  return fetchWithError(`${API_BASE_URL}/attendance/${id}`, {
    method: 'DELETE',
  });
};

// Projects API methods
export const getProjects = async () => {
  return fetchWithError(`${API_BASE_URL}/project`);
};

export const getProject = async (id) => {
  return fetchWithError(`${API_BASE_URL}/project/${id}`);
};

export const createProject = async (projectData) => {
  return fetchWithError(`${API_BASE_URL}/project`, {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
};

export const updateProject = async (projectData) => {
  return fetchWithError(`${API_BASE_URL}/project/${projectData.id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  });
};

export const deleteProject = async (id) => {
  return fetchWithError(`${API_BASE_URL}/project/${id}`, {
    method: 'DELETE',
  });
};

// Users API methods
export const getUsers = async () => {
  return fetchWithError(`${API_BASE_URL}/user`);
};

export const createUser = async (userData) => {
  return fetchWithError(`${API_BASE_URL}/user`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const getUsersByRole = async (role) => {
  return fetchWithError(`${API_BASE_URL}/user?role=${role}`);
};
