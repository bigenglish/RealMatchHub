import * as admin from 'firebase-admin';

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  try {
    // Try to initialize with service account JSON from environment variables
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      // Parse the JSON credential string from environment variable
      const serviceAccount = JSON.parse(
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      );
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
      
      console.log('[firebase-admin] Firebase Admin SDK initialized with service account');
    } else {
      // If no service account JSON is provided, try to initialize with application default credentials
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
      
      console.log('[firebase-admin] Firebase Admin SDK initialized with default credentials');
    }
  } catch (error) {
    console.error('[firebase-admin] Error initializing Firebase Admin SDK:', error);
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();

// User Management Functions
export async function verifyIdToken(idToken: string) {
  try {
    return await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error('[firebase-admin] Error verifying ID token:', error);
    throw error;
  }
}

export async function createUser(email: string, password: string, displayName: string) {
  try {
    return await auth.createUser({
      email,
      password,
      displayName,
    });
  } catch (error) {
    console.error('[firebase-admin] Error creating user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    console.error('[firebase-admin] Error getting user by email:', error);
    throw error;
  }
}

export async function getUserById(uid: string) {
  try {
    return await auth.getUser(uid);
  } catch (error) {
    console.error('[firebase-admin] Error getting user by ID:', error);
    throw error;
  }
}

export async function setUserRole(uid: string, role: 'user' | 'vendor' | 'admin') {
  try {
    await auth.setCustomUserClaims(uid, { role });
    return { success: true };
  } catch (error) {
    console.error('[firebase-admin] Error setting user role:', error);
    throw error;
  }
}

export async function getUserRole(uid: string) {
  try {
    const user = await auth.getUser(uid);
    const customClaims = user.customClaims || {};
    return customClaims.role || 'user'; // Default to 'user' if no role is set
  } catch (error) {
    console.error('[firebase-admin] Error getting user role:', error);
    throw error;
  }
}

export default admin;