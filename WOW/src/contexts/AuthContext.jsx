import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged 
} from '../utils/firebase';

const AuthContext = createContext();

const DEFAULT_USER = {
  firstName: 'Sahithi',
  lastName: 'Pasupuleti',
  email: 'sahithi@cybersentinel.ai',
  college: 'WOW National Academy',
  memberSince: 'July 2026',
  totalReports: 14,
  safeReports: 11,
  highRiskReports: 3
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Default Users List for Mock authentication fallback
  useEffect(() => {
    const list = localStorage.getItem('cybersentinel_users_list');
    if (!list) {
      localStorage.setItem('cybersentinel_users_list', JSON.stringify([DEFAULT_USER]));
    }
  }, []);

  // Set up Firebase / Mock Auth state changes listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      if (currentUser) {
        // Map fields if it's a raw Firebase Auth user object
        const mappedUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split('@')[0],
          firstName: currentUser.firstName || currentUser.displayName?.split(' ')[0] || currentUser.email.split('@')[0],
          lastName: currentUser.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || '',
          college: currentUser.college || 'National Academy',
          memberSince: currentUser.memberSince || 'July 2026',
          totalReports: currentUser.totalReports || 0,
          safeReports: currentUser.safeReports || 0,
          highRiskReports: currentUser.highRiskReports || 0
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(email, password);
      return result.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(userData.email, userData.password, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        college: userData.college
      });
      return result.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup();
      return result.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed", err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(email);
      return true;
    } catch (err) {
      throw err;
    }
  };

  const updateUserStats = (isSafe) => {
    if (!user) return;
    
    // Update local context
    const updated = {
      ...user,
      totalReports: (user.totalReports || 0) + 1,
      safeReports: isSafe ? (user.safeReports || 0) + 1 : (user.safeReports || 0),
      highRiskReports: !isSafe ? (user.highRiskReports || 0) + 1 : (user.highRiskReports || 0)
    };
    setUser(updated);

    // Save in session user persistent storage if mock
    localStorage.setItem('cybersentinel_session_user', JSON.stringify(updated));

    // Update list too for persistency in next logins
    const usersList = JSON.parse(localStorage.getItem('cybersentinel_users_list') || '[]');
    const updatedList = usersList.map(u => {
      if (u.email.toLowerCase() === user.email.toLowerCase()) {
        return {
          ...u,
          totalReports: updated.totalReports,
          safeReports: updated.safeReports,
          highRiskReports: updated.highRiskReports
        };
      }
      return u;
    });
    localStorage.setItem('cybersentinel_users_list', JSON.stringify(updatedList));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleSignIn, logout, resetPassword, updateUserStats }}>
      {!loading && children}
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
