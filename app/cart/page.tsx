"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ShoppingCart, Plus, Minus, Trash2, Heart, ArrowLeft, Package, Truck, CreditCard } from "lucide-react"
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

function CartContent() {
  const router = useRouter()
  const { items: cartItems, loading, updateQuantity, removeItem, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const moveToWishlist = (item: CartItem) => {
    // Add to wishlist
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    const wishlistItem = { ...item, quantity: undefined }

    if (!wishlist.find((w: any) => w.id === item.id)) {
      wishlist.push(wishlistItem)
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
    }

    // Remove from cart
    removeItem(item.id)
  }

  const applyPromoCode = () => {
    // Simple promo code logic
    if (promoCode.toLowerCase() === "glonix10") {
      setDiscount(0.1) // 10% discount
    } else if (promoCode.toLowerCase() === "welcome5") {
      setDiscount(0.05) // 5% discount
    } else {
      setDiscount(0)
      alert("Invalid promo code")
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = subtotal * discount
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = (subtotal - discountAmount) * 0.08 // 8% tax
  const total = subtotal - discountAmount + shipping + tax

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
          <div>
            <h1 className="font-heading font-bold text-3xl text-slate-900">Shopping Cart</h1>
            <p className="text-slate-600">{cartItems.length} items in your cart</p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-slate-400 mx-auto mb-6" />
            <h2 className="font-heading font-bold text-2xl text-slate-900 mb-4">Your cart is empty</h2>
            <p className="text-slate-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Button onClick={() => router.push("/product")} size="lg">
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                            <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                            {!item.inStock && (
                              <Badge variant="destructive" className="mt-1">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900">${item.price}</div>
                            <div className="text-sm text-slate-500">each</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="font-bold text-lg text-slate-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveToWishlist(item)}
                              className="text-slate-500 hover:text-cyan-600"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-slate-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-heading">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  {shipping > 0 && (
                    <div className="text-sm text-slate-600 bg-cyan-50 p-3 rounded-lg">
                      <Truck className="h-4 w-4 inline mr-2" />
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button onClick={applyPromoCode} variant="outline">
                      Apply
                    </Button>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Try: GLONIX10 or WELCOME5</div>
                </CardContent>
              </Card>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                onClick={() => {
                  // Reset fabrication status to 0 when proceeding to checkout
                  const userData = localStorage.getItem("current_user")
                  if (userData) {
                    try {
                      const user = JSON.parse(userData)
                      AuthService.updateFabricationStatus(user.id, 0)
                    } catch (error) {
                      console.error("Failed to reset fabrication status:", error)
                    }
                  }
                  router.push("/checkout")
                }}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Checkout
              </Button>

              {/* Security Features */}
              <div className="text-center space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Secure packaging</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Fast & reliable shipping</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  )
}
