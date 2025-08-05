import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

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
  storeId?: string; // For merchants
}

// Create user account
export const createAccount = async (
  email: string,
  password: string,
  userData: Omit<UserData, 'uid' | 'createdAt' | 'updatedAt' | 'isActive'>
): Promise<UserCredential> => {
  try {
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
      const storeId = await createInitialStore(user.uid, userData);
      await updateDoc(doc(db, 'users', user.uid), { storeId });
    }

    return userCredential;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

// Create initial store for merchants
const createInitialStore = async (userId: string, userData: Partial<UserData>): Promise<string> => {
  const storeId = `store_${userId}`;
  const store = {
    id: storeId,
    ownerId: userId,
    name: userData.businessName || `${userData.firstName}'s Store`,
    description: '',
    logo: '',
    subdomain: storeId.toLowerCase(),
    template: 'default',
    customization: {
      colors: {
        primary: '#FF6B35',
        secondary: '#4A90E2',
        background: '#FFFFFF',
        text: '#333333'
      },
      fonts: {
        primary: 'Cairo',
        secondary: 'Inter'
      },
      layout: {
        headerStyle: 'modern',
        productCardStyle: 'card',
        showCategories: true,
        showSearch: true
      }
    },
    settings: {
      currency: 'SAR',
      language: 'ar',
      shipping: {
        enabled: false,
        freeShippingThreshold: 0,
        shippingCost: 0
      },
      payment: {
        cashOnDelivery: true,
        bankTransfer: false,
        creditCard: false
      }
    },
    contact: {
      phone: userData.phone || '',
      email: userData.email || '',
      address: '',
      city: userData.city || ''
    },
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await setDoc(doc(db, 'stores', storeId), store);
  return storeId;
};

// Sign in user with enhanced error handling
export const signInUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    // Import enhanced auth for better error handling
    const { signInUserEnhanced } = await import('./auth-enhanced');
    const result = await signInUserEnhanced(email, password);

    if (result.success && result.user) {
      return result.user;
    } else {
      // Create a more descriptive error
      const error = new Error(result.error || 'Sign in failed');
      (error as any).code = 'auth/network-request-failed';
      (error as any).diagnostics = result.diagnostics;
      throw error;
    }
  } catch (error: any) {
    console.error('Error signing in:', error);

    // If it's already a Firebase error, just re-throw
    if (error.code && error.code.startsWith('auth/')) {
      throw error;
    }

    // Otherwise, try the basic sign in as fallback
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (fallbackError) {
      console.error('Fallback sign in also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get user data
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

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Update user data
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
