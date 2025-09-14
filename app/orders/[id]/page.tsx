"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { Order } from "@/lib/types"
import {
  Package,
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Phone,
  Mail,
} from "lucide-react"


function OrderDetailContent() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user-specific order from localStorage
    const loadUserOrder = () => {
      const userData = localStorage.getItem("current_user")
      if (!userData) {
        setOrder(null)
        setLoading(false)
        return
      }

      try {
        const user = JSON.parse(userData)
        const userId = user.id
        const ordersKey = `orders_${userId}`
        const storedOrders = localStorage.getItem(ordersKey)
        
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders)
          const foundOrder = parsedOrders.find((o: Order) => o.id === params.id)
          setOrder(foundOrder || null)
        } else {
          setOrder(null)
        }
      } catch (error) {
        console.error("Failed to parse orders data:", error)
        setOrder(null)
      }
      setLoading(false)
    }

    loadUserOrder()

    // Listen for storage changes (user login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "current_user") {
        loadUserOrder()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    
    // Also listen for custom events (for same-tab changes)
    const handleUserChange = () => {
      loadUserOrder()
    }

    window.addEventListener("userChanged", handleUserChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userChanged", handleUserChange)
    }
  }, [params.id])

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />
      case "confirmed":
        return <CheckCircle className="h-5 w-5" />
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-cyan-100 text-cyan-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOrderProgress = (status: Order["status"]) => {
    const steps = ["confirmed", "processing", "shipped", "delivered"]
    const currentIndex = steps.indexOf(status)
    return currentIndex >= 0 ? currentIndex + 1 : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Order not found</h3>
          <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
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
            <Button variant="ghost" onClick={() => router.push("/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
            <div>
              <h1 className="font-heading font-bold text-3xl text-slate-900">Order #{order.id}</h1>
              <p className="text-slate-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            {order.status === "shipped" && (
              <Button>
                <Truck className="h-4 w-4 mr-2" />
                Track Package
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Status</CardTitle>
                  <Badge className={`${getStatusColor(order.status)}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {order.status !== "cancelled" && (
                  <div className="space-y-4">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                      {["Confirmed", "Processing", "Shipped", "Delivered"].map((step, index) => {
                        const isActive = index < getOrderProgress(order.status)
                        const isCurrent = index === getOrderProgress(order.status) - 1

                        return (
                          <div key={step} className="flex flex-col items-center flex-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isActive
                                  ? "bg-cyan-600 text-white"
                                  : isCurrent
                                    ? "bg-cyan-100 text-cyan-600 border-2 border-cyan-600"
                                    : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              {isActive ? <CheckCircle className="h-4 w-4" /> : index + 1}
                            </div>
                            <div className={`text-sm mt-2 ${isActive ? "text-cyan-600 font-medium" : "text-gray-500"}`}>
                              {step}
                            </div>
                            {index < 3 && (
                              <div
                                className={`h-1 w-full mt-4 ${
                                  index < getOrderProgress(order.status) - 1 ? "bg-cyan-600" : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {order.tracking_number && (
                      <div className="bg-cyan-50 p-4 rounded-lg">
                        <div className="font-medium text-cyan-900">Tracking Number</div>
                        <div className="text-cyan-700">{order.tracking_number}</div>
                      </div>
                    )}

                    {order.status !== "delivered" && (
                      <div className="text-sm text-slate-600">
                        Estimated delivery: {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : 'TBD'}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Order Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item.product_id || index} className="flex gap-4 p-4 border rounded-lg">
                      <img
                        src="/placeholder.svg"
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{item.product_name}</h3>
                        <p className="text-sm text-slate-500">SKU: {item.product_sku}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-slate-600">Qty: {item.quantity}</span>
                          <span className="font-medium">${item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.shipping_address ? (
                  <div className="space-y-1">
                    <div className="font-medium">
                      {order.shipping_address.first_name} {order.shipping_address.last_name}
                    </div>
                    {order.shipping_address.company && <div>{order.shipping_address.company}</div>}
                    <div>{order.shipping_address.address1}</div>
                    {order.shipping_address.address2 && <div>{order.shipping_address.address2}</div>}
                    <div>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
                    </div>
                    {order.shipping_address.phone && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        {order.shipping_address.phone}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No shipping address available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({order.shipping_method})</span>
                  <span>${order.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="capitalize">{order.payment_method} Payment</div>
                <div className="text-sm text-slate-600 mt-1">Payment processed successfully</div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  )
}
