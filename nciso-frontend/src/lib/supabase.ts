import { createClient } from '@supabase/supabase-js'
import { APP_CONFIG } from './constants'

const supabaseUrl = APP_CONFIG.supabaseUrl
const supabaseAnonKey = APP_CONFIG.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para autenticação
export interface AuthUser {
  id: string
  email: string
  name?: string
  tenant_id?: string
  role?: string
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
}

// Hook para autenticação
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obter sessão atual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user as AuthUser || null)
      setLoading(false)
    }

    getSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user as AuthUser || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return data
  }

  return {
    user,
    loading,
    signIn,
    signOut,
    signUp
  }
}

import { useState, useEffect } from 'react' 