// Create hooks/use-cart.tsx
"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './use-auth'

interface CartItem {
  product_id: string
  name: string
  sku: string
  price: number
  image: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    loadCart()
  }, [user, isAuthenticated])

  const loadCart = async () => {
    if (!isAuthenticated || !user) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.cart.items || [])
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCart = async (cartItems: CartItem[]) => {
    if (!isAuthenticated || !user) return

    try {
      const token = localStorage.getItem('access_token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      })
    } catch (error) {
      console.error('Failed to save cart:', error)
    }
  }

  const addItem = async (item: Omit<CartItem, 'quantity'>) => {
    const existingItem = items.find(i => i.product_id === item.product_id)
    let newItems: CartItem[]

    if (existingItem) {
      newItems = items.map(i =>
        i.product_id === item.product_id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    } else {
      newItems = [...items, { ...item, quantity: 1 }]
    }

    setItems(newItems)
    await saveCart(newItems)
  }

  const removeItem = async (productId: string) => {
    const newItems = items.filter(item => item.product_id !== productId)
    setItems(newItems)
    await saveCart(newItems)
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    const newItems = items.map(item =>
      item.product_id === productId
        ? { ...item, quantity }
        : item
    )
    setItems(newItems)
    await saveCart(newItems)
  }

  const clearCart = async () => {
    setItems([])
    if (isAuthenticated && user) {
      try {
        const token = localStorage.getItem('access_token')
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error('Failed to clear cart:', error)
      }
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}