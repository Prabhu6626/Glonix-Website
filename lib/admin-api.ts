// lib/admin-api.ts - Admin API service connecting to MongoDB backend
import type { User, Product, Order, ContactMessage, ProductFormData, UserFormData, AdminStats } from "./types"

export class AdminApiService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  private static async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem("access_token")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const url = `${this.API_BASE_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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

  // ANALYTICS
  static async getAdminStats(): Promise<AdminStats> {
    try {
      const stats = await this.apiRequest('/admin/analytics/overview')
      return stats
    } catch (error) {
      console.error("Failed to get admin stats:", error)
      return {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        newMessages: 0,
        newQuotes: 0,
      }
    }
  }

  // USER MANAGEMENT
  static async getAllUsers(skip = 0, limit = 100): Promise<{ users: User[], total: number }> {
    try {
      const response = await this.apiRequest(`/admin/users?skip=${skip}&limit=${limit}`)
      return {
        users: response.users || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error("Failed to get users:", error)
      return { users: [], total: 0 }
    }
  }

  static async updateUser(userId: string, updates: Partial<UserFormData>): Promise<boolean> {
    try {
      await this.apiRequest(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      return true
    } catch (error) {
      console.error("Failed to update user:", error)
      return false
    }
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE',
      })
      return true
    } catch (error) {
      console.error("Failed to delete user:", error)
      return false
    }
  }

  static async getUsersByFabricationStatus(status: 0 | 1 | 2): Promise<User[]> {
    try {
      const response = await this.apiRequest(`/admin/users/fabrication-status/${status}`, {
        method: 'GET' // Explicitly specify GET method
      })
      return response.users || []
    } catch (error) {
      console.error("Failed to get users by fabrication status:", error)
      return []
    }
  }

  // PRODUCT MANAGEMENT
  static async getAllProducts(skip = 0, limit = 100, category?: string): Promise<{ products: Product[], total: number }> {
    try {
      let url = `/admin/products?skip=${skip}&limit=${limit}`
      if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`
      }
      
      const response = await this.apiRequest(url)
      return {
        products: response.products || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error("Failed to get products:", error)
      return { products: [], total: 0 }
    }
  }

  static async createProduct(productData: ProductFormData): Promise<Product | null> {
    try {
      const response = await this.apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      })
      return response
    } catch (error) {
      console.error("Failed to create product:", error)
      return null
    }
  }

  static async updateProduct(productId: string, updates: Partial<ProductFormData>): Promise<boolean> {
    try {
      await this.apiRequest(`/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      return true
    } catch (error) {
      console.error("Failed to update product:", error)
      return false
    }
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      await this.apiRequest(`/admin/products/${productId}`, {
        method: 'DELETE',
      })
      return true
    } catch (error) {
      console.error("Failed to delete product:", error)
      return false
    }
  }

  // ORDER MANAGEMENT
  static async getAllOrders(skip = 0, limit = 100, status?: string): Promise<{ orders: Order[], total: number }> {
    try {
      let url = `/admin/orders?skip=${skip}&limit=${limit}`
      if (status && status !== 'all') {
        url += `&status=${encodeURIComponent(status)}`
      }
      
      const response = await this.apiRequest(url)
      return {
        orders: response.orders || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error("Failed to get orders:", error)
      return { orders: [], total: 0 }
    }
  }

  static async updateOrderStatus(orderId: string, updates: { status?: string, tracking_number?: string, notes?: string }): Promise<boolean> {
    try {
      await this.apiRequest(`/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      return true
    } catch (error) {
      console.error("Failed to update order:", error)
      return false
    }
  }

  // CONTACT MESSAGES
  static async getContactMessages(skip = 0, limit = 50): Promise<{ messages: ContactMessage[], total: number }> {
    try {
      const response = await this.apiRequest(`/admin/messages?skip=${skip}&limit=${limit}`)
      return {
        messages: response.messages || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error("Failed to get contact messages:", error)
      return { messages: [], total: 0 }
    }
  }
}