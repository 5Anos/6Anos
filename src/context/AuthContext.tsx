import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { apiRequest, setStoredToken, getStoredToken } from '../api';
import { Locale } from '../i18n';
import {
  clientRegisterStudent,
  clientLogin,
  clientGetMe,
  seedTeacherIfMissing,
} from '../services/clientFirestore';

interface AuthContextType {
  user: AuthUser | null;
  badges: any[];
  classroom: { id: string; name: string; code: string } | null;
  loading: boolean;
  locale: Locale;
  setLocale: (loc: Locale) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<string>;
  logout: () => Promise<void>;
  quickSwitch: (role: 'student' | 'teacher') => Promise<void>;
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

  const fetchCurrentUser = async () => {
    try {
      // 1. Try server API
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
    } catch {
      // 2. Fallback to client Firestore directly
      try {
        const token = getStoredToken();
        const clientRes = await clientGetMe(token);
        if (clientRes && clientRes.user) {
          setUser(clientRes.user);
          setBadges(clientRes.badges || []);
          setClassroom(clientRes.classroom || null);
          if (clientRes.user?.locale) {
            setLocaleState(clientRes.user.locale);
          }
          return;
        }
      } catch (clientErr) {
        console.warn('Client Firestore fallback check:', clientErr);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    seedTeacherIfMissing().catch(() => {});
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      if (res && res.token) setStoredToken(res.token);
      if (res && res.user) {
        setUser(res.user);
        if (res.user?.locale) setLocaleState(res.user.locale);
        await refreshUser();
        return;
      }
    } catch (err: any) {
      console.warn('Server login attempt returned error, trying direct Firestore login:', err?.message);
      // If error is 405 (Method Not Allowed) or server unreachable, fallback to client Firestore
      if (
        err?.message?.includes('405') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('404')
      ) {
        const directRes = await clientLogin(email, pass);
        if (directRes.token) setStoredToken(directRes.token);
        setUser(directRes.user);
        if (directRes.user?.locale) setLocaleState(directRes.user.locale);
        return;
      }
      // Re-throw user-facing credential error
      throw err;
    }
  };

  const register = async (data: any) => {
    try {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res && res.token) setStoredToken(res.token);
      if (res && res.user) {
        setUser(res.user);
        if (res.user?.locale) setLocaleState(res.user.locale);
        await refreshUser();
        return res.message || 'Conta criada com sucesso!';
      }
      return 'Conta criada com sucesso!';
    } catch (err: any) {
      console.warn('Server register attempt returned error, trying direct Firestore register:', err?.message);
      // If error is 405 (Method Not Allowed) or server unreachable, fallback to client Firestore
      if (
        err?.message?.includes('405') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('404')
      ) {
        const directRes = await clientRegisterStudent(data);
        if (directRes.token) setStoredToken(directRes.token);
        setUser(directRes.user);
        if (directRes.user?.locale) setLocaleState(directRes.user.locale);
        return directRes.message;
      }
      // Re-throw user-facing error
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {}
    setStoredToken(null);
    setUser(null);
  };

  const quickSwitch = async (role: 'student' | 'teacher') => {
    try {
      const res = await apiRequest('/api/auth/quick-switch', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      if (res.token) setStoredToken(res.token);
      setUser(res.user);
      if (res.user?.locale) setLocaleState(res.user.locale);
      await refreshUser();
    } catch {
      if (role === 'teacher') {
        await login('imaginebycarla2023@gmail.com', 'carlamo');
      }
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    try {
      const res = await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setUser(res.user);
      if (res.user?.locale) setLocaleState(res.user.locale);
    } catch {
      if (user) {
        setUser({ ...user, ...data });
      }
    }
  };

  const refreshUser = async () => {
    try {
      const res = await apiRequest('/api/auth/me');
      if (res && res.user) {
        setUser(res.user);
        setBadges(res.badges || []);
        setClassroom(res.classroom || null);
        return;
      }
    } catch {
      try {
        const token = getStoredToken();
        const clientRes = await clientGetMe(token);
        if (clientRes && clientRes.user) {
          setUser(clientRes.user);
          setBadges(clientRes.badges || []);
          setClassroom(clientRes.classroom || null);
        }
      } catch (e) {
        console.error('Failed to refresh user', e);
      }
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
        setLocale,
        login,
        register,
        logout,
        quickSwitch,
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
