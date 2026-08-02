import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('krew_token'))
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    if (!token) { setUser(null); return }
    try {
      const u = await api.auth.me(token)
      setUser(u)
    } catch {
      localStorage.removeItem('krew_token')
      setToken(null)
      setUser(null)
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password })
    localStorage.setItem('krew_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
  }

  const signup = async (email: string, password: string, fullName: string) => {
    const res = await api.auth.signup({ email, password, full_name: fullName })
    localStorage.setItem('krew_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
  }

  const logout = () => {
    localStorage.removeItem('krew_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
