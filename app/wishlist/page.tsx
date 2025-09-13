"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useWishlist } from "@/hooks/use-wishlist"
import { useCart } from "@/hooks/use-cart"
import { Heart, ShoppingCart, Trash2, Star, ArrowLeft, Package } from "lucide-react"

function WishlistContent() {
  const router = useRouter()
  const { items: wishlistItems, removeItem, clearWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Small delay to ensure wishlist context is loaded
    setTimeout(() => {
      setLoading(false)
    }, 100)
  }, [])

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      sku: item.sku,
      price: item.price,
      image: item.image,
      inStock: item.inStock,
    })

    // Remove from wishlist after adding to cart
    removeItem(item.id)
  }

  const handleMoveAllToCart = () => {
    const inStockItems = wishlistItems.filter((item) => item.inStock)

    inStockItems.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.price,
        image: item.image,
        inStock: item.inStock,
      })
    })

    // Remove all in-stock items from wishlist
    inStockItems.forEach((item) => removeItem(item.id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-heading font-bold text-3xl text-slate-900">My Wishlist</h1>
              <p className="text-slate-600">{wishlistItems.length} items saved for later</p>
            </div>
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => clearWishlist()} className="bg-transparent">
                Clear All
              </Button>
              <Button
                onClick={handleMoveAllToCart}
                className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                disabled={!wishlistItems.some((item) => item.inStock)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>
            </div>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-slate-400 mx-auto mb-6" />
            <h2 className="font-heading font-bold text-2xl text-slate-900 mb-4">Your wishlist is empty</h2>
            <p className="text-slate-600 mb-8">Save items you love to your wishlist and shop them later.</p>
            <Button onClick={() => router.push("/product")} size="lg">
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card
                key={item.id}
                className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {!item.inStock && <Badge className="absolute top-2 left-2 bg-red-500">Out of Stock</Badge>}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-lg text-slate-900 line-clamp-2">{item.name}</CardTitle>
                  <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(item.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600">
                      {item.rating} ({item.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-slate-900">${item.price}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/product/${item.id}`)}>
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.inStock}
                        className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {wishlistItems.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mb-6">You might also like</h2>
            <div className="text-center py-8 text-slate-600">
              <Package className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>Personalized recommendations coming soon!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  )
}
