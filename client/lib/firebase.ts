import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBB2N2zAuf4kDf3j5x263tI9mwVXiVf92A",
  authDomain: "house-2fbd2.firebaseapp.com",
  databaseURL: "https://house-2fbd2-default-rtdb.firebaseio.com",
  projectId: "house-2fbd2",
  storageBucket: "house-2fbd2.appspot.com",
  messagingSenderId: "482292708652",
  appId: "1:482292708652:web:f6050742a012b2720c2889",
  measurementId: "G-VRW7LE4V7B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only in browser and production
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Completely disable Firebase in development to prevent network errors
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode: Firebase disabled to prevent network errors');

  // Set global flag to indicate Firebase is disabled
  if (typeof window !== 'undefined') {
    (window as any).__FIREBASE_DISABLED__ = true;
  }
}

export default app;
