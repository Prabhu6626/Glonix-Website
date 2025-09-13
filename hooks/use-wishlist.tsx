"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface WishlistItem {
  id: string
  name: string
  sku: string
  price: number
  image: string
  inStock: boolean
  rating: number
  reviews: number
}

interface WishlistContextType {
  items: WishlistItem[]
  itemCount: number
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem("wishlist")
    if (storedWishlist) {
      try {
        const parsedWishlist = JSON.parse(storedWishlist)
        setItems(parsedWishlist)
      } catch (error) {
        console.error("Failed to parse wishlist data:", error)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(items))
  }, [items])

  const addItem = (newItem: WishlistItem) => {
    setItems((prevItems) => {
      // Check if item already exists
      if (prevItems.find((item) => item.id === newItem.id)) {
        return prevItems // Don't add duplicates
      }
      return [...prevItems, newItem]
    })
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id)
  }

  const clearWishlist = () => {
    setItems([])
  }

  const itemCount = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
