import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthChanged } from '../lib/firebase';

// Define the types for the context
interface AuthContextType {
  currentUser: User | null;
  userRole: 'user' | 'vendor' | 'admin' | null;
  loading: boolean;
  setUserRole: (role: 'user' | 'vendor' | 'admin') => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  loading: true,
  setUserRole: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available to any child component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'vendor' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to auth state changes when the component mounts
  useEffect(() => {
    const unsubscribe = onAuthChanged((user) => {
      setCurrentUser(user);
      
      // Here you would typically fetch the user's role from your database
      // For now, we'll default to 'user' when logged in
      if (user) {
        // Check if we already have a role stored
        const storedRole = localStorage.getItem('userRole');
        if (storedRole && ['user', 'vendor', 'admin'].includes(storedRole)) {
          setUserRole(storedRole as 'user' | 'vendor' | 'admin');
        } else {
          setUserRole('user');
          localStorage.setItem('userRole', 'user');
        }
      } else {
        setUserRole(null);
        localStorage.removeItem('userRole');
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Function to update user role
  const handleSetUserRole = (role: 'user' | 'vendor' | 'admin') => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    
    // Here you would typically update the user's role in your database
  };

  const value: AuthContextType = {
    currentUser,
    userRole,
    loading,
    setUserRole: handleSetUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};