import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getUserData, UserData } from '@/lib/auth';
import { getCurrentFallbackUser } from '@/lib/fallback-auth';
import { onAuthStateChangeDev } from '@/lib/auth-dev';

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  isOfflineMode: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  isOfflineMode: false,
  refreshUserData: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const refreshUserData = async () => {
    if (currentUser) {
      try {
        const data = await getUserData(currentUser.uid);
        setUserData(data);
      } catch (error) {
        console.warn('⚠️ Failed to refresh user data:', error);
        // Create mock user data for offline mode
        if (isOfflineMode) {
          setUserData({
            uid: currentUser.uid,
            email: currentUser.email || '',
            firstName: 'مستخدم',
            lastName: 'تجريبي',
            userType: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
          });
        }
      }
    }
  };

  useEffect(() => {
    // Check if Firebase is disabled (development mode)
    const isFirebaseDisabled = process.env.NODE_ENV === 'development' ||
                              (typeof window !== 'undefined' && (window as any).__FIREBASE_DISABLED__);

    if (isFirebaseDisabled) {
      console.log('🔧 Using development auth (Firebase disabled)');

      // Use development auth system
      const unsubscribe = onAuthStateChangeDev((user) => {
        setCurrentUser(user);
        setIsOfflineMode(true);

        if (user) {
          // Get stored user data from localStorage to determine user type
          const stored = localStorage.getItem('fallback_user');
          let userType = 'admin';
          let firstName = 'مدير';
          let lastName = 'المنصة';
          
          if (stored) {
            try {
              const userData = JSON.parse(stored);
              userType = userData.userType || 'admin';
              
              // Set appropriate names based on user type
              if (userType === 'merchant') {
                firstName = 'تاجر';
                lastName = 'تجريبي';
              } else if (userType === 'customer') {
                firstName = 'عميل';
                lastName = 'تجريبي';
              }
              
              console.log('📋 Loaded user data from localStorage:', {
                email: user.email,
                userType: userType,
                firstName: firstName
              });
            } catch (error) {
              console.warn('Error parsing stored user data:', error);
            }
          }

          setUserData({
            uid: user.uid,
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            userType: userType as 'admin' | 'merchant' | 'customer',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
          });
        } else {
          setUserData(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    }

    // Production Firebase auth
    try {
      const unsubscribe = onAuthStateChange(async (user) => {
        setCurrentUser(user);
        setIsOfflineMode(false);

        if (user) {
          try {
            const data = await getUserData(user.uid);
            setUserData(data);
          } catch (error) {
            console.warn('⚠️ Failed to get user data:', error);
            setUserData({
              uid: user.uid,
              email: user.email || '',
              firstName: 'مستخدم',
              lastName: '',
              userType: 'customer',
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true
            });
          }
        } else {
          setUserData(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Firebase auth initialization failed:', error);
      setLoading(false);
      setIsOfflineMode(true);
    }
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    isOfflineMode,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
