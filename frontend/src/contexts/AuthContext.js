import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load token from storage on app start
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      
      if (storedToken) {
        setToken(storedToken);
        apiService.setToken(storedToken);
        socketService.connect(storedToken);
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error loading token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.session?.access_token && response.user) {
        await AsyncStorage.setItem('auth_token', response.session.access_token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(response.user));
        
        setToken(response.session.access_token);
        setUser(response.user);
        setIsAuthenticated(true);
        socketService.connect(response.session.access_token);
        
        return { success: true, user: response.user };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (email, fullName, password, role) => {
    try {
      const response = await apiService.register({
        email,
        fullName,
        password,
        role,
      });
      
      if (response.session?.access_token && response.user) {
        await AsyncStorage.setItem('auth_token', response.session.access_token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(response.user));
        
        setToken(response.session.access_token);
        setUser(response.user);
        setIsAuthenticated(true);
        socketService.connect(response.session.access_token);
        
        return { success: true, user: response.user };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      apiService.clearToken();
      socketService.disconnect();
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
