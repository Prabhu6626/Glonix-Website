// lib/cart-context.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'

interface CartItem {
  id: string
  name: string
  sku: string
  price: number
  image: string
  quantity: number
  inStock: boolean
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
  isInCart: (id: string) => boolean
  loading: boolean
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Cart API Service
class CartApiService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  private static async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem("access_token")
    const url = `${this.API_BASE_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

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

    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  static async getCart(): Promise<any> {
    const response = await this.apiRequest('/cart')
    return response.cart || { items: [] }
  }

  static async addToCart(productId: string, quantity: number = 1): Promise<boolean> {
    await this.apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    })
    return true
  }

  static async updateCart(items: Array<{product_id: string, quantity: number}>): Promise<boolean> {
    await this.apiRequest('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ items })
    })
    return true
  }

  static async removeFromCart(productId: string): Promise<boolean> {
    // Get current cart and filter out the item
    const cart = await this.getCart()
    const updatedItems = cart.items
      .filter((item: any) => item.product_id !== productId)
      .map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    
    await this.updateCart(updatedItems)
    return true
  }

  static async clearCart(): Promise<boolean> {
    await this.apiRequest('/cart/clear', {
      method: 'DELETE'
    })
    return true
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart()

    // Listen for user changes
    const handleUserChange = () => {
      loadCart()
    }

    window.addEventListener('storage', handleUserChange)
    window.addEventListener('userChanged', handleUserChange)

    return () => {
      window.removeEventListener('storage', handleUserChange)
      window.removeEventListener('userChanged', handleUserChange)
    }
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      
      // Check if user is logged in
      const userData = localStorage.getItem("current_user")
      if (!userData) {
        setItems([])
        setLoading(false)
        return
      }

      // Try to load from database first
      try {
        const backendCart = await CartApiService.getCart()
        
        if (backendCart.items && Array.isArray(backendCart.items)) {
          const formattedItems: CartItem[] = backendCart.items.map((item: any) => ({
            id: item.product_id,
            name: item.product_name,
            sku: item.product_sku,
            price: item.price,
            image: item.image || "",
            quantity: item.quantity,
            inStock: true,
          }))
          
          setItems(formattedItems)
          
          // Also sync with localStorage for offline access
          const user = JSON.parse(userData)
          const cartKey = `cart_${user.id}`
          localStorage.setItem(cartKey, JSON.stringify(formattedItems))
        } else {
          setItems([])
        }
      } catch (error) {
        console.error("Failed to load cart from database:", error)
        
        // Fallback to localStorage
        const user = JSON.parse(userData)
        const cartKey = `cart_${user.id}`
        const storedCart = localStorage.getItem(cartKey)
        
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart)
          if (Array.isArray(parsedCart)) {
            setItems(parsedCart)
          } else {
            setItems([])
          }
        } else {
          setItems([])
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const syncCartWithDatabase = async (cartItems: CartItem[]) => {
    try {
      const backendItems = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
      
      await CartApiService.updateCart(backendItems)
      
      // Also update localStorage
      const userData = localStorage.getItem("current_user")
      if (userData) {
        const user = JSON.parse(userData)
        const cartKey = `cart_${user.id}`
        localStorage.setItem(cartKey, JSON.stringify(cartItems))
      }
    } catch (error) {
      console.error("Failed to sync cart with database:", error)
      throw error
    }
  }

  const addItem = async (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    try {
      const quantity = newItem.quantity || 1
      
      // Add to database first
      await CartApiService.addToCart(newItem.id, quantity)
      
      // Update local state
      setItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === newItem.id)
        
        if (existingItem) {
          // Update quantity
          const updatedItems = prevItems.map(item =>
            item.id === newItem.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
          
          // Sync with database (no await to avoid blocking UI)
          syncCartWithDatabase(updatedItems).catch(console.error)
          
          return updatedItems
        } else {
          // Add new item
          const updatedItems = [...prevItems, { ...newItem, quantity }]
          
          // Sync localStorage
          const userData = localStorage.getItem("current_user")
          if (userData) {
            const user = JSON.parse(userData)
            const cartKey = `cart_${user.id}`
            localStorage.setItem(cartKey, JSON.stringify(updatedItems))
          }
          
          return updatedItems
        }
      })

      toast({
        title: "Added to Cart",
        description: `${newItem.name} has been added to your cart.`
      })
      
    } catch (error) {
      console.error("Failed to add item to cart:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart. Please try again."
      })
    }
  }

  const removeItem = async (id: string) => {
    try {
      // Remove from database first
      await CartApiService.removeFromCart(id)
      
      // Update local state
      setItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.id !== id)
        
        // Sync localStorage
        const userData = localStorage.getItem("current_user")
        if (userData) {
          const user = JSON.parse(userData)
          const cartKey = `cart_${user.id}`
          localStorage.setItem(cartKey, JSON.stringify(updatedItems))
        }
        
        return updatedItems
      })

      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart."
      })
      
    } catch (error) {
      console.error("Failed to remove item from cart:", error)
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to remove item from cart. Please try again."
      })
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id)
      return
    }

    try {
      // Update local state first for immediate UI feedback
      setItems(prevItems => {
        const updatedItems = prevItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
        
        // Sync with database (no await to avoid blocking UI)
        syncCartWithDatabase(updatedItems).catch(console.error)
        
        return updatedItems
      })
      
    } catch (error) {
      console.error("Failed to update quantity:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity. Please try again."
      })
    }
  }

  const clearCart = async () => {
    try {
      // Clear database first
      await CartApiService.clearCart()
      
      // Update local state
      setItems([])
      
      // Clear localStorage
      const userData = localStorage.getItem("current_user")
      if (userData) {
        const user = JSON.parse(userData)
        const cartKey = `cart_${user.id}`
        localStorage.removeItem(cartKey)
      }

      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart."
      })
      
    } catch (error) {
      console.error("Failed to clear cart:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear cart. Please try again."
      })
    }
  }

  const refreshCart = async () => {
    await loadCart()
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const isInCart = (id: string) => {
    return items.some(item => item.id === id)
  }

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    loading,
    refreshCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}