"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import type { Product } from "@/lib/types"
import { Search, Grid, List, ShoppingCart, Heart, Star, Package, Zap, Cpu, Wrench } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Enhanced API Service for customer products
class ProductApiService {
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

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Use public products endpoint for customers
  static async getAllProducts(params: {
    skip?: number,
    limit?: number,
    category?: string,
    search?: string
  } = {}): Promise<{products: Product[], total: number}> {
    try {
      const queryParams = new URLSearchParams()
      if (params.skip) queryParams.append('skip', params.skip.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.category) queryParams.append('category', params.category)
      if (params.search) queryParams.append('search', params.search)
      
      const endpoint = `/products?${queryParams.toString()}`
      const response = await this.apiRequest(endpoint)
      
      return {
        products: response.products || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error("Failed to get products:", error)
      return { products: [], total: 0 }
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await this.apiRequest(`/products/${id}`)
      return response || null
    } catch (error) {
      console.error("Failed to get product:", error)
      return null
    }
  }

  // Cart API methods
  static async addToCart(productId: string, quantity: number = 1): Promise<boolean> {
    try {
      await this.apiRequest('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      })
      return true
    } catch (error) {
      console.error("Failed to add to cart:", error)
      return false
    }
  }

  static async getCart(): Promise<any> {
    try {
      const response = await this.apiRequest('/cart')
      return response.cart || { items: [] }
    } catch (error) {
      console.error("Failed to get cart:", error)
      return { items: [] }
    }
  }

  static async updateCart(items: Array<{product_id: string, quantity: number}>): Promise<boolean> {
    try {
      await this.apiRequest('/cart/update', {
        method: 'PUT',
        body: JSON.stringify({ items })
      })
      return true
    } catch (error) {
      console.error("Failed to update cart:", error)
      return false
    }
  }

  static async clearCart(): Promise<boolean> {
    try {
      await this.apiRequest('/cart/clear', {
        method: 'DELETE'
      })
      return true
    } catch (error) {
      console.error("Failed to clear cart:", error)
      return false
    }
  }
}

function ProductCatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addItem: addToCart, items: cartItems } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  const categories = [
    { value: "all", label: "All Categories", icon: <Package className="h-4 w-4" /> },
    { value: "Microcontrollers", label: "Microcontrollers", icon: <Cpu className="h-4 w-4" /> },
    { value: "Single Board Computers", label: "Single Board Computers", icon: <Zap className="h-4 w-4" /> },
    { value: "Prototyping", label: "Prototyping", icon: <Wrench className="h-4 w-4" /> },
    { value: "Sensors", label: "Sensors", icon: <Package className="h-4 w-4" /> },
    { value: "Components", label: "Components", icon: <Package className="h-4 w-4" /> },
  ]

  useEffect(() => {
    loadProducts()
  }, [searchQuery, selectedCategory, currentPage])

  const loadProducts = async () => {
    try {
      setLoading(true)
      
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      }
      
      const { products: productsData, total } = await ProductApiService.getAllProducts(params)
      
      // Apply sorting
      let sortedProducts = [...productsData]
      switch (sortBy) {
        case "price-low":
          sortedProducts.sort((a, b) => a.price - b.price)
          break
        case "price-high":
          sortedProducts.sort((a, b) => b.price - a.price)
          break
        case "rating":
          sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))
          break
        case "name":
        default:
          sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
      }
      
      setProducts(sortedProducts)
      setTotalProducts(total)
      
      if (productsData.length === 0 && total === 0) {
        toast({
          title: "No products found",
          description: "No products are currently available in the catalog.",
        })
      }
    } catch (error) {
      console.error("Failed to load products:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products. Please try again later."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is currently out of stock."
      })
      return
    }

    try {
      // Try to add to backend cart first
      const success = await ProductApiService.addToCart(product.id, 1)
      
      if (success) {
        // Also add to local cart state for immediate UI feedback
        addToCart({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          image: product.image || product.images?.[0] || "",
          quantity: 1,
          inStock: product.inStock,
        })

        // Save to user-specific localStorage cart
        const userData = localStorage.getItem("current_user")
        if (userData) {
          try {
            const user = JSON.parse(userData)
            const userId = user.id
            const cartKey = `cart_${userId}`
            
            // Get existing cart
            const existingCart = JSON.parse(localStorage.getItem(cartKey) || "[]")
            
            // Check if item already exists
            const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id)
            
            if (existingItemIndex >= 0) {
              // Update quantity
              existingCart[existingItemIndex].quantity += 1
            } else {
              // Add new item
              existingCart.push({
                id: product.id,
                name: product.name,
                sku: product.sku,
                price: product.price,
                image: product.image || product.images?.[0] || "",
                quantity: 1,
                inStock: product.inStock,
              })
            }
            
            localStorage.setItem(cartKey, JSON.stringify(existingCart))
          } catch (error) {
            console.error("Failed to save to localStorage cart:", error)
          }
        }

        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart.`
        })
      } else {
        throw new Error("Backend add to cart failed")
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
      
      // Fallback to local cart only
      addToCart({
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        image: product.image || product.images?.[0] || "",
        quantity: 1,
        inStock: product.inStock,
      })

      // Also save to localStorage as fallback
      const userData = localStorage.getItem("current_user")
      if (userData) {
        try {
          const user = JSON.parse(userData)
          const userId = user.id
          const cartKey = `cart_${userId}`
          
          const existingCart = JSON.parse(localStorage.getItem(cartKey) || "[]")
          const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id)
          
          if (existingItemIndex >= 0) {
            existingCart[existingItemIndex].quantity += 1
          } else {
            existingCart.push({
              id: product.id,
              name: product.name,
              sku: product.sku,
              price: product.price,
              image: product.image || product.images?.[0] || "",
              quantity: 1,
              inStock: product.inStock,
            })
          }
          
          localStorage.setItem(cartKey, JSON.stringify(existingCart))
        } catch (error) {
          console.error("Failed to save to localStorage cart:", error)
        }
      }

      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`
      })
    }
  }

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} has been removed from your wishlist.`
      })
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        image: product.image || product.images?.[0] || "",
        inStock: product.inStock,
        rating: product.rating || 0,
        reviews: product.reviews || 0,
      })
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist.`
      })
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page on search
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1) // Reset to first page on category change
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    // Re-sort current products without refetching
    let sorted = [...products]
    switch (sort) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "name":
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    setProducts(sorted)
  }

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.id === productId)
  }

  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">Product Catalog</h1>
          <p className="text-slate-600">
            Discover our comprehensive range of electronic components and development boards
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, SKU..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count and Pagination Info */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-slate-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Products Grid/List */}
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {products.map((product) => (
            <Card
              key={product.id}
              className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                viewMode === "list" ? "flex flex-row" : ""
              }`}
            >
              <div className={viewMode === "list" ? "w-48 flex-shrink-0" : ""}>
                <div className="relative">
                  <img
                    src={product.images?.[0] || product.image || "/placeholder.svg?height=192&width=320"}
                    alt={product.name}
                    className={`w-full object-cover ${viewMode === "list" ? "h-32" : "h-48"} rounded-t-lg`}
                  />
                  {!product.inStock && (
                    <Badge className="absolute top-2 left-2 bg-red-500">Out of Stock</Badge>
                  )}
                  {product.stock_quantity < 20 && product.stock_quantity > 0 && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">Low Stock</Badge>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant={isInWishlist(product.id) ? "default" : "secondary"}
                      className={`h-8 w-8 p-0 ${
                        isInWishlist(product.id)
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-white hover:bg-gray-100"
                      }`}
                      onClick={() => handleWishlistToggle(product)}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-heading text-lg text-slate-900 line-clamp-2">{product.name}</CardTitle>
                      <p className="text-sm text-slate-500 mb-2">SKU: {product.sku}</p>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600">
                      {product.rating || 0} ({product.reviews || 0} reviews)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-slate-900">${product.price}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/product/${product.id}`)}>
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`${
                          isInCart(product.id) 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {isInCart(product.id) ? "In Cart" : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-slate-400 mx-auto mb-6" />
            <h2 className="font-heading font-bold text-2xl text-slate-900 mb-4">No products found</h2>
            <p className="text-slate-600 mb-8">
              {totalProducts === 0
                ? "No products are currently available in our catalog."
                : "Try adjusting your search or filter criteria"}
            </p>
            {totalProducts === 0 && (
              <Button onClick={loadProducts} variant="outline">
                Refresh Products
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductPage() {
  return (
    <ProtectedRoute>
      <ProductCatalogContent />
    </ProtectedRoute>
  )
}