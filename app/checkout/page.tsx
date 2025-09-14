"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { AuthService } from "@/lib/auth"
import { CreditCard, Truck, Shield, ArrowLeft, Package, MapPin } from "lucide-react"

interface CartItem {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  image: string
}

interface ShippingAddress {
  firstName: string
  lastName: string
  company: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

interface BillingAddress extends ShippingAddress {}

function CheckoutContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
  })

  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
  })

  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")

  // Payment form
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState("")

  useEffect(() => {
    // Load user-specific cart from localStorage
    const loadUserCart = () => {
      const userData = localStorage.getItem("current_user")
      console.log("Checkout loading - userData:", userData)
      
      if (!userData) {
        console.log("No user data found, clearing cart")
        setCartItems([])
        setLoading(false)
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
            setCartItems(parsedCart)
          } else if (parsedCart && typeof parsedCart === 'object') {
            // Convert single quotation object to cart item format
            const cartItem: CartItem = {
              id: parsedCart.order_id || `quotation-${Date.now()}`,
              name: `PCB Fabrication - ${parsedCart.Layers} layers`,
              sku: `PCB-${parsedCart.Layers}-${parsedCart.Thickness}`,
              price: parseFloat(parsedCart.price) || 0,
              image: parsedCart.File_Url || "/placeholder-pcb.png",
              quantity: 1
            }
            console.log("Converting single object to cart item:", cartItem)
            setCartItems([cartItem])
          }
        } else {
          console.log("No stored cart found for user")
          setCartItems([])
        }
      } catch (error) {
        console.error("Failed to parse user or cart data:", error)
        setCartItems([])
      }
      
      setLoading(false)
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = shippingMethod === "express" ? 19.99 : shippingMethod === "overnight" ? 39.99 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  const handlePlaceOrder = async () => {
    setProcessing(true)

    try {
      // Simulate order processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create order object with proper structure matching Order interface
      const order = {
        id: `order-${Date.now()}`,
        order_number: `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        user_id: user?.id || "",
        user_name: user?.full_name || "",
        user_email: user?.email || "",
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        shipping_address: {
          first_name: shippingAddress.firstName,
          last_name: shippingAddress.lastName,
          company: shippingAddress.company || "",
          address1: shippingAddress.address1,
          address2: shippingAddress.address2 || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip_code: shippingAddress.zipCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone || ""
        },
        billing_address: sameAsShipping ? {
          first_name: shippingAddress.firstName,
          last_name: shippingAddress.lastName,
          company: shippingAddress.company || "",
          address1: shippingAddress.address1,
          address2: shippingAddress.address2 || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip_code: shippingAddress.zipCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone || ""
        } : {
          first_name: billingAddress.firstName,
          last_name: billingAddress.lastName,
          company: billingAddress.company || "",
          address1: billingAddress.address1,
          address2: billingAddress.address2 || "",
          city: billingAddress.city,
          state: billingAddress.state,
          zip_code: billingAddress.zipCode,
          country: billingAddress.country,
          phone: billingAddress.phone || ""
        },
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        subtotal,
        shipping_cost: shippingCost,
        tax,
        total,
        status: "confirmed" as const,
        payment_status: "completed" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      // Save order to user-specific localStorage and clear cart
      const userData = localStorage.getItem("current_user")
      if (userData) {
        try {
          const user = JSON.parse(userData)
          const userId = user.id
          const ordersKey = `orders_${userId}`
          const cartKey = `cart_${userId}`
          
          // Get existing user orders
          const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]")
          existingOrders.push(order)
          localStorage.setItem(ordersKey, JSON.stringify(existingOrders))
          
          // Also save to global orders for admin view
          const globalOrders = JSON.parse(localStorage.getItem("orders") || "[]")
          globalOrders.push(order)
          localStorage.setItem("orders", JSON.stringify(globalOrders))
          
          // Clear user-specific cart
          localStorage.removeItem(cartKey)
          
          // Reset fabrication status to 0 (completed checkout)
          AuthService.updateFabricationStatus(userId, 0)
          
          console.log("Order saved and cart cleared for user:", userId)
        } catch (error) {
          console.error("Failed to save order or clear cart:", error)
        }
      }

      // Redirect to order confirmation
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Order processing failed:", error)
      alert("Order processing failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h3>
          <Button onClick={() => router.push("/product")}>Continue Shopping</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push("/cart")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <div>
            <h1 className="font-heading font-bold text-3xl text-slate-900">Checkout</h1>
            <p className="text-slate-600">Complete your order</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={shippingAddress.firstName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={shippingAddress.company}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, company: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="address1">Address Line 1 *</Label>
                  <Input
                    id="address1"
                    value={shippingAddress.address1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                  <Input
                    id="address2"
                    value={shippingAddress.address2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">Standard Shipping</div>
                          <div className="text-sm text-slate-600">5-7 business days</div>
                        </div>
                        <div className="font-medium">$9.99</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">Express Shipping</div>
                          <div className="text-sm text-slate-600">2-3 business days</div>
                        </div>
                        <div className="font-medium">$19.99</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="overnight" id="overnight" />
                    <Label htmlFor="overnight" className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">Overnight Shipping</div>
                          <div className="text-sm text-slate-600">Next business day</div>
                        </div>
                        <div className="font-medium">$39.99</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
           
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name}</div>
                        <div className="text-xs text-slate-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
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
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                  onClick={handlePlaceOrder}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <div className="text-xs text-slate-500 text-center">
                  Your payment information is secure and encrypted
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  )
}
