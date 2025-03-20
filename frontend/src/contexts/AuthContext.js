import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register, createUser, validateToken } from '../utils/api';

// Create the auth context
export const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing token
        const token = localStorage.getItem('token');
        if (token) {
          // Validate token with API
          const userData = await validateToken(token);
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register a new user
  const registerUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await register(userData);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(email, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await createUser({
        ...user,
        ...userData,
      });
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
