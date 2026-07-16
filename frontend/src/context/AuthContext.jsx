import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          // Parse stored user to get token and basic data immediately
          const parsedUser = JSON.parse(storedUser);
          // Set it optimistically so UI doesn't completely block if not strictly needed
          // but we still wait for loading to finish
          
          // Verify with backend
          const profile = await authService.getProfile();
          
          // Merge in case getProfile returns updated info
          const verifiedUser = { ...parsedUser, ...profile };
          setUser(verifiedUser);
          localStorage.setItem('user', JSON.stringify(verifiedUser));
        } catch (error) {
          // If profile fetch fails (e.g., 401 Unauthorized), the api interceptor handles it
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (userData) => {
    try {
      const data = await authService.login(userData);
      setUser(data);
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data);
      toast.success('Registered successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info('Logged out');
  };

  const updateProfile = async (userData) => {
    try {
      const data = await authService.updateProfile(userData);
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
