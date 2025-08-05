// Firebase wrapper that gracefully handles network failures and switches to offline mode

import { auth, db } from './firebase';

let isFirebaseAvailable = true;
let lastConnectionTest = 0;
const CONNECTION_TEST_INTERVAL = 30000; // 30 seconds

// Test Firebase connectivity
export const testFirebaseConnectivity = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Don't test too frequently
  if (now - lastConnectionTest < CONNECTION_TEST_INTERVAL) {
    return isFirebaseAvailable;
  }
  
  lastConnectionTest = now;
  
  try {
    // Simple connectivity test - just check if we can access Firebase config
    if (!auth || !db) {
      isFirebaseAvailable = false;
      return false;
    }
    
    // In development, assume offline mode by default to avoid network errors
    if (process.env.NODE_ENV === 'development') {
      isFirebaseAvailable = false;
      console.log('🔧 Development mode: Firebase disabled to prevent network errors');
      return false;
    }
    
    isFirebaseAvailable = true;
    return true;
  } catch (error) {
    console.warn('⚠️ Firebase connectivity test failed:', error);
    isFirebaseAvailable = false;
    return false;
  }
};

// Safe Firebase operation wrapper
export const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: () => T | Promise<T>,
  operationName: string = 'Firebase operation'
): Promise<T> => {
  try {
    // Check if Firebase is available
    if (!isFirebaseAvailable) {
      console.log(`📴 ${operationName}: Using fallback (Firebase unavailable)`);
      return await fallback();
    }
    
    // Test connectivity first
    const isConnected = await testFirebaseConnectivity();
    if (!isConnected) {
      console.log(`📴 ${operationName}: Using fallback (no connectivity)`);
      return await fallback();
    }
    
    // Attempt Firebase operation with timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase operation timeout')), 5000)
    );
    
    const result = await Promise.race([operation(), timeoutPromise]);
    console.log(`✅ ${operationName}: Firebase operation successful`);
    return result;
    
  } catch (error: any) {
    console.warn(`⚠️ ${operationName}: Firebase failed, using fallback:`, error.message);
    
    // Mark Firebase as unavailable for future operations
    if (error.message?.includes('network') || error.message?.includes('timeout')) {
      isFirebaseAvailable = false;
    }
    
    return await fallback();
  }
};

// Disable Firebase operations entirely for development
export const disableFirebaseForDevelopment = () => {
  if (process.env.NODE_ENV === 'development') {
    isFirebaseAvailable = false;
    console.log('🔧 Firebase operations disabled for development');
    
    // Override Firebase auth state changes to prevent errors
    if (window && typeof window === 'object') {
      // Prevent Firebase from trying to refresh tokens
      try {
        if (auth?.currentUser) {
          // Sign out to prevent token refresh attempts
          auth.signOut().catch(() => {
            // Ignore errors
          });
        }
      } catch (error) {
        // Ignore errors
      }
    }
  }
};

// Check if we're in offline mode
export const isOfflineMode = (): boolean => {
  return !isFirebaseAvailable;
};

// Force offline mode (for development)
export const forceOfflineMode = () => {
  isFirebaseAvailable = false;
  console.log('🔧 Forced offline mode enabled');
};

// Initialize wrapper
export const initializeFirebaseWrapper = () => {
  disableFirebaseForDevelopment();
  
  // Listen for online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('🌐 Network online detected');
      // Don't automatically re-enable Firebase in development
      if (process.env.NODE_ENV !== 'development') {
        isFirebaseAvailable = true;
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 Network offline detected');
      isFirebaseAvailable = false;
    });
  }
};
