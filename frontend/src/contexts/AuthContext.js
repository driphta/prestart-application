import React, { createContext, useState, useContext, useEffect } from 'react';
import db, { getUserByEmail, createUser, saveToken, getTokenByValue } from '../utils/db';

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
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const storedToken = await getTokenByValue(token);
            if (storedToken && storedToken.userId) {
              const user = await db.users.get(storedToken.userId);
              if (user) {
                setUser(user);
              } else {
                localStorage.removeItem('authToken');
              }
            } else {
              localStorage.removeItem('authToken');
            }
          } catch (error) {
            console.error('Error checking token:', error);
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error.message);
      } finally {
        // Always set loading to false, even if there's an error
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Login attempt with:', { email, password });
      const user = await getUserByEmail(email);
      console.log('Found user:', user);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      // Create and store token
      const token = Math.random().toString(36).substring(2);
      console.log('Generated token:', token);
      
      await saveToken({ token, userId: user.id });
      console.log('Saved token');
      
      localStorage.setItem('authToken', token);
      console.log('Set token in localStorage');

      setUser(user);
      console.log('Set user in context:', user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const user = await createUser(userData);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // Context value
  const value = {
    user,
    login,
    logout,
    register,
    loading,
    error
  };

  // Only show loading state for the initial auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error in a nice format
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
