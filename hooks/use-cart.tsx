"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    const loadUserCart = () => {
      // Get current user ID
      const userData = localStorage.getItem("current_user")
      console.log("Cart loading - userData:", userData)
      
      if (!userData) {
        console.log("No user data found, clearing cart")
        setItems([])
        return
      }

      try {
        const user = JSON.parse(userData)
        const userId = user.id
        const cartKey = `cart_${userId}`
        console.log("Loading cart for user:", userId, "with key:", cartKey)
        
        const storedCart = localStorage.getItem(cartKey)
        console.log("Stored cart data:", storedCart)
        
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart)
          console.log("Parsed cart:", parsedCart)
          
          // Handle both array format (new) and single object format (legacy)
          if (Array.isArray(parsedCart)) {
            console.log("Setting array cart items:", parsedCart)
            setItems(parsedCart)
          } else if (parsedCart && typeof parsedCart === 'object') {
            // Convert single quotation object to cart item format
            const cartItem: CartItem = {
              id: parsedCart.order_id || `quotation-${Date.now()}`,
              name: `PCB Fabrication - ${parsedCart.Layers} layers`,
              sku: `PCB-${parsedCart.Layers}-${parsedCart.Thickness}`,
              price: parseFloat(parsedCart.price) || 0,
              image: parsedCart.File_Url || "/placeholder-pcb.png",
              quantity: 1,
              inStock: true
            }
            console.log("Converting single object to cart item:", cartItem)
            setItems([cartItem])
          }
        } else {
          console.log("No stored cart found for user")
          setItems([])
        }
      } catch (error) {
        console.error("Failed to parse user or cart data:", error)
        setItems([])
      }
    }

    loadUserCart()

    // Listen for storage changes (user login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "current_user") {
        loadUserCart()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    
    // Also listen for custom events (for same-tab changes)
    const handleUserChange = () => {
      loadUserCart()
    }

    window.addEventListener("userChanged", handleUserChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userChanged", handleUserChange)
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    const saveUserCart = () => {
      // Get current user ID
      const userData = localStorage.getItem("current_user")
      console.log("Saving cart - userData:", userData)
      
      if (!userData) {
        console.log("No user data for saving cart")
        return
      }

      try {
        const user = JSON.parse(userData)
        const userId = user.id
        const cartKey = `cart_${userId}`
        console.log("Saving cart for user:", userId, "with key:", cartKey, "items:", items)
        localStorage.setItem(cartKey, JSON.stringify(items))
        console.log("Cart saved successfully")
      } catch (error) {
        console.error("Failed to save cart data:", error)
      }
    }

    saveUserCart()
  }, [items])

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    console.log("Adding item to cart:", newItem)
    
    setItems((prevItems) => {
      console.log("Previous items:", prevItems)
      
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id)

      if (existingItemIndex > -1) {
        // Item exists, increase quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += 1
        console.log("Updated existing item:", updatedItems)
        return updatedItems
      } else {
        // New item, add with quantity 1
        const newItems = [...prevItems, { ...newItem, quantity: 1 }]
        console.log("Added new item:", newItems)
        return newItems
      }
    })
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
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
