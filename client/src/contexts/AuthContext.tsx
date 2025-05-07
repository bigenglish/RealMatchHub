import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthChanged, 
  signInWithEmail, 
  signInWithGoogle, 
  signInWithFacebook, 
  createAccount, 
  resetPassword, 
  logout,
  UserData, 
  getCurrentUser 
} from '../lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role?: 'user' | 'vendor' | 'admin') => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => ({ success: false, error: 'Not implemented' }),
  loginWithGoogle: async () => ({ success: false, error: 'Not implemented' }),
  loginWithFacebook: async () => ({ success: false, error: 'Not implemented' }),
  register: async () => ({ success: false, error: 'Not implemented' }),
  forgotPassword: async () => ({ success: false, error: 'Not implemented' }),
  signOut: async () => ({ success: false, error: 'Not implemented' }),
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap our app and make auth object available
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing user
        const existingUser = await getCurrentUser();
        if (existingUser) {
          setUser(existingUser);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up the auth state listener
    const unsubscribe = onAuthChanged((userData) => {
      setUser(userData);
      setLoading(false);
    });

    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const { user, error } = await signInWithEmail(email, password);
      if (user) {
        toast({
          title: 'Login Successful',
          description: `Welcome back${user.displayName ? ', ' + user.displayName : ''}!`,
          variant: 'default',
        });
        return { success: true };
      } else {
        setError(error);
        toast({
          title: 'Login Failed',
          description: error || 'Invalid email or password',
          variant: 'destructive',
        });
        return { success: false, error };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      toast({
        title: 'Login Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const { user, error } = await signInWithGoogle();
      if (user) {
        return { success: true };
      } else {
        setError(error);
        return { success: false, error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during Google login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login with Facebook
  const loginWithFacebook = async () => {
    try {
      const { user, error } = await signInWithFacebook();
      if (user) {
        return { success: true };
      } else {
        setError(error);
        return { success: false, error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during Facebook login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register a new user
  const register = async (name: string, email: string, password: string, role: 'user' | 'vendor' | 'admin' = 'user') => {
    try {
      console.log('AuthContext register called with:', { name, email, role });
      const result = await createAccount(name, email, password, role);
      console.log('createAccount result:', result);
      
      if (result.user) {
        return { success: true };
      } else {
        setError(result.error || 'Unknown registration error');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      console.error('Registration error in AuthContext:', err);
      const errorMessage = err.message || 'An error occurred during registration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const forgotPassword = async (email: string) => {
    try {
      const { success, error } = await resetPassword(email);
      if (success) {
        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your email for a link to reset your password.',
        });
        return { success: true };
      } else {
        setError(error);
        return { success: false, error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during password reset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { success, error } = await logout();
      if (success) {
        setUser(null);
        return { success: true };
      } else {
        setError(error);
        return { success: false, error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during sign out';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    loginWithFacebook,
    register,
    forgotPassword,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;