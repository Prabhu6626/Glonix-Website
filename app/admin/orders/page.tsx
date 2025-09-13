"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminApiService } from "@/lib/admin-api"
import type { Order } from "@/lib/types"
import { ShoppingCart, Search, Filter, Eye, Edit, Package, Truck, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

function OrderManagementContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [totalOrders, setTotalOrders] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [orderForm, setOrderForm] = useState({
    status: "pending" as Order["status"],
    tracking_number: "",
    notes: "",
  })

  const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const { orders: allOrders, total } = await AdminApiService.getAllOrders(0, 1000)
      setOrders(allOrders)
      setTotalOrders(total)
    } catch (error) {
      console.error("Failed to load orders:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user_email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setOrderForm({
      status: order.status,
      tracking_number: order.tracking_number || "",
      notes: order.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveOrder = async () => {
    if (!editingOrder) return

    try {
      const success = await AdminApiService.updateOrderStatus(editingOrder.id, {
        status: orderForm.status,
        tracking_number: orderForm.tracking_number,
        notes: orderForm.notes,
      })

      if (success) {
        toast({
          title: "Success",
          description: "Order updated successfully!"
        })
        await loadOrders()
        setIsEditDialogOpen(false)
        setEditingOrder(null)
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      console.error("Failed to update order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order"
      })
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "shipped":
        return "bg-cyan-100 text-cyan-800 border-cyan-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  const pendingOrders = orders.filter(o => o.status === "pending").length
  const processingOrders = orders.filter(o => ["confirmed", "processing"].includes(o.status)).length
  const shippedOrders = orders.filter(o => o.status === "shipped").length
  const totalRevenue = orders
    .filter(o => ["delivered", "completed"].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-cyan-600" />
            Order Management
          </h1>
          <p className="text-slate-600 mt-2">Track and manage customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{processingOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {orderStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No orders found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Order</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Payment</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">#{order.order_number}</div>
                          {order.tracking_number && (
                            <div className="text-sm text-slate-600">Track: {order.tracking_number}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">{order.user_name}</div>
                          <div className="text-sm text-slate-600">{order.user_email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">${order.total.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          className={
                            order.payment_status === "completed" 
                              ? "bg-green-100 text-green-800"
                              : order.payment_status === "pending"
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {order.payment_status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details - #{order.order_number}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-slate-900 mb-2">Customer Information</h4>
                                    <div className="text-sm text-slate-600 space-y-1">
                                      <div>{order.user_name}</div>
                                      <div>{order.user_email}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-slate-900 mb-2">Order Information</h4>
                                    <div className="text-sm text-slate-600 space-y-1">
                                      <div>Order: #{order.order_number}</div>
                                      <div>Date: {new Date(order.created_at).toLocaleDateString()}</div>
                                      <div>Status: {order.status}</div>
                                      <div>Payment: {order.payment_status}</div>
                                    </div>
                                  </div>
                                </div>

                                {order.items && order.items.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-slate-900 mb-2">Order Items</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                      <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                          <tr>
                                            <th className="text-left p-2">Product</th>
                                            <th className="text-left p-2">Quantity</th>
                                            <th className="text-left p-2">Price</th>
                                            <th className="text-left p-2">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {order.items.map((item, index) => (
                                            <tr key={index} className="border-t">
                                              <td className="p-2">
                                                <div>{item.product_name}</div>
                                                <div className="text-slate-500">{item.product_sku}</div>
                                              </td>
                                              <td className="p-2">{item.quantity}</td>
                                              <td className="p-2">${item.price.toFixed(2)}</td>
                                              <td className="p-2">${item.total.toFixed(2)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-center font-medium">
                                    <span>Total Amount:</span>
                                    <span className="text-lg">${order.total.toFixed(2)}</span>
                                  </div>
                                </div>

                                {order.notes && (
                                  <div>
                                    <h4 className="font-medium text-slate-900 mb-2">Notes</h4>
                                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                                      {order.notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button size="sm" variant="outline" onClick={() => handleEditOrder(order)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Order {editingOrder ? `#${editingOrder.order_number}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Order Status</Label>
              <Select
                value={orderForm.status}
                onValueChange={(value: Order["status"]) => setOrderForm({ ...orderForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status as Order["status"])}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tracking_number">Tracking Number</Label>
              <Input
                id="tracking_number"
                value={orderForm.tracking_number}
                onChange={(e) => setOrderForm({ ...orderForm, tracking_number: e.target.value })}
                placeholder="Enter tracking number"
              />
            </div>

            <div>
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                id="notes"
                value={orderForm.notes}
                onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                placeholder="Add order notes or updates..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveOrder} className="flex-1">
                Update Order
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function OrderManagementPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <OrderManagementContent />
      </AdminLayout>
    </AdminGuard>
  )
}