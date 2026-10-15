import React, { useState } from 'react';
import { AuthContext } from './authContextInstance';

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

  // Hardcoded authentication for Admin and User
  const login = (identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Hardcoded Admin Authentication
    if (
      (cleanId === 'admin' || cleanId === 'admin@aura.com' || cleanId === 'sarah.admin@auraevents.com') &&
      (cleanPass === 'admin' || cleanPass === 'admin123')
    ) {
      const user = HARDCODED_USERS.admin;
      setCurrentUser(user);
      sessionStorage.setItem('aura_auth_user', JSON.stringify(user));
      return { success: true, user, role: 'admin' };
    }

    // 2. Hardcoded User/Customer Authentication
    if (
      (cleanId === 'user' || cleanId === 'user@aura.com' || cleanId === 'alex.rivera@example.com') &&
      (cleanPass === 'user' || cleanPass === 'user123' || cleanPass === 'demo123')
    ) {
      const user = HARDCODED_USERS.user;
      setCurrentUser(user);
      sessionStorage.setItem('aura_auth_user', JSON.stringify(user));
      return { success: true, user, role: 'customer' };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please use the hardcoded admin or user logins.',
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
