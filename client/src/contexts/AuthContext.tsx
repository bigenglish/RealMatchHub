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
  UserRoleType,
  UserSubroleType,
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
  register: (
    name: string, 
    email: string, 
    password: string, 
    role?: UserRoleType,
    subrole?: UserSubroleType
  ) => Promise<{ success: boolean; error?: string }>;
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
      console.log('Starting Google sign-in flow');
      const { user, error } = await signInWithGoogle();
      if (user) {
        toast({
          title: 'Google Sign-In Successful',
          description: `Welcome${user.displayName ? ', ' + user.displayName : ''}!`,
          variant: 'default',
        });
        console.log('Google sign-in successful:', user.uid);
        return { success: true };
      } else {
        console.error('Google sign-in failed:', error);
        setError(error);
        toast({
          title: 'Google Sign-In Failed',
          description: error || 'Could not sign in with Google',
          variant: 'destructive',
        });
        return { success: false, error };
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const errorMessage = err.message || 'An error occurred during Google login';
      setError(errorMessage);
      toast({
        title: 'Google Sign-In Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  };

  // Login with Facebook
  const loginWithFacebook = async () => {
    try {
      console.log('Starting Facebook sign-in flow');
      const { user, error } = await signInWithFacebook();
      if (user) {
        toast({
          title: 'Facebook Sign-In Successful',
          description: `Welcome${user.displayName ? ', ' + user.displayName : ''}!`,
          variant: 'default',
        });
        console.log('Facebook sign-in successful:', user.uid);
        return { success: true };
      } else {
        console.error('Facebook sign-in failed:', error);
        setError(error);
        toast({
          title: 'Facebook Sign-In Failed',
          description: error || 'Could not sign in with Facebook',
          variant: 'destructive',
        });
        return { success: false, error };
      }
    } catch (err: any) {
      console.error('Facebook sign-in error:', err);
      const errorMessage = err.message || 'An error occurred during Facebook login';
      setError(errorMessage);
      toast({
        title: 'Facebook Sign-In Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register a new user
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRoleType = 'user', 
    subrole?: UserSubroleType
  ) => {
    try {
      console.log('AuthContext register called with:', { name, email, role, subrole });
      
      // Validate inputs
      if (!name || !email || !password) {
        const errorMessage = 'All fields are required';
        toast({
          title: 'Registration Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, error: errorMessage };
      }
      
      const result = await createAccount(name, email, password, role, subrole);
      console.log('createAccount result:', result);
      
      if (result.user) {
        // Generate a role-specific welcome message
        let welcomeMessage = `Welcome to Realty.AI, ${name}!`;
        if (role === 'vendor') {
          welcomeMessage = `Welcome to Realty.AI Vendor Portal, ${name}!`;
        } else if (role === 'admin') {
          welcomeMessage = `Welcome to Realty.AI Admin Portal, ${name}!`;
        }
        
        toast({
          title: 'Registration Successful',
          description: welcomeMessage,
          variant: 'default',
        });
        return { success: true };
      } else {
        console.error('Registration failed with error:', result.error);
        setError(result.error || 'Unknown registration error');
        toast({
          title: 'Registration Failed',
          description: result.error || 'Could not create your account',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      console.error('Registration error in AuthContext:', err);
      const errorMessage = err.message || 'An error occurred during registration';
      setError(errorMessage);
      toast({
        title: 'Registration Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const forgotPassword = async (email: string) => {
    try {
      console.log('Starting password reset process for email:', email);
      
      // Simple validation
      if (!email || !email.includes('@')) {
        const errorMessage = 'Please enter a valid email address';
        toast({
          title: 'Password Reset Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, error: errorMessage };
      }
      
      const { success, error } = await resetPassword(email);
      if (success) {
        console.log('Password reset email sent successfully');
        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your email for a link to reset your password.',
          variant: 'default',
        });
        return { success: true };
      } else {
        console.error('Password reset failed:', error);
        setError(error);
        toast({
          title: 'Password Reset Failed',
          description: error || 'Could not send password reset email',
          variant: 'destructive',
        });
        return { success: false, error };
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      const errorMessage = err.message || 'An error occurred during password reset';
      setError(errorMessage);
      toast({
        title: 'Password Reset Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log('Starting sign-out process');
      const { success, error } = await logout();
      if (success) {
        setUser(null);
        toast({
          title: 'Signed Out',
          description: 'You have been successfully signed out.',
          variant: 'default',
        });
        console.log('Sign-out successful');
        return { success: true };
      } else {
        console.error('Sign-out failed:', error);
        setError(error);
        toast({
          title: 'Sign-Out Failed',
          description: error || 'Could not sign you out',
          variant: 'destructive',
        });
        return { success: false, error };
      }
    } catch (err: any) {
      console.error('Sign-out error:', err);
      const errorMessage = err.message || 'An error occurred during sign out';
      setError(errorMessage);
      toast({
        title: 'Sign-Out Error',
        description: errorMessage,
        variant: 'destructive',
      });
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