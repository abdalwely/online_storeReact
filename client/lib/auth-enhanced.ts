import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { testFirebaseConnection } from './firebase-diagnostics';

export interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'admin' | 'merchant' | 'customer';
  businessName?: string;
  businessType?: string;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  storeId?: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserCredential;
  error?: string;
  diagnostics?: any;
}

// Enhanced sign in with better error handling
export const signInUserEnhanced = async (email: string, password: string): Promise<AuthResult> => {
  try {
    console.log('Attempting to sign in user:', email);

    // Use fallback mode by default in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using fallback authentication');
      const { fallbackSignIn } = await import('./fallback-auth');
      try {
        const fallbackResult = await fallbackSignIn(email, password);
        console.log('✅ Fallback sign in successful');
        return {
          success: true,
          user: fallbackResult as any
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: 'Invalid credentials (offline mode)',
          diagnostics: { fallbackMode: true, error: fallbackError.message }
        };
      }
    }

    // Production Firebase connection
    let diagnostics: any;
    try {
      diagnostics = await testFirebaseConnection();
    } catch (testError) {
      console.warn('Connection test failed');
      return {
        success: false,
        error: 'Connection test failed',
        diagnostics: { error: testError.message }
      };
    }

    if (diagnostics && !diagnostics.authConnected) {
      // Try fallback mode for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Firebase unavailable, switching to fallback mode...');
        const { fallbackSignIn } = await import('./fallback-auth');
        try {
          const fallbackResult = await fallbackSignIn(email, password);
          console.log('✅ Fallback sign in successful');
          return {
            success: true,
            user: fallbackResult as any
          };
        } catch (fallbackError) {
          return {
            success: false,
            error: 'Invalid credentials (fallback mode)',
            diagnostics: { fallbackMode: true, error: fallbackError.message }
          };
        }
      }

      return {
        success: false,
        error: `Firebase connection failed: ${diagnostics.error}`,
        diagnostics
      };
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User signed in successfully');

    return {
      success: true,
      user: userCredential
    };
  } catch (error: any) {
    console.error('❌ Sign in failed:', error);

    // Try fallback mode for development on network errors
    if (process.env.NODE_ENV === 'development' &&
        (error.code === 'auth/network-request-failed' || error.message?.includes('network'))) {
      console.log('Network error detected, trying fallback mode...');
      const { fallbackSignIn } = await import('./fallback-auth');
      try {
        const fallbackResult = await fallbackSignIn(email, password);
        console.log('✅ Fallback sign in successful after network error');
        return {
          success: true,
          user: fallbackResult as any
        };
      } catch (fallbackError) {
        // Continue with original error handling
      }
    }

    let errorMessage = 'Unknown error occurred';

    if (error.code) {
      switch (error.code) {
        case 'auth/network-request-failed':
          errorMessage = 'Network connection failed. Using offline mode for development.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This user account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = `Authentication error: ${error.message}`;
      }
    }

    return {
      success: false,
      error: errorMessage,
      diagnostics: { error: error.message, fallbackMode: false }
    };
  }
};

// Enhanced account creation with fallback support
export const createAccountEnhanced = async (
  email: string,
  password: string,
  userData: Omit<UserData, 'uid' | 'createdAt' | 'updatedAt' | 'isActive'>
): Promise<AuthResult> => {
  try {
    console.log('Creating new account for:', email);

    // Use fallback mode by default in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using fallback account creation');
      const { fallbackCreateUser } = await import('./fallback-auth');
      try {
        const fallbackResult = await fallbackCreateUser(email, password);
        
        // Store user data in localStorage for development
        const userDoc: UserData = {
          ...userData,
          uid: fallbackResult.user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };
        
        localStorage.setItem(`user_${fallbackResult.user.uid}`, JSON.stringify(userDoc));
        
        console.log('✅ Fallback account created successfully');
        return {
          success: true,
          user: fallbackResult as any
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: 'Failed to create account in offline mode',
          diagnostics: { fallbackMode: true, error: fallbackError.message }
        };
      }
    }
    
    // Test Firebase connection first for production
    let diagnostics: any;
    try {
      diagnostics = await testFirebaseConnection();
    } catch (testError) {
      console.warn('Connection test failed, trying fallback mode...');
      
      if (process.env.NODE_ENV === 'development') {
        const { fallbackCreateUser } = await import('./fallback-auth');
        try {
          const fallbackResult = await fallbackCreateUser(email, password);
          
          // Store user data in localStorage for development
          const userDoc: UserData = {
            ...userData,
            uid: fallbackResult.user.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
          };
          
          localStorage.setItem(`user_${fallbackResult.user.uid}`, JSON.stringify(userDoc));
          
          console.log('✅ Fallback account created after connection test failed');
          return {
            success: true,
            user: fallbackResult as any
          };
        } catch (fallbackError) {
          return {
            success: false,
            error: 'Failed to create account in offline mode',
            diagnostics: { fallbackMode: true, error: fallbackError.message }
          };
        }
      }
      
      return {
        success: false,
        error: 'Connection test failed',
        diagnostics: { error: testError.message }
      };
    }

    if (diagnostics && (!diagnostics.authConnected || !diagnostics.firestoreConnected)) {
      // Try fallback mode for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Firebase unavailable, switching to fallback mode for account creation...');
        const { fallbackCreateUser } = await import('./fallback-auth');
        try {
          const fallbackResult = await fallbackCreateUser(email, password);
          
          // Store user data in localStorage for development
          const userDoc: UserData = {
            ...userData,
            uid: fallbackResult.user.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
          };
          
          localStorage.setItem(`user_${fallbackResult.user.uid}`, JSON.stringify(userDoc));
          
          console.log('✅ Fallback account created successfully');
          return {
            success: true,
            user: fallbackResult as any
          };
        } catch (fallbackError) {
          return {
            success: false,
            error: 'Failed to create account in offline mode',
            diagnostics: { fallbackMode: true, error: fallbackError.message }
          };
        }
      }

      return {
        success: false,
        error: `Firebase connection failed: ${diagnostics.error}`,
        diagnostics
      };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });

    // Create user document in Firestore
    const userDoc: UserData = {
      ...userData,
      uid: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    // Create store for merchants
    if (userData.userType === 'merchant') {
      const { createInitialStoreEnhanced } = await import('./store-management');
      const storeId = await createInitialStoreEnhanced(user.uid, userData);
      await updateDoc(doc(db, 'users', user.uid), { storeId });
    }

    console.log('✅ Account created successfully');
    
    return {
      success: true,
      user: userCredential
    };
  } catch (error: any) {
    console.error('❌ Account creation failed:', error);

    // Try fallback mode for development on network errors
    if (process.env.NODE_ENV === 'development' &&
        (error.code === 'auth/network-request-failed' || error.message?.includes('network'))) {
      console.log('Network error detected, trying fallback mode for account creation...');
      const { fallbackCreateUser } = await import('./fallback-auth');
      try {
        const fallbackResult = await fallbackCreateUser(email, password);
        
        // Store user data in localStorage for development
        const userDoc: UserData = {
          ...userData,
          uid: fallbackResult.user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };
        
        localStorage.setItem(`user_${fallbackResult.user.uid}`, JSON.stringify(userDoc));
        
        console.log('✅ Fallback account created after network error');
        return {
          success: true,
          user: fallbackResult as any
        };
      } catch (fallbackError) {
        // Continue with original error handling
      }
    }
    
    let errorMessage = 'Failed to create account';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/network-request-failed':
          errorMessage = 'Network connection failed. Using offline mode for development.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
          break;
        default:
          errorMessage = `Account creation error: ${error.message}`;
      }
    }

    let diagnostics;
    try {
      diagnostics = await testFirebaseConnection();
    } catch (testError) {
      diagnostics = { error: testError.message };
    }
    
    return {
      success: false,
      error: errorMessage,
      diagnostics
    };
  }
};

// Wrapper for backwards compatibility
export const signInUser = async (email: string, password: string): Promise<UserCredential> => {
  const result = await signInUserEnhanced(email, password);
  if (result.success && result.user) {
    return result.user;
  }
  throw new Error(result.error || 'Sign in failed');
};

export const createAccount = async (
  email: string,
  password: string,
  userData: Omit<UserData, 'uid' | 'createdAt' | 'updatedAt' | 'isActive'>
): Promise<UserCredential> => {
  const result = await createAccountEnhanced(email, password, userData);
  if (result.success && result.user) {
    return result.user;
  }
  throw new Error(result.error || 'Account creation failed');
};

// Other auth functions remain the same
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserData = async (uid: string, data: Partial<UserData>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};
