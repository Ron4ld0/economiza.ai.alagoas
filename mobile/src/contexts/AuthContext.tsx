import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signInWithGoogle: (idToken: string, email: string, name: string, googleId: string) => Promise<void>;
  requestEmailCode: (email: string, name?: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const getApiUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  return `http://${ip}:8000/api/v1`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedUser = await AsyncStorage.getItem('@EconomizaAI:user');
      const storedToken = await AsyncStorage.getItem('@EconomizaAI:token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle(idToken: string, email: string, name: string, googleId: string) {
    const response = await fetch(`${getApiUrl()}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken, email, name, google_id: googleId }),
    });

    if (!response.ok) throw new Error('Falha no login com Google');

    const data = await response.json();
    await AsyncStorage.setItem('@EconomizaAI:user', JSON.stringify(data.user));
    await AsyncStorage.setItem('@EconomizaAI:token', data.access_token);
    
    setUser(data.user);
    setToken(data.access_token);
  }

  async function requestEmailCode(email: string, name?: string) {
    const response = await fetch(`${getApiUrl()}/auth/email/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    
    if (!response.ok) throw new Error('Falha ao enviar código');
  }

  async function verifyEmailCode(email: string, code: string) {
    const response = await fetch(`${getApiUrl()}/auth/email/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) throw new Error('Código inválido ou expirado');

    const data = await response.json();
    await AsyncStorage.setItem('@EconomizaAI:user', JSON.stringify(data.user));
    await AsyncStorage.setItem('@EconomizaAI:token', data.access_token);
    
    setUser(data.user);
    setToken(data.access_token);
  }

  async function signOut() {
    await AsyncStorage.removeItem('@EconomizaAI:user');
    await AsyncStorage.removeItem('@EconomizaAI:token');
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signInWithGoogle, requestEmailCode, verifyEmailCode, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
