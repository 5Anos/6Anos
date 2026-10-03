import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { apiRequest } from '../api';
import { Locale } from '../i18n';

interface AuthContextType {
  user: AuthUser | null;
  badges: any[];
  classroom: { id: string; name: string; code: string } | null;
  loading: boolean;
  locale: Locale;
  welcomeGreeting: string | null;
  dismissGreeting: () => void;
  setLocale: (loc: Locale) => void;
  login: (email: string, pass: string) => Promise<string | void>;
  register: (data: any) => Promise<string>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocaleState] = useState<Locale>('pt');
  const [welcomeGreeting, setWelcomeGreeting] = useState<string | null>(null);

  const dismissGreeting = () => {
    setWelcomeGreeting(null);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await apiRequest('/api/auth/me');
      if (res && res.user) {
        setUser(res.user);
        setBadges(res.badges || []);
        setClassroom(res.classroom || null);
        if (res.user?.locale) {
          setLocaleState(res.user.locale);
        }
        return;
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    if (res && res.user) {
      if (res.token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', res.token);
      }
      setUser(res.user);
      if (res.user?.locale) setLocaleState(res.user.locale);
      const greeting = res.welcomeGreeting ||
        (res.user.role === 'student'
          ? `Olá, ${res.user.fullName || res.user.name}! Bem-vindo à tua turma ${res.user.turma || '6.º A'}!`
          : `Bem-vinda, Professora ${res.user.name}!`);
      setWelcomeGreeting(greeting);
      await refreshUser();
      return greeting;
    }
  };

  const register = async (data: any) => {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.user) {
      if (res.token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', res.token);
      }
      setUser(res.user);
      if (res.user?.locale) setLocaleState(res.user.locale);
      await refreshUser();
      return res.message || 'Conta criada com sucesso!';
    }
    return 'Conta criada com sucesso!';
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    setUser(null);
    setBadges([]);
    setClassroom(null);
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    const res = await apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res && res.user) {
      setUser(res.user);
      if (res.user?.locale) setLocaleState(res.user.locale);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await apiRequest('/api/auth/me');
      if (res && res.user) {
        setUser(res.user);
        setBadges(res.badges || []);
        setClassroom(res.classroom || null);
      } else {
        setUser(null);
        setBadges([]);
        setClassroom(null);
      }
    } catch {
      setUser(null);
      setBadges([]);
      setClassroom(null);
    }
  };

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    if (user) {
      updateProfile({ locale: loc }).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        badges,
        classroom,
        loading,
        locale,
        welcomeGreeting,
        dismissGreeting,
        setLocale,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
