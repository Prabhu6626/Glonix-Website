"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import type { Product } from "@/lib/types"
import { ShoppingCart, Heart, Star, Package, Truck, Shield, RefreshCw, Plus, Minus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { AuthService } from "@/lib/auth"

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

  // Update user fabrication status when viewing product
  static async updateFabricationStatus(userId: string, status: 1 | 2): Promise<void> {
    try {
      await this.apiRequest('/auth/fabrication-status', {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId, status }),
      })
    } catch (error) {
      console.error("Failed to update fabrication status:", error)
    }
  }
}

function ProductDetailContent() {
  const router = useRouter()
  const params = useParams()
  const { addItem: addToCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    loadCurrentUser()
    fetchProduct()
  }, [params.id])

  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      console.error("Failed to load current user:", error)
    }
  }

  const fetchProduct = async () => {
    try {
      setLoading(true)
      
      const productData = await ProductApiService.getProductById(params.id as string)
      
      if (productData) {
        setProduct(productData)
        
        // Update fabrication status to "visited" (1) when user views product
        if (currentUser?.id) {
          await ProductApiService.updateFabricationStatus(currentUser.id, 1)
        }
      } else {
        toast({
          variant: "destructive",
          title: "Product not found",
          description: "The requested product could not be found."
        })
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product details. Please try again later."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    if (!product.inStock || product.stock_quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is currently out of stock."
      })
      return
    }

    if (quantity > product.stock_quantity) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Only ${product.stock_quantity} items available.`
      })
      return
    }

    addToCart({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image: product.image,
      quantity: quantity,
      inStock: product.inStock,
    })

    // Update fabrication status to "added to cart" (2)
    if (currentUser?.id) {
      await ProductApiService.updateFabricationStatus(currentUser.id, 2)
    }

    toast({
      title: "Added to Cart",
      description: `${quantity} × ${product.name} added to your cart.`
    })
  }

  const handleWishlistToggle = () => {
    if (!product) return

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} removed from your wishlist.`
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
        description: `${product.name} added to your wishlist.`
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Product not found</h3>
          <p className="text-slate-600 mb-4">The requested product could not be found in our catalog.</p>
          <Button onClick={() => router.push("/product")}>Back to Catalog</Button>
        </div>
      </div>
    )
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
    ? [product.image] 
    : ["/placeholder.svg"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
          <button onClick={() => router.push("/product")} className="hover:text-cyan-600 transition-colors">
            Products
          </button>
          <span>/</span>
          <span className="text-slate-900">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={productImages[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? "border-cyan-500" : "border-gray-200"}`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">{product.name}</h1>
              <p className="text-slate-600 mb-4">SKU: {product.sku}</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-slate-600">
                  {product.rating || 0} ({product.reviews || 0} reviews)
                </span>
              </div>

              <div className="text-3xl font-bold text-slate-900 mb-4">${product.price}</div>

              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock && product.stock_quantity > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">
                    In Stock ({product.stock_quantity} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium text-slate-900">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || product.stock_quantity <= 0}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleWishlistToggle}
                  className={isInWishlist(product.id) ? "text-red-600 border-red-600" : ""}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-slate-600">Free shipping over $50</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-slate-600">1 year warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-slate-600">30-day returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-slate-600">Secure packaging</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Product Description</h3>
              <p className="text-slate-600 leading-relaxed">
                {product.long_description || product.description || "Detailed product description not available."}
              </p>
            </TabsContent>

            <TabsContent value="specifications" className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Technical Specifications</h3>
              {Object.keys(product.specifications || {}).length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-slate-200">
                      <span className="font-medium text-slate-900">{key}:</span>
                      <span className="text-slate-600">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">Specifications not available for this product.</p>
              )}
            </TabsContent>

            <TabsContent value="features" className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Key Features</h3>
              {product.features && product.features.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">Feature list not available for this product.</p>
              )}
            </TabsContent>

            <TabsContent value="applications" className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Applications</h3>
              {product.applications && product.applications.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {product.applications.map((application, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-lime-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-600">{application}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">Applications list not available for this product.</p>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  return (
    <ProtectedRoute>
      <ProductDetailContent />
    </ProtectedRoute>
  )
}