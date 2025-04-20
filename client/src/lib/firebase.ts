import axios from 'axios';

// Interface for user data
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'user' | 'vendor' | 'admin';
}

// Store token in localStorage
const TOKEN_KEY = 'auth_token';
const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
const getToken = () => localStorage.getItem(TOKEN_KEY);
const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Store current user in localStorage
const USER_KEY = 'current_user';
const setUser = (user: UserData) => localStorage.setItem(USER_KEY, JSON.stringify(user));
const getUser = (): UserData | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};
const removeUser = () => localStorage.removeItem(USER_KEY);

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

// Email/Password Authentication
export const signInWithEmail = async (email: string, password: string) => {
  try {
    // This is a mock since we don't have a direct server endpoint for this
    // In a real app, you'd use Firebase client SDK to authenticate
    // and then get a custom token from the server
    
    // Simulate a successful login for now
    // This would typically involve:
    // 1. Client authenticates with Firebase client SDK
    // 2. Get ID token from Firebase
    // 3. Send ID token to server to get user details and role
    
    // For now, we'll just simulate a successful login
    const mockUser = {
      uid: `user_${Math.floor(Math.random() * 10000)}`,
      email,
      displayName: email.split('@')[0],
      role: 'user' as const,
    };
    
    // Store user and token
    setUser(mockUser);
    setToken(`mock_token_${mockUser.uid}`);
    
    return { user: mockUser, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'Login failed' };
  }
};

export const createAccount = async (fullName: string, email: string, password: string, role: 'user' | 'vendor' | 'admin' = 'user') => {
  try {
    const response = await apiClient.post('/auth/register', {
      fullName,
      email,
      password,
      role,
    });
    
    if (response.data.success) {
      const user = response.data.user;
      
      // Store user and token
      setUser(user);
      // In a real app, you'd get a token from Firebase after authentication
      setToken(`mock_token_${user.uid}`);
      
      return { user, error: null };
    } else {
      return { user: null, error: response.data.message || 'Registration failed' };
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
    return { user: null, error: errorMessage };
  }
};

// Social Authentication
export const signInWithGoogle = async () => {
  try {
    // This would need to be implemented with Firebase client SDK
    // For now, return a mock success
    const mockUser = {
      uid: `google_user_${Math.floor(Math.random() * 10000)}`,
      email: 'google_user@example.com',
      displayName: 'Google User',
      role: 'user' as const,
    };
    
    // Store user and token
    setUser(mockUser);
    setToken(`mock_token_${mockUser.uid}`);
    
    return { user: mockUser, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'Google sign-in failed' };
  }
};

export const signInWithFacebook = async () => {
  try {
    // This would need to be implemented with Firebase client SDK
    // For now, return a mock success
    const mockUser = {
      uid: `facebook_user_${Math.floor(Math.random() * 10000)}`,
      email: 'facebook_user@example.com',
      displayName: 'Facebook User',
      role: 'user' as const,
    };
    
    // Store user and token
    setUser(mockUser);
    setToken(`mock_token_${mockUser.uid}`);
    
    return { user: mockUser, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'Facebook sign-in failed' };
  }
};

// Password Reset
export const resetPassword = async (email: string) => {
  try {
    // This would need to be implemented with Firebase client SDK
    // For now, return a mock success
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Password reset failed' };
  }
};

// Sign Out
export const logout = async () => {
  try {
    // Clear local storage
    removeToken();
    removeUser();
    
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Logout failed' };
  }
};

// Auth State Observer - similar functionality with local storage
export const onAuthChanged = (callback: (user: UserData | null) => void) => {
  // Initial call with current user
  callback(getUser());
  
  // Setup a storage event listener to detect changes in other tabs
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === USER_KEY) {
      const user = event.newValue ? JSON.parse(event.newValue) : null;
      callback(user);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

// Get current user
export const getCurrentUser = (): UserData | null => {
  return getUser();
};

// Update user role
export const updateUserRole = async (userId: string, role: 'user' | 'vendor' | 'admin') => {
  try {
    const response = await apiClient.post('/auth/update-role', {
      userId,
      role,
    });
    
    if (response.data.success) {
      // Update local user if it's the current user
      const currentUser = getUser();
      if (currentUser && currentUser.uid === userId) {
        currentUser.role = role;
        setUser(currentUser);
      }
      
      return { success: true, error: null };
    } else {
      return { success: false, error: response.data.message || 'Failed to update role' };
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update role';
    return { success: false, error: errorMessage };
  }
};