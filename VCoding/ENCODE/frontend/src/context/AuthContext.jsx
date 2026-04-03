import { createContext, useContext, useState, useEffect } from 'react'
import { loginApi, signupApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const stored = window.localStorage.getItem('encode_auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.user && parsed?.token) {
          setUser(parsed.user)
          setToken(parsed.token)
        }
      } catch {
        // ignore
      }
    }
    setLoading(false)
  }, [])

  const persistAuth = (nextUser, nextToken) => {
    setUser(nextUser)
    setToken(nextToken)
    window.localStorage.setItem(
      'encode_auth',
      JSON.stringify({ user: nextUser, token: nextToken })
    )
  }

  const login = async (email, password) => {
    setError(null)
    const data = await loginApi({ email, password })
    persistAuth(data.user, data.token)
  }

  const signup = async (username, email, password) => {
    setError(null)
    const data = await signupApi({ username, email, password })
    persistAuth(data.user, data.token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    window.localStorage.removeItem('encode_auth')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, error, setError, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
