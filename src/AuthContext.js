import React, { createContext, useState, useEffect, useContext } from 'react'
import supabase from './supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Expose the supabase auth functions
  const signUp = (data) => supabase.auth.signUp(data)
  const signIn = (data) => supabase.auth.signInWithPassword(data)
  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn, 
      signOut,
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