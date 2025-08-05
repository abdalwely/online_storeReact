import { initializePlatform, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from './admin-setup';
import { initializeFirebaseWrapper, forceOfflineMode } from './firebase-wrapper';
import { showAvailableCredentials } from './fallback-auth';

// Initialize the platform with admin user
export const initializeApp = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing platform...');

    // Initialize Firebase wrapper first
    initializeFirebaseWrapper();

    // Force offline mode in development to prevent errors
    if (process.env.NODE_ENV === 'development') {
      forceOfflineMode();
    }

    // Skip Firebase initialization in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Skipping Firebase initialization');
      console.log('🔐 Primary Admin Credentials:');
      console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
      console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
      console.log('');
      showAvailableCredentials();
      console.log('');
      console.log('📧 You can log in with any of the above credentials');
      return;
    }

    // Production initialization
    const result = await initializePlatform();

    if (result.success) {
      console.log('✅ Platform initialized successfully');
      console.log('🔐 Admin Credentials:');
      console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
      console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
      console.log('📧 Please save these credentials securely');
    } else {
      console.warn('⚠️ Platform initialization issue:', result.message);
      console.log('🔐 Default Admin Credentials (for when connection is restored):');
      console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
      console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize platform:', error);
    console.log('🔐 Default Admin Credentials:');
    console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log('💡 Platform running in offline mode');
  }
};

// Call this function once when the app starts
export const APP_ADMIN_CREDENTIALS = {
  email: DEFAULT_ADMIN_EMAIL,
  password: DEFAULT_ADMIN_PASSWORD
};
