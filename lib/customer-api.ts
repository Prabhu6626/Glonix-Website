// lib/customer-api.ts - Customer API service for order management
import type { Order, OrderItem, Address } from "./types"

interface CreateOrderData {
  items: OrderItem[]
  shipping_address: Address
  billing_address: Address
  shipping_method: string
  payment_method: string
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
}

interface CartItem {
  product_id: string
  quantity: number
}
export class CustomerApiService {
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

  // Cart management
  static async addToCart(productId: string, quantity: number = 1): Promise<boolean> {
    try {
      await this.apiRequest('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
      })
      return true
    } catch (error) {
      console.error("Failed to add to cart:", error)
      return false
    }
  }

  static async getCart(): Promise<any[]> {
    try {
      const response = await this.apiRequest('/cart')
      return response.cart || []
    } catch (error) {
      console.error("Failed to get cart:", error)
      return []
    }
  }

  static async updateCart(items: CartItem[]): Promise<boolean> {
    try {
      await this.apiRequest('/cart', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      })
      return true
    } catch (error) {
      console.error("Failed to update cart:", error)
      return false
    }
  }

  static async clearCart(): Promise<boolean> {
    try {
      await this.apiRequest('/cart', {
        method: 'DELETE',
      })
      return true
    } catch (error) {
      console.error("Failed to clear cart:", error)
      return false
    }
  }
  // Create a new order
  static async createOrder(orderData: CreateOrderData): Promise<{ success: boolean; order_id?: string; error?: string }> {
    try {
      const response = await this.apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      })
      
      return { success: true, order_id: response.order_id }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Order creation failed'
      return { success: false, error: errorMessage }
    }
  }

  // Get customer's orders
  static async getMyOrders(): Promise<Order[]> {
    try {
      const response = await this.apiRequest('/orders/my-orders')
      return response.orders || []
    } catch (error) {
      console.error("Failed to get orders:", error)
      return []
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await this.apiRequest(`/orders/${orderId}`)
      return response.order || null
    } catch (error) {
      console.error("Failed to get order:", error)
      return null
    }
  }

  // Update fabrication status when user takes actions
  static async updateFabricationStatus(status: 1 | 2): Promise<boolean> {
    try {
      // Get current user to get user_id
      const userResponse = await this.apiRequest('/auth/me')
      if (!userResponse?.id) return false

      await this.apiRequest('/auth/fabrication-status', {
        method: 'PUT',
        body: JSON.stringify({ 
          user_id: userResponse.id, 
          status 
        }),
      })
      return true
    } catch (error) {
      console.error("Failed to update fabrication status:", error)
      return false
    }
  }

  // Submit contact message
  static async submitContactMessage(messageData: {
    name: string
    email: string
    company?: string
    phone?: string
    service_interest?: string
    message: string
  }): Promise<boolean> {
    try {
      await this.apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(messageData),
      })
      return true
    } catch (error) {
      console.error("Failed to submit contact message:", error)
      return false
    }
  }

  // Get products (for customers)
  static async getProducts(category?: string, search?: string): Promise<any[]> {
    try {
      let url = '/admin/products?skip=0&limit=1000'
      if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`
      }
      
      const response = await this.apiRequest(url)
      let products = response.products || []
      
      // Apply search filter on frontend if needed
      if (search) {
        products = products.filter((product: any) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.sku.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase())
        )
      }
      
      return products
    } catch (error) {
      console.error("Failed to get products:", error)
      return []
    }
  }

  // Get product by ID
  static async getProductById(productId: string): Promise<any | null> {
    try {
      const products = await this.getProducts()
      return products.find(p => p.id === productId) || null
    } catch (error) {
      console.error("Failed to get product:", error)
      return null
    }
  }
}