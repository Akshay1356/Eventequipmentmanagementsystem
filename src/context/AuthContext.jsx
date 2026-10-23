import React, { useState } from 'react';
import { AuthContext } from './authContextInstance';
import { authService } from '../services/authService';

const HARDCODED_USERS = {
  user: {
    id: 'usr_demo_101',
    name: 'Alex Rivera',
    email: 'user@aura.com',
    role: 'customer',
    company: 'Apex Productions',
  },
  admin: {
    id: 'adm_demo_999',
    name: 'Sarah Chen (Admin)',
    email: 'admin@aura.com',
    role: 'admin',
    department: 'Inventory & Operations',
  },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('aura_auth_user');
      return stored ? JSON.parse(stored) : HARDCODED_USERS.user;
    } catch {
      return HARDCODED_USERS.user;
    }
  });

  const [authMode, setAuthMode] = useState('mock'); // 'mock' | 'live'

  // Authentication supporting both Live API and Hardcoded Demo Logins
  const login = async (identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Check Hardcoded Admin Credentials
    if (
      (cleanId === 'admin' || cleanId === 'admin@aura.com' || cleanId === 'sarah.admin@auraevents.com') &&
      (cleanPass === 'admin' || cleanPass === 'admin123')
    ) {
      try {
        await authService.login('admin@aura.com', 'admin123');
      } catch {
        // Fall back gracefully to mock session
      }
      const user = HARDCODED_USERS.admin;
      setCurrentUser(user);
      sessionStorage.setItem('aura_auth_user', JSON.stringify(user));
      return { success: true, user, role: 'admin' };
    }

    // 2. Check Hardcoded User/Customer Credentials
    if (
      (cleanId === 'user' || cleanId === 'user@aura.com' || cleanId === 'alex.rivera@example.com') &&
      (cleanPass === 'user' || cleanPass === 'user123' || cleanPass === 'demo123')
    ) {
      try {
        await authService.login('user@aura.com', 'user123');
      } catch {
        // Fall back gracefully to mock session
      }
      const user = HARDCODED_USERS.user;
      setCurrentUser(user);
      sessionStorage.setItem('aura_auth_user', JSON.stringify(user));
      return { success: true, user, role: 'customer' };
    }

    // 3. Attempt Live API Authentication if not matched
    try {
      const liveAuth = await authService.login(identifier, password);
      if (liveAuth && liveAuth.user) {
        const user = {
          id: liveAuth.user.userId,
          name: liveAuth.user.fullName,
          email: liveAuth.user.email,
          role: liveAuth.user.role.toLowerCase(),
          phone: liveAuth.user.phone,
        };
        setCurrentUser(user);
        sessionStorage.setItem('aura_auth_user', JSON.stringify(user));
        return { success: true, user, role: user.role };
      }
    } catch (apiErr) {
      return {
        success: false,
        error: apiErr.message || 'Invalid credentials.',
      };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please use admin / admin or user / user.',
    };
  };

  const loginAs = (role) => {
    if (role === 'guest') {
      setCurrentUser(null);
      sessionStorage.removeItem('aura_auth_user');
    } else if (HARDCODED_USERS[role]) {
      const user = HARDCODED_USERS[role];
      setCurrentUser(user);
      sessionStorage.setItem('aura_auth_user', JSON.stringify(user));
    } else if (role === 'customer') {
      const user = HARDCODED_USERS.user;
      setCurrentUser(user);
      sessionStorage.setItem('aura_auth_user', JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('aura_auth_user');
    authService.clearStoredToken();
  };

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        login,
        loginAs,
        logout,
        authMode,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
