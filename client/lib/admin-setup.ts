import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserData } from './auth';

// Default admin credentials
export const DEFAULT_ADMIN_EMAIL = 'admin@ecommerce-platform.com';
export const DEFAULT_ADMIN_PASSWORD = 'AdminPlatform2024!';

export interface AdminSetupResult {
  success: boolean;
  message: string;
  credentials?: {
    email: string;
    password: string;
  };
}

// Create default admin user
export const createDefaultAdmin = async (): Promise<AdminSetupResult> => {
  try {
    console.log('🔧 Setting up admin user...');

    // Use fallback mode by default in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Admin user ready in offline mode');
      return {
        success: true,
        message: 'Admin user ready in offline mode (development)',
        credentials: {
          email: DEFAULT_ADMIN_EMAIL,
          password: DEFAULT_ADMIN_PASSWORD
        }
      };
    }

    // Production Firebase setup
    let connectionTest;
    try {
      const { testFirebaseConnection } = await import('./firebase-diagnostics');
      connectionTest = await testFirebaseConnection();
    } catch (testError) {
      console.warn('⚠️ Firebase connection test failed');
      return {
        success: false,
        message: 'Firebase connection test failed',
        credentials: {
          email: DEFAULT_ADMIN_EMAIL,
          password: DEFAULT_ADMIN_PASSWORD
        }
      };
    }

    if (connectionTest && (!connectionTest.authConnected || !connectionTest.firestoreConnected)) {
      console.warn('⚠️ Firebase connection issue during admin setup:', connectionTest.error);
      return {
        success: false,
        message: `Firebase connection failed: ${connectionTest.error}. Admin will be created when connection is restored.`,
        credentials: {
          email: DEFAULT_ADMIN_EMAIL,
          password: DEFAULT_ADMIN_PASSWORD
        }
      };
    }

    // Check if admin already exists (use a different approach to avoid doc() with 'admin' ID)
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('email', '==', DEFAULT_ADMIN_EMAIL));
    const adminQuerySnapshot = await getDocs(adminQuery);

    if (!adminQuerySnapshot.empty) {
      console.log('✅ Admin user already exists');
      return {
        success: true,
        message: 'Admin user already exists',
        credentials: {
          email: DEFAULT_ADMIN_EMAIL,
          password: DEFAULT_ADMIN_PASSWORD
        }
      };
    }

    // Create admin user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      DEFAULT_ADMIN_EMAIL, 
      DEFAULT_ADMIN_PASSWORD
    );

    const adminData: UserData = {
      uid: userCredential.user.uid,
      email: DEFAULT_ADMIN_EMAIL,
      firstName: 'مدير',
      lastName: 'المنصة',
      userType: 'admin',
      phone: '+966500000000',
      city: 'الرياض',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    // Store admin data with custom document ID
    await setDoc(doc(db, 'users', userCredential.user.uid), adminData);
    
    // Create admin settings document
    await setDoc(doc(db, 'admin_settings', 'platform_config'), {
      platformName: { ar: 'منصة التجارة الإلكترونية', en: 'E-commerce Platform' },
      platformDescription: { ar: 'منصة شاملة لإنشاء وإدارة المتاجر الإلكترونية', en: 'Comprehensive platform for creating and managing online stores' },
      supportEmail: 'support@ecommerce-platform.com',
      supportPhone: '+966500000000',
      defaultCurrency: 'SAR',
      defaultLanguage: 'ar',
      allowedLanguages: ['ar', 'en'],
      maxStoresPerMerchant: 5,
      maxProductsPerStore: 1000,
      platformCommission: 5, // 5%
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD
      }
    };

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return {
      success: false,
      message: `Error creating admin: ${error.message}`
    };
  }
};

// Verify admin login
export const verifyAdminAccess = async (): Promise<boolean> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      DEFAULT_ADMIN_EMAIL, 
      DEFAULT_ADMIN_PASSWORD
    );
    
    const userData = await getDoc(doc(db, 'users', userCredential.user.uid));
    return userData.exists() && userData.data()?.userType === 'admin';
  } catch (error) {
    console.error('Admin verification failed:', error);
    return false;
  }
};

// Initialize platform (run once)
export const initializePlatform = async (): Promise<AdminSetupResult> => {
  return await createDefaultAdmin();
};
