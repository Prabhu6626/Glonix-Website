"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useRouter } from "next/navigation"
import {
  User,
  Building,
  Mail,
  Phone,
  Settings,
  Package,
  ShoppingCart,
  Heart,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Wrench,
  CreditCard,
  Truck,
  Star,
  Activity,
} from "lucide-react"

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalSpent: number
  cartItems: number
  wishlistItems: number
  recentOrders: Array<{
    id: string
    status: string
    total: number
    createdAt: string
    items: number
  }>
}

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    cartItems: 0,
    wishlistItems: 0,
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load orders from API
        const orders = await CustomerApiService.getMyOrders()
        
        // Load cart from API
        const cartData = await CustomerApiService.getCart()
        const cartItems = cartData.length
        
        // Load wishlist from localStorage (keeping this for now)
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")

        const totalOrders = orders.length
        const pendingOrders = orders.filter((o: any) =>
          ["pending", "confirmed", "processing"].includes(o.status),
        ).length
        const completedOrders = orders.filter((o: any) => o.status === "delivered").length
        const totalSpent = orders.reduce((sum: number, order: any) => sum + order.total, 0)
        const recentOrders = orders.slice(-5).reverse().map((order: any) => ({
          id: order.id,
          status: order.status,
          total: order.total,
          createdAt: order.created_at,
          items: order.items?.length || 0
        }))

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalSpent,
          cartItems,
          wishlistItems: wishlist.length,
          recentOrders,
        })
      } catch (error) {
        console.error("Failed to load dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const services = [
    {
      title: "PCB Fabrication",
      description: "Order custom PCB fabrication",
      icon: <Wrench className="h-6 w-6" />,
      path: "/fabrication",
      color: "bg-cyan-500",
    },
    {
      title: "PCB Assembly",
      description: "Professional assembly services",
      icon: <Settings className="h-6 w-6" />,
      path: "/assembly",
      color: "bg-lime-500",
    },
    {
      title: "Component Sourcing",
      description: "Source quality components",
      icon: <Package className="h-6 w-6" />,
      path: "/product",
      color: "bg-orange-500",
    },
    {
      title: "Design Enquiry",
      description: "Custom hardware development",
      icon: <FileText className="h-6 w-6" />,
      path: "/designenquiry",
      color: "bg-purple-500",
    },
  ]

  const quickActions = [
    {
      title: "Browse Products",
      description: "Explore our component catalog",
      icon: <Package className="h-5 w-5" />,
      path: "/product",
      color: "bg-blue-500",
    },
    {
      title: "View Cart",
      description: `${stats.cartItems} items in cart`,
      icon: <ShoppingCart className="h-5 w-5" />,
      path: "/cart",
      color: "bg-green-500",
    },
    {
      title: "My Wishlist",
      description: `${stats.wishlistItems} saved items`,
      icon: <Heart className="h-5 w-5" />,
      path: "/wishlist",
      color: "bg-red-500",
    },
    {
      title: "Track Orders",
      description: `${stats.pendingOrders} active orders`,
      icon: <Truck className="h-5 w-5" />,
      path: "/orders",
      color: "bg-purple-500",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "processing":
        return <Package className="h-4 w-4 text-purple-600" />
      case "shipped":
        return <Truck className="h-4 w-4 text-cyan-600" />
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-slate-600">Here's what's happening with your account today.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Orders</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Active Orders</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.pendingOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Spent</p>
                      <p className="text-2xl font-bold text-slate-900">${stats.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="font-heading font-bold text-2xl text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Card
                    key={action.title}
                    className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm"
                    onClick={() => router.push(action.path)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white`}
                        >
                          {action.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{action.title}</p>
                          <p className="text-sm text-slate-600 truncate">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading">Recent Orders</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/orders")}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {stats.recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>No orders yet</p>
                      <Button className="mt-4" onClick={() => router.push("/product")}>
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(order.status)}
                            <div>
                              <p className="font-medium text-slate-900">#{order.id}</p>
                              <p className="text-sm text-slate-600">
                                {order.items} item{order.items !== 1 ? "s" : ""} •{" "}
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>

                            </div>
                          </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">
                            ${ (order.total ?? 0).toFixed(2) }
                          </p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {order.status ?? "pending"}
                          </Badge>
                        </div>


                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Progress */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-heading">Account Progress</CardTitle>
                  <CardDescription>Complete your profile to unlock more features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Profile Completion</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-slate-600">Email verified</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-slate-600">Profile created</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-slate-600">Add phone number</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-slate-600">Complete first order</span>
                    </div>
                  </div>

                  <Button className="w-full bg-transparent" variant="outline">
                    Complete Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-2xl text-slate-900">Order Management</h2>
              <Button onClick={() => router.push("/orders")}>View All Orders</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Pending Orders</h3>
                  <p className="text-3xl font-bold text-yellow-600 mb-2">{stats.pendingOrders}</p>
                  <p className="text-sm text-slate-600">Awaiting processing</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">In Transit</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.recentOrders.filter((o) => o.status === "shipped").length}
                  </p>
                  <p className="text-sm text-slate-600">On the way</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Completed</h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">{stats.completedOrders}</p>
                  <p className="text-sm text-slate-600">Successfully delivered</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* User Profile Card */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-2xl flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="font-heading text-xl text-slate-900">{user?.full_name}</CardTitle>
                  <CardDescription className="text-slate-600">{user?.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user?.company && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-700">{user.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-700">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-700">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-700">Member since {new Date().getFullYear()}</span>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    <Star className="h-3 w-3 mr-1" />
                    Premium Member
                  </Badge>

                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="font-heading">Account Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Total Orders</span>
                          <span className="font-semibold">{stats.totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Total Spent</span>
                          <span className="font-semibold">${stats.totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Average Order</span>
                          <span className="font-semibold">
                            ${stats.totalOrders > 0 ? (stats.totalSpent / stats.totalOrders).toFixed(2) : "0.00"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Cart Items</span>
                          <span className="font-semibold">{stats.cartItems}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Wishlist Items</span>
                          <span className="font-semibold">{stats.wishlistItems}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Success Rate</span>
                          <span className="font-semibold">
                            {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="font-heading">Account Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Activity className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-slate-900">Account Created</p>
                          <p className="text-sm text-slate-600">Welcome to Glonix Electronics!</p>
                        </div>
                        <span className="text-xs text-slate-500 ml-auto">Today</span>
                      </div>
                      {stats.recentOrders.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-slate-900">Recent Order</p>
                            <p className="text-sm text-slate-600">Order #{stats.recentOrders[0].id} placed</p>
                          </div>
                          <span className="text-xs text-slate-500 ml-auto">
                            {new Date(stats.recentOrders[0].createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div>
              <h2 className="font-heading font-bold text-2xl text-slate-900 mb-6">Our Services</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {services.map((service, index) => (
                  <Card
                    key={service.title}
                    className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm"
                    onClick={() => router.push(service.path)}
                  >
                    <CardHeader className="pb-4">
                      <div
                        className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}
                      >
                        {service.icon}
                      </div>
                      <CardTitle className="font-heading text-lg text-slate-900 group-hover:text-cyan-700 transition-colors">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-600 mb-4">{service.description}</CardDescription>
                      <Button
                        variant="ghost"
                        className="w-full group-hover:bg-cyan-50 group-hover:text-cyan-700 transition-colors"
                      >
                        Access Service →
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Company Stats */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <Card className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-cyan-600 mb-2">500+</div>
                  <div className="text-slate-600">Projects Completed</div>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-lime-600 mb-2">24h</div>
                  <div className="text-slate-600">Quick Turnaround</div>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">99%</div>
                  <div className="text-slate-600">Quality Rate</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
