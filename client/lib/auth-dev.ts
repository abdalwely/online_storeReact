// Development-only authentication that completely bypasses Firebase

import { getCurrentFallbackUser, fallbackSignIn, fallbackSignOut } from './fallback-auth';

// Check if Firebase is disabled
const isFirebaseDisabled = () => {
  return process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && (window as any).__FIREBASE_DISABLED__);
};

// Development-only auth state management
let authListeners: ((user: any) => void)[] = [];
let currentDevUser: any = null;

// Initialize dev user from storage
const initializeDevUser = () => {
  if (isFirebaseDisabled()) {
    const fallbackUser = getCurrentFallbackUser();
    if (fallbackUser) {
      currentDevUser = fallbackUser;
      console.log('🔧 Dev auth initialized with user:', fallbackUser.email);
    }
  }
};

// Development auth state observer
export const onAuthStateChangeDev = (callback: (user: any) => void) => {
  if (!isFirebaseDisabled()) {
    // Use regular Firebase in production
    const { onAuthStateChange } = require('./auth');
    return onAuthStateChange(callback);
  }

  // Development mode
  authListeners.push(callback);
  
  // Immediately call with current user
  setTimeout(() => {
    callback(currentDevUser);
  }, 100);
  
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(listener => listener !== callback);
  };
};

// Development sign in
export const signInUserDev = async (email: string, password: string) => {
  if (!isFirebaseDisabled()) {
    // Use regular Firebase in production
    const { signInUser } = require('./auth');
    return await signInUser(email, password);
  }

  // Development mode
  console.log('🔧 Dev sign in attempt:', email);
  
  try {
    const result = await fallbackSignIn(email, password);
    currentDevUser = result.user;
    
    // Notify all listeners
    authListeners.forEach(listener => {
      try {
        listener(currentDevUser);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
    
    console.log('✅ Dev sign in successful');
    return result;
  } catch (error) {
    console.error('❌ Dev sign in failed:', error);
    throw error;
  }
};

// Development sign out
export const signOutUserDev = async () => {
  if (!isFirebaseDisabled()) {
    // Use regular Firebase in production
    const { signOutUser } = require('./auth');
    return await signOutUser();
  }

  // Development mode
  console.log('🔧 Dev sign out');
  
  await fallbackSignOut();
  currentDevUser = null;
  
  // Notify all listeners
  authListeners.forEach(listener => {
    try {
      listener(null);
    } catch (error) {
      console.error('Error in auth listener:', error);
    }
  });
  
  console.log('✅ Dev sign out successful');
};

// Get current user (development)
export const getCurrentUserDev = () => {
  if (!isFirebaseDisabled()) {
    return null; // Use regular Firebase auth in production
  }
  
  return currentDevUser;
};

// Initialize development auth
if (isFirebaseDisabled()) {
  initializeDevUser();
}

// Development-only exports
export const devAuth = {
  currentUser: getCurrentUserDev(),
  onAuthStateChanged: onAuthStateChangeDev,
  signInWithEmailAndPassword: signInUserDev,
  signOut: signOutUserDev
};
