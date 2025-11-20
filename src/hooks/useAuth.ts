import { useState, useEffect } from 'react'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Implementar autenticação com Supabase
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // TODO: Implementar login
    console.log('Login:', email, password)
  }

  const signOut = async () => {
    // TODO: Implementar logout
    setUser(null)
  }

  return {
    user,
    loading,
    signIn,
    signOut,
  }
}
