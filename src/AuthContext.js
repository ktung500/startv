import React, { createContext, useState, useEffect, useContext } from 'react'
import supabase from './supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user profile
  const fetchProfile = async (userId) => {
    try {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        
        // Create profile if it doesn't exist
        if (error.code === 'PGRST116') {
          console.log('Creating new profile for user:', userId);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ 
              id: userId,
              updated_at: new Date().toISOString()
            })
            .select('*')
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }
          
          return newProfile;
        }
        
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  };

  // Update user and fetch profile
  const updateUserAndProfile = async (currentSession) => {
    setSession(currentSession);
    const currentUser = currentSession?.user || null;
    setUser(currentUser);
    
    if (currentUser) {
      const userProfile = await fetchProfile(currentUser.id);
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        const session = data.session;
        await updateUserAndProfile(session);
      } catch (error) {
        console.error('Exception in getSession:', error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await updateUserAndProfile(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Function to refresh profile
  const refreshProfile = async () => {
    if (!user) return null;
    
    const userProfile = await fetchProfile(user.id);
    setProfile(userProfile);
    return userProfile;
  };

  // Expose the supabase auth functions
  const signUp = (data) => supabase.auth.signUp(data)
  const signIn = (data) => supabase.auth.signInWithPassword(data)
  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      session,
      profile,
      signUp,
      signIn, 
      signOut,
      refreshProfile,
      supabase
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext)
}
