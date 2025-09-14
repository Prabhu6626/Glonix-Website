// Updated auth.ts - Now connects to MongoDB via FastAPI backend
export interface User {
  id: string
  email: string
  full_name: string
  company?: string
  phone?: string
  role: "admin" | "customer"
  is_active: boolean
  fabrication_status: 0 | 1 | 2
  created_at: string
  updated_at: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  company?: string
  phone?: string
}

export class AuthService {
  private static readonly TOKEN_KEY = "access_token"
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  private static readonly USER_KEY = "current_user"

  private static async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.API_BASE_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    // Add authorization header if token exists
    const token = this.getToken()
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network error' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  private static getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  private static setToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.TOKEN_KEY, token)
    document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
  }

  private static removeToken(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.TOKEN_KEY)
    document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  static async login(data: LoginData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (response.access_token) {
        this.setToken(response.access_token)
        
        // Get and store user data
        const userData = await this.getCurrentUser()
        if (userData) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(userData))
        }
        
        if (typeof window !== "undefined") {
          localStorage.setItem("session_start", Date.now().toString())
        }

        return { success: true }
      } else {
        return { success: false, error: 'Login failed' }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      return { success: false, error: errorMessage }
    }
  }

  static async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (response.access_token) {
        this.setToken(response.access_token)
        
        // Get and store user data
        const userData = await this.getCurrentUser()
        if (userData) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(userData))
        }
        
        if (typeof window !== "undefined") {
          localStorage.setItem("session_start", Date.now().toString())
        }

        return { success: true }
      } else {
        return { success: false, error: 'Registration failed' }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      return { success: false, error: errorMessage }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.isAuthenticated()) return null
      
      const response = await this.apiRequest('/auth/me')
      
      // Store user data locally for quick access
      if (response && typeof window !== "undefined") {
        localStorage.setItem(this.USER_KEY, JSON.stringify(response))
      }
      
      return response
    } catch (error) {
      console.error('Failed to get current user:', error)
      this.removeToken()
      if (typeof window !== "undefined") {
        localStorage.removeItem(this.USER_KEY)
      }
      return null
    }
  }

  static async verifyToken(): Promise<boolean> {
    try {
      if (!this.getToken()) return false
      
      await this.apiRequest('/auth/verify')
      return true
    } catch (error) {
      console.error('Token verification failed:', error)
      this.removeToken()
      return false
    }
  }

  static logout(): void {
    this.removeToken()

    if (typeof window !== "undefined") {
      localStorage.removeItem("session_start")
      localStorage.removeItem("user_preferences")
      localStorage.removeItem(this.USER_KEY)
      window.location.href = "/"
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  static isAdmin(): boolean {
    // This would need to be checked from the backend
    // For now, we'll get it from the current user
    return false // Will be updated after getting user data
  }

  static getSessionDuration(): number {
    if (typeof window === "undefined") return 0

    const sessionStart = localStorage.getItem("session_start")
    if (!sessionStart) return 0

    return Date.now() - parseInt(sessionStart)
  }

  static isSessionExpired(): boolean {
    const maxSessionDuration = 24 * 60 * 60 * 1000 // 24 hours
    return this.getSessionDuration() > maxSessionDuration
  }

  // These methods would need backend endpoints to work with MongoDB
  static async updateFabricationStatus(userId: string, status: 0 | 1 | 2): Promise<boolean> {
    try {
      await this.apiRequest('/auth/fabrication-status', {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId, status }),
      })
      
      // Update local user data
      const userData = localStorage.getItem(this.USER_KEY)
      if (userData) {
        const user = JSON.parse(userData)
        user.fabrication_status = status
        localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      }
      
      return true
    } catch (error) {
      console.error('Failed to update fabrication status:', error)
      return false
    }
  }

  static async updateAssemblyStatus(userId: string, status: 0 | 1 | 2): Promise<boolean> {
    // For now, use the same endpoint as fabrication status
    return this.updateFabricationStatus(userId, status)
  }

  static getStoredUser(): User | null {
    if (typeof window === "undefined") return null
    const userData = localStorage.getItem(this.USER_KEY)
    return userData ? JSON.parse(userData) : null
  }

  static async getUsersByFabricationStatus(status: 0 | 1 | 2): Promise<User[]> {
    try {
      const response = await this.apiRequest(`/auth/users-by-fabrication-status?status=${status}`)
      return response.users || []
    } catch (error) {
      console.error('Failed to get users by fabrication status:', error)
      return []
    }
  }
}