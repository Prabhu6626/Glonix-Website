"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminGuard } from "@/components/admin/admin-guard"
import { Package, Search, Filter, Eye, Edit, Truck, CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface OrderItem {
  product_id: string
  product_name: string
  product_sku: string
  price: number
  quantity: number
  total: number
}

interface Order {
  id: string
  order_number: string
  user_id: string
  user_name: string
  user_email: string
  items: OrderItem[]
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  total: number
  subtotal?: number
  shipping_cost?: number
  tax?: number
  created_at: string
  updated_at?: string
  tracking_number?: string
  shipping_address?: any
  billing_address?: any
  notes?: string
}

// Admin Orders API Service
class AdminOrdersApiService {
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

  static async getAllOrders(params: {
    skip?: number,
    limit?: number,
    status?: string
  } = {}): Promise<{orders: Order[], total: number}> {
    try {
      const queryParams = new URLSearchParams()
      if (params.skip) queryParams.append('skip', params.skip.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.status) queryParams.append('status', params.status)
      
      const endpoint = `/admin/orders?${queryParams.toString()}`
      const response = await this.apiRequest(endpoint)
      
      return {
        orders: response.orders || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error("Failed to get orders:", error)
      return { orders: [], total: 0 }
    }
  }

  static async updateOrder(orderId: string, updateData: {
    status?: string,
    tracking_number?: string,
    notes?: string
  }): Promise<boolean> {
    try {
      await this.apiRequest(`/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
      return true
    } catch (error) {
      console.error("Failed to update order:", error)
      return false
    }
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await this.apiRequest(`/orders/${orderId}`)
      return response.order || null
    } catch (error) {
      console.error("Failed to get order:", error)
      return null
    }
  }
}

function OrdersManagementContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [totalOrders, setTotalOrders] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [orderUpdate, setOrderUpdate] = useState({
    status: "",
    tracking_number: "",
    notes: ""
  })

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
    { value: "processing", label: "Processing", color: "bg-purple-100 text-purple-800" },
    { value: "shipped", label: "Shipped", color: "bg-cyan-100 text-cyan-800" },
    { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" }
  ]

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const { orders: ordersData, total } = await AdminOrdersApiService.getAllOrders({ skip: 0, limit: 1000 })
      setOrders(ordersData)
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
          order.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await AdminOrdersApiService.getOrderById(orderId)
      if (order) {
        setSelectedOrder(order as Order)
        setIsViewDialogOpen(true)
      }
    } catch (error) {
      console.error("Failed to load order details:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details"
      })
    }
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setOrderUpdate({
      status: order.status,
      tracking_number: order.tracking_number || "",
      notes: order.notes || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateOrder = async () => {
    if (!editingOrder) return

    try {
      const success = await AdminOrdersApiService.updateOrder(editingOrder.id, orderUpdate)
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

  const getStatusIcon = (status: string) => {
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
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
  const deliveredOrders = orders.filter(o => o.status === "delivered").length
  const totalRevenue = orders.filter(o => ["delivered", "shipped"].includes(o.status)).reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-cyan-600" />
            Orders Management
          </h1>
          <p className="text-slate-600 mt-2">View and manage customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
            <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
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
            <CardTitle className="text-sm font-medium text-green-700">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{deliveredOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">${totalRevenue.toFixed(0)}</div>
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
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
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
              <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
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
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Payment</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">{order.order_number}</div>
                          <div className="text-sm text-slate-600">#{order.id.substring(0, 8)}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">{order.user_name}</div>
                          <div className="text-sm text-slate-600">{order.user_email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">{formatDate(order.created_at)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">{order.items?.length || 0} items</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">${order.total.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusColor(order.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={
                          order.payment_status === "paid" ? "bg-green-100 text-green-800" :
                          order.payment_status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditOrder(order)}
                          >
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

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="font-medium">Order ID:</span> {selectedOrder.id}</div>
                    <div><span className="font-medium">Order Number:</span> {selectedOrder.order_number}</div>
                    <div><span className="font-medium">Date:</span> {formatDate(selectedOrder.created_at)}</div>
                    <div><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedOrder.user_name}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.user_email}</div>
                    <div><span className="font-medium">Customer ID:</span> {selectedOrder.user_id}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-slate-600">SKU: {item.product_sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.total.toFixed(2)}</div>
                          <div className="text-sm text-slate-600">{item.quantity} × ${item.price.toFixed(2)}</div>
                        </div>
                      </div>
                    )) || <p>No items found</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.subtotal?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${selectedOrder.shipping_cost?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedOrder.tax?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Order - {editingOrder?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={orderUpdate.status}
                onValueChange={(value) => setOrderUpdate({...orderUpdate, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tracking_number">Tracking Number</Label>
              <Input
                id="tracking_number"
                value={orderUpdate.tracking_number}
                onChange={(e) => setOrderUpdate({...orderUpdate, tracking_number: e.target.value})}
                placeholder="Enter tracking number"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={orderUpdate.notes}
                onChange={(e) => setOrderUpdate({...orderUpdate, notes: e.target.value})}
                placeholder="Add order notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateOrder} className="flex-1">
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

export default function OrdersManagementPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <OrdersManagementContent />
      </AdminLayout>
    </AdminGuard>
  )
}