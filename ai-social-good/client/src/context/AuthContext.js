import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      });
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signup = async (email, password, displayName) => {
    try {
      setError('');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with display name if provided
      if (displayName) {
        await result.user.updateProfile({ displayName });
      }
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName || result.user.displayName,
      });
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 