// Base URL for your Azure Functions
const API_BASE_URL = 'https://prestart-api.azurewebsites.net/api';

// Helper function for making API requests
const fetchWithError = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
};

// Briefing API methods
export const getBriefings = async () => {
  return fetchWithError(`${API_BASE_URL}/GetBriefings`);
};

export const getBriefing = async (id) => {
  return fetchWithError(`${API_BASE_URL}/GetBriefing?id=${id}`);
};

export const createBriefing = async (briefingData) => {
  return fetchWithError(`${API_BASE_URL}/CreateBriefing`, {
    method: 'POST',
    body: JSON.stringify(briefingData),
  });
};

export const updateBriefing = async (briefingData) => {
  return fetchWithError(`${API_BASE_URL}/UpdateBriefing`, {
    method: 'POST',
    body: JSON.stringify(briefingData),
  });
};

export const deleteBriefing = async (id) => {
  return fetchWithError(`${API_BASE_URL}/DeleteBriefing?id=${id}`);
};

// Attendance API methods
export const getAttendances = async (briefingId) => {
  return fetchWithError(`${API_BASE_URL}/GetAttendances?briefingId=${briefingId}`);
};

export const createAttendance = async (attendanceData) => {
  return fetchWithError(`${API_BASE_URL}/CreateAttendance`, {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  });
};

export const updateAttendance = async (attendanceData) => {
  return fetchWithError(`${API_BASE_URL}/UpdateAttendance`, {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  });
};

export const deleteAttendance = async (id) => {
  return fetchWithError(`${API_BASE_URL}/DeleteAttendance?id=${id}`);
};

// Projects API methods
export const getProjects = async () => {
  return fetchWithError(`${API_BASE_URL}/GetProjects`);
};

// Users API methods
export const getUsers = async () => {
  return fetchWithError(`${API_BASE_URL}/GetUsers`);
};

export const getUsersByRole = async (role) => {
  return fetchWithError(`${API_BASE_URL}/GetUsers?role=${role}`);
};
