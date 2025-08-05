import { auth, db } from './firebase';
import { signInAnonymously, connectAuthEmulator } from 'firebase/auth';
import { doc, getDoc, connectFirestoreEmulator } from 'firebase/firestore';

export interface FirebaseDiagnostics {
  authConnected: boolean;
  firestoreConnected: boolean;
  error?: string;
  suggestion?: string;
}

export const testFirebaseConnection = async (): Promise<FirebaseDiagnostics> => {
  const result: FirebaseDiagnostics = {
    authConnected: false,
    firestoreConnected: false
  };

  // Skip connection testing in development to avoid errors
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Skipping Firebase connection test, using offline mode');
    result.error = 'Development offline mode';
    result.suggestion = 'Using offline fallback mode for development.\nFirebase connection testing disabled.';
    return result;
  }

  try {
    // Test Auth connection with anonymous sign-in
    console.log('Testing Firebase Auth connection...');

    // Add timeout to prevent hanging
    const authTestPromise = signInAnonymously(auth);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 3000)
    );

    const userCredential = await Promise.race([authTestPromise, timeoutPromise]) as any;

    if (userCredential.user) {
      result.authConnected = true;
      console.log('✅ Firebase Auth connection successful');

      // Sign out the anonymous user
      await auth.signOut();
    }
  } catch (authError: any) {
    console.error('❌ Firebase Auth connection failed:', authError);
    result.error = authError.message;

    result.suggestion = 'Network connection failed. Development fallback mode available.\n\n' +
      'Try these solutions:\n' +
      '1. Check internet connectivity\n' +
      '2. Refresh the page\n' +
      '3. Use fallback credentials for development';
  }

  try {
    // Test Firestore connection
    console.log('Testing Firebase Firestore connection...');
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    result.firestoreConnected = true;
    console.log('✅ Firebase Firestore connection successful');
  } catch (firestoreError: any) {
    console.error('❌ Firebase Firestore connection failed:', firestoreError);
    if (!result.error) {
      result.error = firestoreError.message;
    }
  }

  return result;
};

export const enableFirebaseEmulators = () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('🔧 Connecting to Firebase emulators...');
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('✅ Firebase emulators connected');
      return true;
    } catch (error) {
      console.warn('⚠️ Could not connect to Firebase emulators:', error);
      return false;
    }
  }
  return false;
};

export const getFirebaseConnectionStatus = () => {
  return {
    authReady: !!auth,
    firestoreReady: !!db,
    config: {
      projectId: auth.config.apiKey ? 'configured' : 'missing',
      authDomain: auth.config.authDomain ? 'configured' : 'missing'
    }
  };
};
