import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getUserData, UserData } from '@/lib/auth';
import { getCurrentFallbackUser } from '@/lib/fallback-auth';
import { onAuthStateChangeDev } from '@/lib/auth-dev';
import { getStoreByOwnerId, updateStore } from '@/lib/store-management';

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
          // تحديث بيانات المستخدم مع البحث عن الأسماء الحقيقية
          let actualFirstName = 'مستخدم';
          let actualLastName = 'تجريبي';
          let actualUserType = 'admin';

          // البحث عن بيانات المستخدم المحفوظة
          const stored = localStorage.getItem('fallback_user');
          if (stored) {
            try {
              const userData = JSON.parse(stored);
              actualUserType = userData.userType || 'admin';
              actualFirstName = userData.firstName || actualFirstName;
              actualLastName = userData.lastName || actualLastName;
            } catch (error) {
              console.error('Error parsing stored user data:', error);
            }
          }

          setUserData({
            uid: currentUser.uid,
            email: currentUser.email || '',
            firstName: actualFirstName,
            lastName: actualLastName,
            userType: actualUserType as 'admin' | 'merchant' | 'customer',
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

              // Use stored names if available, otherwise use defaults
              if (userData.firstName) {
                firstName = userData.firstName;
              } else if (userType === 'merchant') {
                firstName = 'تاجر';
              } else if (userType === 'customer') {
                firstName = 'عميل';
              }

              if (userData.lastName) {
                lastName = userData.lastName;
              } else if (userType === 'merchant') {
                lastName = 'تجريبي';
              } else if (userType === 'customer') {
                lastName = 'تجريبي';
              }

              console.log('📋 Loaded user data from localStorage:', {
                email: user.email,
                userType: userType,
                firstName: firstName,
                lastName: lastName
              });

              // إذا كان تاجراً وتم تحديث اسمه، حدث اسم المتجر أيضاً
              if (userType === 'merchant' && firstName && firstName !== 'تاجر') {
                setTimeout(() => {
                  try {
                    const merchantStore = getStoreByOwnerId(user.uid);

                    if (merchantStore) {
                      const expectedStoreName = `متجر ${firstName}`;
                      if (merchantStore.name !== expectedStoreName) {
                        console.log('🔧 Auto-updating store name for merchant:', firstName);
                        updateStore(merchantStore.id, {
                          name: expectedStoreName,
                          description: `متجر ${firstName} للتجارة الإلكترونية`
                        });
                        console.log('✅ Store name auto-updated');
                      }
                    }
                  } catch (error) {
                    console.error('Error auto-updating store name:', error);
                  }
                }, 1000); // تأخير صغير للتأكد من تحميل البيانات
              }
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
