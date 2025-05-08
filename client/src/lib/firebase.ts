import axios from 'axios';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Firestore } from 'firebase/firestore';
import { auth, firestore } from './firebase-config';

// Helper function to safely create a document reference
const safeDocRef = (collection: string, docId: string) => {
  if (!firestore) {
    console.error('Firestore is not initialized');
    throw new Error('Firestore is not initialized');
  }
  // Type assertion to handle the Firestore | null type
  const db = firestore as Firestore;
  return doc(db, collection, docId);
};

// Define more specific user roles
export type UserRoleType = 'user' | 'vendor' | 'admin';
export type UserSubroleType = 'buyer' | 'seller' | 'renter' | 'agent' | 'loan_officer' | 'contractor' | 'designer' | 'platform_admin' | 'support_admin';

// Interface for user data
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRoleType;
  subrole?: UserSubroleType;
  phoneNumber?: string | null;
  createdAt?: number;
  lastLoginAt?: number;
  selectedPlan?: string | null;
  userPreferences?: {
    location?: string;
    priceRange?: { min: number; max: number };
    propertyTypes?: string[];
    notificationSettings?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    savedSearches?: Array<{
      id: string;
      name: string;
      criteria: Record<string, any>;
      createdAt: number;
    }>;
  };
  vendorProfile?: {
    businessName?: string;
    serviceTypes?: string[];
    licenseNumber?: string;
    yearsOfExperience?: number;
    serviceAreas?: string[];
    availability?: string[];
    avgRating?: number;
    reviewCount?: number;
  };
}

// Store token in localStorage
const TOKEN_KEY = 'auth_token';
const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
const getToken = () => localStorage.getItem(TOKEN_KEY);
const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// API client with auth header
const apiClient = axios.create({
  baseURL: '/api',
});

// Add auth token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to get user role and data from Firestore
const getUserRoleAndData = async (uid: string): Promise<{
  role: UserRoleType;
  subrole?: UserSubroleType;
  userPreferences?: any;
  vendorProfile?: any;
}> => {
  try {
    if (!firestore) {
      console.error('Firestore not initialized');
      return { role: 'user' };
    }
    
    // Create a reference to the user document
    console.log('Getting user data for:', uid);
    
    // Use our helper function to safely create a document reference
    const userRef = safeDocRef('users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('Found user data:', userData);
      return {
        role: userData.role || 'user',
        subrole: userData.subrole,
        userPreferences: userData.userPreferences,
        vendorProfile: userData.vendorProfile
      };
    }
    
    console.log('User document does not exist, returning default data');
    return { role: 'user' }; // Default data
  } catch (error) {
    console.error('Error getting user data:', error);
    return { role: 'user' }; // Default data
  }
};

// Helper function to map Firebase user to our UserData interface
const mapFirebaseUserToUserData = async (firebaseUser: FirebaseUser): Promise<UserData> => {
  const userData = await getUserRoleAndData(firebaseUser.uid);
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    role: userData.role,
    subrole: userData.subrole,
    userPreferences: userData.userPreferences,
    vendorProfile: userData.vendorProfile,
    lastLoginAt: Date.now()
  };
};

// Email/Password Authentication
export const signInWithEmail = async (email: string, password: string) => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user data and role
    const userData = await mapFirebaseUserToUserData(userCredential.user);
    
    // Get ID token for API requests
    const token = await getIdToken(userCredential.user);
    setToken(token);
    
    // Update last login time
    try {
      await updateDoc(safeDocRef('users', userData.uid), {
        lastLoginAt: Date.now()
      });
      console.log('Last login time updated');
    } catch (error) {
      console.error('Failed to update last login time:', error);
      // Continue even if this fails
    }
    
    return { user: userData, error: null };
  } catch (error: any) {
    let errorMessage = 'Login failed';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later.';
    }
    return { user: null, error: errorMessage };
  }
};

export const createAccount = async (
  fullName: string, 
  email: string, 
  password: string, 
  role: UserRoleType = 'user',
  subrole?: UserSubroleType
) => {
  try {
    console.log('Creating account for:', email, 'with role:', role, 'and subrole:', subrole);
    
    // Validate inputs
    if (!email || !password || !fullName) {
      return { user: null, error: 'All fields are required' };
    }
    
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Firebase account created successfully for UID:', user.uid);
    
    // Prepare user data
    const timestamp = Date.now();
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: fullName,
      role,
      subrole,
      createdAt: timestamp,
      lastLoginAt: timestamp,
      // Initialize empty preferences
      userPreferences: role === 'user' ? {
        notificationSettings: {
          email: true,
          push: true,
          sms: false
        }
      } : undefined,
      
      // Initialize vendor profile if this is a vendor account
      vendorProfile: role === 'vendor' ? {
        businessName: '',
        serviceTypes: [],
        avgRating: 0,
        reviewCount: 0
      } : undefined
    };
    
    // Create user document in Firestore
    try {
      const userToSave = {
        ...userData,
        selectedPlan: null // We'll update this when they select a plan
      };
      
      console.log('Saving user to Firestore:', userToSave);
      await setDoc(safeDocRef('users', user.uid), userToSave);
      console.log('Firestore user document created successfully');
    } catch (firestoreError: any) {
      console.error('Error creating user document in Firestore:', firestoreError);
      console.error('Error details:', firestoreError.code, firestoreError.message);
      // Even if Firestore fails, we can still proceed with the created Firebase auth account
    }
    
    // Get ID token for API requests
    try {
      const token = await getIdToken(user);
      setToken(token);
      console.log('User token generated and stored successfully');
    } catch (tokenError) {
      console.error('Error generating user token:', tokenError);
      // Continue even if token generation fails
    }
    
    return { user: userData, error: null };
  } catch (error: any) {
    console.error('Registration error:', error);
    let errorMessage = 'Registration failed';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email already in use. Please sign in or reset your password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email/password registration is not enabled. Please contact support.';
    } else if (error.code) {
      errorMessage = `Registration error: ${error.code}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { user: null, error: errorMessage };
  }
};

// Social Authentication providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Google Authentication
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    try {
      // Check if user exists in Firestore
      const userRef = safeDocRef('users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document if first time login
        console.log('Creating new user document for Google sign-in:', user.uid);
        
        const newUserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user' as UserRoleType, // Default role for social login
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          userPreferences: {
            notificationSettings: {
              email: true,
              push: true,
              sms: false
            }
          }
        };
        
        await setDoc(userRef, newUserData);
        console.log('User document created successfully');
      } else {
        // Update last login time
        console.log('Updating last login time for existing user:', user.uid);
        await updateDoc(userRef, {
          lastLoginAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Error handling Firestore document for Google sign-in:', error);
      // Continue even if Firestore operations fail
    }
    
    // Get user data with role
    const userData = await mapFirebaseUserToUserData(user);
    
    // Get ID token for API requests
    const token = await getIdToken(user);
    setToken(token);
    
    return { user: userData, error: null };
  } catch (error: any) {
    let errorMessage = 'Google sign-in failed';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Sign-in popup was blocked by your browser';
    }
    
    return { user: null, error: errorMessage };
  }
};

// Facebook Authentication
export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    
    try {
      // Check if user exists in Firestore
      const userRef = safeDocRef('users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document if first time login
        console.log('Creating new user document for Facebook sign-in:', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user', // Default role for social login
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        });
        console.log('User document created successfully for Facebook login');
      } else {
        // Update last login time
        console.log('Updating last login time for existing Facebook user:', user.uid);
        await updateDoc(userRef, {
          lastLoginAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Error handling Firestore document for Facebook sign-in:', error);
      // Continue even if Firestore operations fail
    }
    
    // Get user data with role
    const userData = await mapFirebaseUserToUserData(user);
    
    // Get ID token for API requests
    const token = await getIdToken(user);
    setToken(token);
    
    return { user: userData, error: null };
  } catch (error: any) {
    let errorMessage = 'Facebook sign-in failed';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Sign-in popup was blocked by your browser';
    }
    
    return { user: null, error: errorMessage };
  }
};

// Password Reset
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error: any) {
    let errorMessage = 'Password reset failed';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Sign Out
export const logout = async () => {
  try {
    await signOut(auth);
    removeToken();
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Logout failed' };
  }
};

// Auth State Observer using Firebase Auth
export const onAuthChanged = (callback: (user: UserData | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userData = await mapFirebaseUserToUserData(firebaseUser);
        
        // Update token
        const token = await getIdToken(firebaseUser);
        setToken(token);
        
        callback(userData);
      } catch (error) {
        console.error('Error in auth state change:', error);
        callback(null);
      }
    } else {
      removeToken();
      callback(null);
    }
  });
};

// Get current user
export const getCurrentUser = async (): Promise<UserData | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  
  try {
    return await mapFirebaseUserToUserData(firebaseUser);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Update user role and/or subrole
export const updateUserRole = async (
  userId: string, 
  role: UserRoleType,
  subrole?: UserSubroleType
) => {
  try {
    // Update role/subrole in Firestore
    const userRef = safeDocRef('users', userId);
    
    const updateData: { role: UserRoleType; subrole?: UserSubroleType } = { role };
    
    // Only add subrole to the update if it's provided
    if (subrole) {
      updateData.subrole = subrole;
    }
    
    await updateDoc(userRef, updateData);
    console.log(`Updated user ${userId} to role: ${role}${subrole ? `, subrole: ${subrole}` : ''}`);
    
    // If it's the current user, refresh the token to update claims
    if (auth.currentUser?.uid === userId) {
      await auth.currentUser.getIdToken(true);
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Failed to update user role:', error);
    return { success: false, error: error.message || 'Failed to update role' };
  }
};

// Export the API client for use in other files
export { apiClient };