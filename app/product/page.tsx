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

// API Service for fetching products
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

  static async getAllProducts(): Promise<Product[]> {
    try {
      const response = await this.apiRequest('/admin/products?skip=0&limit=1000')
      return response.products || []
    } catch (error) {
      console.error("Failed to get products:", error)
      return []
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const products = await this.getAllProducts()
      return products.find(p => p.id === id) || null
    } catch (error) {
      console.error("Failed to get product:", error)
      return null
    }
  }
}
  static async updateFabricationStatus(userId: string, status: 1 | 2): Promise<boolean> {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addItem: addToCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)

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
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedCategory, sortBy])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await CustomerApiService.getProducts()
      setProducts(productsData)
      setFilteredProducts(productsData)
      return true
      
      if (productsData.length === 0) {
        toast({
          title: "No products found",
          description: "Please contact admin to add products to the catalog.",
        })
      }
    } catch (error) {
      console.error("Failed to load products:", error)
      return false
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products. Please try again later."
      })
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
  }

  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is currently out of stock."
      })
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image: product.image,
      inStock: product.inStock,
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`
    })
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
        image: product.image,
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
              <Select value={sortBy} onValueChange={setSortBy}>
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {filteredProducts.map((product) => (
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
                        className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600">
              {products.length === 0
                ? "No products have been added yet. Admin can add products from the admin dashboard."
                : "Try adjusting your search or filter criteria"}
            </p>
            {products.length === 0 && (
              <Button onClick={loadProducts} className="mt-4">
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