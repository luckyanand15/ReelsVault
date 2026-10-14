import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCurrentUserId } from '../api/axiosClient';

const USER_ID_STORAGE_KEY = 'userId';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);
        if (storedUserId) {
          setUserId(storedUserId);
          setCurrentUserId(storedUserId);
        }
      } catch (error) {
        console.error('Failed to restore session:', error?.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const authLogin = async id => {
    if (!id) {
      return;
    }
    await AsyncStorage.setItem(USER_ID_STORAGE_KEY, id);
    setCurrentUserId(id);
    setUserId(id);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_ID_STORAGE_KEY);
    setCurrentUserId(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, isLoading, authLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
