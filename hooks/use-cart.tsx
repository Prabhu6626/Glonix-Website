"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { CustomerApiService } from "@/lib/customer-api"
import { AuthService } from "@/lib/auth"

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
  itemCount: number
  totalPrice: number
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  loading: boolean
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // Load cart from MongoDB via API
  useEffect(() => {
    const loadUserCart = async () => {
      if (!AuthService.isAuthenticated()) {
        setItems([])
        return
      }

      setLoading(true)
      try {
        const cartData = await CustomerApiService.getCart()
        
        // Convert API cart format to component format
        const cartItems: CartItem[] = cartData.map((item: any) => ({
          id: item.product_id,
          name: item.product_name,
          sku: item.product_sku,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          inStock: true // Will be validated on checkout
        }))
        
        setItems(cartItems)
      } catch (error) {
        console.error("Failed to load cart:", error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    loadUserCart()

    // Also listen for custom events (for same-tab changes)
    const handleUserChange = () => {
      loadUserCart()
    }

    window.addEventListener("userChanged", handleUserChange)

    return () => {
      window.removeEventListener("userChanged", handleUserChange)
    }
  }, [])

  const refreshCart = async () => {
    if (!AuthService.isAuthenticated()) {
      setItems([])
      return
    }

    setLoading(true)
    try {
      const cartData = await CustomerApiService.getCart()
      
      const cartItems: CartItem[] = cartData.map((item: any) => ({
        id: item.product_id,
        name: item.product_name,
        sku: item.product_sku,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        inStock: true
      }))
      
      setItems(cartItems)
    } catch (error) {
      console.error("Failed to refresh cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (newItem: Omit<CartItem, "quantity">) => {
    try {
      const success = await CustomerApiService.addToCart(newItem.id, 1)
      if (success) {
        await refreshCart()
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error)
    }
  }

  const removeItem = async (id: string) => {
    try {
      const updatedItems = items.filter(item => item.id !== id)
      const cartItems = updatedItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
      
      const success = await CustomerApiService.updateCart(cartItems)
      if (success) {
        await refreshCart()
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error)
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id)
      return
    }

    try {
      const updatedItems = items.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
      
      const cartItems = updatedItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
      
      const success = await CustomerApiService.updateCart(cartItems)
      if (success) {
        await refreshCart()
      }
    } catch (error) {
      console.error("Failed to update cart quantity:", error)
    }
  }

  const clearCart = async () => {
    try {
      const success = await CustomerApiService.clearCart()
      if (success) {
        setItems([])
      }
    } catch (error) {
      console.error("Failed to clear cart:", error)
    }
  }

  const itemCount = Array.isArray(items) ? items.reduce((total, item) => total + item.quantity, 0) : 0
  const totalPrice = Array.isArray(items) ? items.reduce((total, item) => total + item.price * item.quantity, 0) : 0

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        loading,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
