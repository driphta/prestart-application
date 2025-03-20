import * as api from './api';

// Base URL for your Azure Functions
const API_BASE_URL = 'https://prestart-api.azurewebsites.net/api';

// Helper function for making API requests with authentication
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  
  return response.json();
};

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: 'Andrew Donaldson',
    email: 'andrew@example.com',
    password: 'password123',
    role: 'site_supervisor',
    lastLogin: null,
    externalId: 'USR001'
  },
  {
    id: 2,
    name: 'Hermmy Mistry',
    email: 'hermmy@example.com',
    password: 'password123',
    role: 'project_manager',
    lastLogin: null,
    externalId: 'USR002'
  },
  {
    id: 3,
    name: 'Marshall Grove-Miller',
    email: 'marshall@example.com',
    password: 'password123',
    role: 'site_supervisor',
    lastLogin: null,
    externalId: 'USR003'
  },
  {
    id: 4,
    name: 'Chris Danzi',
    email: 'chris@example.com',
    password: 'password123',
    role: 'site_supervisor',
    lastLogin: null,
    externalId: 'USR004'
  }
];

// Mock token generation
const generateToken = (user) => {
  // In a real app, we would use JWT signing libraries
  // This is a simplified mock that creates a JWT-like structure
  
  // Create a header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Create a payload
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Date.now(), // issued at time
    exp: Date.now() + (24 * 60 * 60 * 1000) // expires in 24 hours
  };
  
  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Create a signature (not really secure, just for mock purposes)
  // In a real app, this would be a cryptographic signature
  const signature = btoa(
    JSON.stringify({ 
      verified: true, 
      timestamp: Date.now() 
    })
  );
  
  // Combine to form a JWT-like token
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Login API
export const login = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Find user with matching email
      const user = mockUsers.find(u => u.email === email);
      
      // Check if user exists and password matches
      if (user) {
        // For this demo, we'll do a simple password check
        // In a real app, we'd use bcrypt.compare or similar
        if (password === 'password123' || user.password === password) {
          // Generate a mock JWT token
          const token = generateToken(user);
          
          // Return token and user (without password)
          const { password: _, ...userWithoutPassword } = user;
          resolve({ token, user: userWithoutPassword });
        } else {
          reject(new Error('Invalid password'));
        }
      } else {
        reject(new Error('User not found'));
      }
    }, 500); // Simulate network delay
  });
};

// Register API
export const register = async (userData) => {
  // When backend is ready, this will be a real API call
  // return fetchWithAuth(`${API_BASE_URL}/register`, {
  //   method: 'POST',
  //   body: JSON.stringify(userData),
  // });
  
  // Mock implementation for now
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if email already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      
      if (existingUser) {
        reject(new Error('Email already in use'));
        return;
      }
      
      // Create a new user with the next ID
      const newUser = {
        id: mockUsers.length + 1,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'site_supervisor', // Default role
        lastLogin: null,
        externalId: `USR${(mockUsers.length + 1).toString().padStart(3, '0')}`
      };
      
      // Add to mock users
      mockUsers.push(newUser);
      
      // Generate token for the new user
      const token = generateToken(newUser);
      
      // Return user data without password
      const { password, ...userWithoutPassword } = newUser;
      resolve({ token, user: userWithoutPassword });
    }, 500); // Simulate network delay
  });
};

// Validate token API
export const validateToken = async (token) => {
  // When backend is ready, this will be a real API call
  // return fetchWithAuth(`${API_BASE_URL}/validate-token`, {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${token}`
  //   }
  // });
  
  // Mock implementation for now
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!token) {
        reject(new Error('No token provided'));
        return;
      }
      
      try {
        // Decode token (in a real app, this would verify JWT signature)
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        if (decodedToken.exp < Date.now()) {
          reject(new Error('Token has expired'));
          return;
        }
        
        // Find user by ID from token
        const user = mockUsers.find(u => u.id === decodedToken.id);
        
        if (!user) {
          reject(new Error('User not found'));
          return;
        }
        
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } catch (error) {
        reject(new Error('Invalid token'));
      }
    }, 500); // Simulate network delay
  });
};

// Update user API
export const updateUser = async (userData) => {
  // When backend is ready, this will be a real API call
  // return fetchWithAuth(`${API_BASE_URL}/update-user`, {
  //   method: 'POST',
  //   body: JSON.stringify(userData),
  // });
  
  // Mock implementation for now
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockUsers.findIndex(u => u.id === userData.id);
      
      if (index !== -1) {
        // Update user
        mockUsers[index] = {
          ...mockUsers[index],
          ...userData,
        };
        
        // Return user data without password
        const { password, ...userWithoutPassword } = mockUsers[index];
        resolve(userWithoutPassword);
      } else {
        reject(new Error('User not found'));
      }
    }, 500); // Simulate network delay
  });
};

// Update profile API
export const updateProfile = async (userId, profileData) => {
  // When backend is ready, this will be a real API call
  // return fetchWithAuth(`${API_BASE_URL}/user/${userId}`, {
  //   method: 'PUT',
  //   body: JSON.stringify(profileData),
  // });
  
  // Mock implementation for now
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Find user by id
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        reject(new Error('User not found'));
        return;
      }
      
      // Update user data
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...profileData,
        // Don't allow updating these fields
        id: mockUsers[userIndex].id,
        role: mockUsers[userIndex].role
      };
      
      // Return updated user without password
      const { password, ...userWithoutPassword } = mockUsers[userIndex];
      resolve(userWithoutPassword);
    }, 500); // Simulate network delay
  });
};

// Change password API
export const changePassword = async (userId, currentPassword, newPassword) => {
  // When backend is ready, this will be a real API call
  // return fetchWithAuth(`${API_BASE_URL}/user/${userId}/password`, {
  //   method: 'PUT',
  //   body: JSON.stringify({ currentPassword, newPassword }),
  // });
  
  // Mock implementation for now
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Find user by id
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        reject(new Error('User not found'));
        return;
      }
      
      // Verify current password
      if (mockUsers[userIndex].password !== currentPassword) {
        reject(new Error('Current password is incorrect'));
        return;
      }
      
      // Update password
      mockUsers[userIndex].password = newPassword;
      
      resolve({ success: true });
    }, 500); // Simulate network delay
  });
};

// Forgot password API
export const forgotPassword = async (email) => {
  // When backend is ready, this will be a real API call
  // return fetchWithAuth(`${API_BASE_URL}/forgot-password`, {
  //   method: 'POST',
  //   body: JSON.stringify({ email }),
  // });
  
  // Mock implementation for now
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if user exists
      const user = mockUsers.find(u => u.email === email);
      
      if (!user) {
        reject(new Error('User not found'));
        return;
      }
      
      // In a real implementation, this would send an email with a reset link
      console.log(`Password reset link sent to ${email}`);
      
      resolve({ success: true });
    }, 500); // Simulate network delay
  });
};

// Reset password API
export const resetPassword = async (token, newPassword) => {
  // When backend is ready, this will be a real API call
  // return fetchWithAuth(`${API_BASE_URL}/reset-password`, {
  //   method: 'POST',
  //   body: JSON.stringify({ token, newPassword }),
  // });
  
  // Mock implementation for now
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real implementation, this would validate the token and update the password
      console.log(`Password reset with token: ${token}`);
      
      resolve({ success: true });
    }, 500); // Simulate network delay
  });
};

// Update API request helper with authentication
export const applyAuthToRequest = (headers = {}) => {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  
  return headers;
};
