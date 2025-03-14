// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from './supabaseClient';

const AuthContext = createContext();

// Auth Context Provider component
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async (userId) => {
    console.log("id: ", userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      console.log("profile fetched: ", data);
      return data;
    } catch (err) {
      console.error('Profile fetch exception:', err);
      return null;
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) throw new Error('Cannot update profile when not authenticated');
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let subscription;

    async function initializeAuth() {
      setLoading(true);
      try {
        // Get initial session
        const { data } = await supabase.auth.getSession();
        const { session } = data;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }

        // Set up auth state listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (event === 'SIGNED_OUT') {
              setProfile(null);
            } else if (event === 'SIGNED_IN' && session?.user) {
              const profileData = await fetchProfile(session.user.id);
              setProfile(profileData);
            }
          }
        );
        
        subscription = authListener.subscription;
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    initializeAuth();
    
    // Clean up subscription
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  const value = {
    session,
    profile,
    user,
    loading,
    error,
    supabase,
    updateProfile,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume Auth Context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { useAuth };