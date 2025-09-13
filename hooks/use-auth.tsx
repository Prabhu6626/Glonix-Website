"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { AuthService, type User } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: {
    email: string
    password: string
    full_name: string
    company?: string
    phone?: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  clearError: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = useCallback(async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
        setError(null)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
      setError("Session expired. Please login again.")
      setUser(null)
      AuthService.logout()
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (AuthService.isAuthenticated()) {
        const isValid = await AuthService.verifyToken()
        if (isValid) {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
        } else {
          setUser(null)
          AuthService.logout()
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setError("Authentication check failed")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()

    // Set up periodic token validation (every 5 minutes)
    const interval = setInterval(
      async () => {
        if (AuthService.isAuthenticated()) {
          const isValid = await AuthService.verifyToken()
          if (!isValid) {
            setError("Session expired. Please login again.")
            setUser(null)
            AuthService.logout()
          }
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [checkAuth])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const result = await AuthService.login({ email, password })

      if (result.success) {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)

        // Store login timestamp for session management
        localStorage.setItem("login_timestamp", Date.now().toString())

        // Dispatch custom event to notify cart of user change
        window.dispatchEvent(new CustomEvent("userChanged"))

        return { success: true }
      } else {
        setError(result.error || "Login failed")
        return result
      }
    } catch (error) {
      const errorMessage = "Network error. Please check your connection."
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(
    async (data: {
      email: string
      password: string
      full_name: string
      company?: string
      phone?: string
    }) => {
      try {
        setLoading(true)
        setError(null)

        const result = await AuthService.register(data)

        if (result.success) {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)

          // Store registration timestamp
          localStorage.setItem("login_timestamp", Date.now().toString())

          // Dispatch custom event to notify cart of user change
          window.dispatchEvent(new CustomEvent("userChanged"))

          return { success: true }
        } else {
          setError(result.error || "Registration failed")
          return result
        }
      } catch (error) {
        const errorMessage = "Network error. Please check your connection."
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    setError(null)
    localStorage.removeItem("login_timestamp")
    localStorage.removeItem("redirectAfterLogin")
    
    // Dispatch custom event to notify cart of user change
    window.dispatchEvent(new CustomEvent("userChanged"))
    
    AuthService.logout()
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    const checkSessionTimeout = () => {
      const loginTimestamp = localStorage.getItem("login_timestamp")
      if (loginTimestamp && user) {
        const sessionDuration = Date.now() - Number.parseInt(loginTimestamp)
        const maxSessionDuration = 24 * 60 * 60 * 1000 // 24 hours

        if (sessionDuration > maxSessionDuration) {
          setError("Session expired due to inactivity. Please login again.")
          logout()
        }
      }
    }

    // Check session timeout on focus
    const handleFocus = () => {
      checkSessionTimeout()
      if (user && AuthService.isAuthenticated()) {
        refreshUser()
      }
    }

    // Check session timeout on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus()
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [user, logout, refreshUser])

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthStatus() {
  const { isAuthenticated, loading } = useAuth()
  return { isAuthenticated, loading }
}

export function useUser() {
  const { user, loading, refreshUser } = useAuth()
  return { user, loading, refreshUser }
}
