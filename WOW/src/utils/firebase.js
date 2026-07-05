// Firebase and Mock Authentication Configuration
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbSignUp, 
  signInWithPopup as fbGoogleSignIn, 
  sendPasswordResetEmail as fbResetPwd, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

let app;
let auth;
let googleProvider;

if (isFirebaseConfigured) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    }
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed. Falling back to mock auth.", error);
  }
}

// ==========================================
// MOCK AUTH ENGINE (Local Storage simulation)
// ==========================================
class MockAuth {
  constructor() {
    this.listeners = [];
    this.currentUser = null;
    
    // Attempt session persistence
    const saved = localStorage.getItem('digitalshield_session_user');
    if (saved) {
      this.currentUser = JSON.parse(saved);
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Fire immediately with current state
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  _notify() {
    this.listeners.forEach(l => l(this.currentUser));
  }
}

const mockAuthInstance = new MockAuth();

// Mock Auth API Implementations
const mockSignInWithEmailAndPassword = async (email, password) => {
  const usersList = JSON.parse(localStorage.getItem('digitalshield_users_list') || '[]');
  const found = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!found) {
    throw new Error('AuthError: User not found. Try signing up!');
  }
  
  const user = {
    uid: 'mock_uid_' + found.email,
    email: found.email,
    displayName: `${found.firstName} ${found.lastName}`,
    firstName: found.firstName,
    lastName: found.lastName,
    college: found.college,
    memberSince: found.memberSince || 'July 2026',
    totalReports: found.totalReports || 0,
    safeReports: found.safeReports || 0,
    highRiskReports: found.highRiskReports || 0
  };

  mockAuthInstance.currentUser = user;
  localStorage.setItem('digitalshield_session_user', JSON.stringify(user));
  mockAuthInstance._notify();
  return { user };
};

const mockCreateUserWithEmailAndPassword = async (email, password, extraData = {}) => {
  const usersList = JSON.parse(localStorage.getItem('digitalshield_users_list') || '[]');
  const exists = usersList.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    throw new Error('AuthError: Email already registered.');
  }

  const newRegisteredUser = {
    email,
    firstName: extraData.firstName || 'User',
    lastName: extraData.lastName || '',
    college: extraData.college || 'Unspecified',
    memberSince: new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' }),
    totalReports: 0,
    safeReports: 0,
    highRiskReports: 0
  };

  usersList.push(newRegisteredUser);
  localStorage.setItem('digitalshield_users_list', JSON.stringify(usersList));

  const user = {
    uid: 'mock_uid_' + email,
    email,
    displayName: `${newRegisteredUser.firstName} ${newRegisteredUser.lastName}`,
    firstName: newRegisteredUser.firstName,
    lastName: newRegisteredUser.lastName,
    college: newRegisteredUser.college,
    memberSince: newRegisteredUser.memberSince,
    totalReports: 0,
    safeReports: 0,
    highRiskReports: 0
  };

  mockAuthInstance.currentUser = user;
  localStorage.setItem('digitalshield_session_user', JSON.stringify(user));
  mockAuthInstance._notify();
  return { user };
};

const mockSignInWithPopup = async () => {
  const googleUser = {
    uid: 'mock_uid_google_user',
    email: 'user.google@gmail.com',
    displayName: 'Google User',
    firstName: 'Google',
    lastName: 'User',
    college: 'National Tech Academy',
    memberSince: new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' }),
    totalReports: 4,
    safeReports: 3,
    highRiskReports: 1
  };

  mockAuthInstance.currentUser = googleUser;
  localStorage.setItem('digitalshield_session_user', JSON.stringify(googleUser));
  mockAuthInstance._notify();
  return { user: googleUser };
};

const mockSendPasswordResetEmail = async (email) => {
  // Simulate email delivery delay
  console.log(`Password reset link sent to: ${email}`);
  return true;
};

const mockSignOut = async () => {
  mockAuthInstance.currentUser = null;
  localStorage.removeItem('digitalshield_session_user');
  mockAuthInstance._notify();
  return true;
};

// ==========================================
// Exports: Unified API layer
// ==========================================
export { isFirebaseConfigured };

export const signInWithEmailAndPassword = async (email, password) => {
  if (isFirebaseConfigured && auth) {
    return fbSignIn(auth, email, password);
  }
  return mockSignInWithEmailAndPassword(email, password);
};

export const createUserWithEmailAndPassword = async (email, password, extraData) => {
  if (isFirebaseConfigured && auth) {
    const cred = await fbSignUp(auth, email, password);
    // Note: Additional user profile data should be handled via firestore/database in production,
    // here we just return the credential user
    return cred;
  }
  return mockCreateUserWithEmailAndPassword(email, password, extraData);
};

export const signInWithPopup = async () => {
  if (isFirebaseConfigured && auth && googleProvider) {
    return fbGoogleSignIn(auth, googleProvider);
  }
  return mockSignInWithPopup();
};

export const sendPasswordResetEmail = async (email) => {
  if (isFirebaseConfigured && auth) {
    return fbResetPwd(auth, email);
  }
  return mockSendPasswordResetEmail(email);
};

export const signOut = async () => {
  if (isFirebaseConfigured && auth) {
    return fbSignOut(auth);
  }
  return mockSignOut();
};

export const onAuthStateChanged = (callback) => {
  if (isFirebaseConfigured && auth) {
    return fbAuthStateChanged(auth, callback);
  }
  return mockAuthInstance.onAuthStateChanged(callback);
};
