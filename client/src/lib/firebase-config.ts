import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Check if Firebase environment variables are available
const hasRequiredEnvVars = 
  process.env.VITE_FIREBASE_API_KEY && 
  process.env.VITE_FIREBASE_PROJECT_ID && 
  process.env.VITE_FIREBASE_APP_ID;

// Log Firebase configuration status
if (!hasRequiredEnvVars) {
  console.error('Firebase configuration is incomplete. Missing required environment variables.');
  console.log('Available Firebase config:', {
    apiKey: process.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing',
    projectId: process.env.VITE_FIREBASE_PROJECT_ID ? 'Present' : 'Missing',
    appId: process.env.VITE_FIREBASE_APP_ID ? 'Present' : 'Missing'
  });
} else {
  console.log('Firebase configuration is complete. Initializing Firebase services.');
}

// Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID || 'default'}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID || 'default'}.appspot.com`,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  throw new Error('Failed to initialize Firebase. Check your environment variables.');
}

// Initialize Firebase services with error handling
let auth: any;
let firestore: Firestore | null = null;
let storage: any;

try {
  auth = getAuth(app);
  console.log('Firebase Auth initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
  auth = null;
}

try {
  firestore = getFirestore(app);
  console.log('Firebase Firestore initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Firestore:', error);
  firestore = null;
}

try {
  storage = getStorage(app);
  console.log('Firebase Storage initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Storage:', error);
  storage = null;
}

export { auth, firestore, storage };

// Initialize Analytics conditionally (only in browser environments)
export const initializeAnalytics = async () => {
  try {
    if (await isSupported()) {
      return getAnalytics(app);
    }
    return null;
  } catch (error) {
    console.error('Firebase Analytics initialization error:', error);
    return null;
  }
};

export default app;