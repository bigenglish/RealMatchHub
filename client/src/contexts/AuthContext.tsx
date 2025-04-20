import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChanged, UserData, getCurrentUser } from '../lib/firebase';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

// Create context with a default empty object
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap our app and make auth object available
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing user in localStorage first
    const existingUser = getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
      setLoading(false);
    }

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

  // Context value
  const value = {
    user,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;