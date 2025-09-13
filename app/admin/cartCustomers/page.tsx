"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminGuard } from "@/components/admin/admin-guard"
import { getUsersByFabricationStatus, updateUser } from "@/lib/admin-utils"
import type { User } from "@/lib/types"
import { ShoppingBag, Search, Mail, Phone, Building, Calendar, ArrowLeft, DollarSign } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

function CartCustomersContent() {
  const [customers, setCustomers] = useState<User[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchQuery])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      // Get users with fabrication_status = 2 (added to cart)
      const cartUsers = await getUsersByFabricationStatus(2)
      setCustomers(cartUsers)
    } catch (error) {
      console.error("Failed to load cart customers:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cart customers"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    if (!searchQuery) {
      setFilteredCustomers(customers)
      return
    }

    const filtered = customers.filter(customer =>
      customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredCustomers(filtered)
  }

  const moveToVisitedCustomers = async (customerId: string) => {
    try {
      const success = await updateUser(customerId, { fabrication_status: 1 })
      if (success) {
        toast({
          title: "Success",
          description: "Customer moved back to visited customers"
        })
        loadCustomers() // Reload the list
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      console.error("Failed to update customer status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update customer status"
      })
    }
  }

  const resetCustomerStatus = async (customerId: string) => {
    try {
      const success = await updateUser(customerId, { fabrication_status: 0 })
      if (success) {
        toast({
          title: "Success",
          description: "Customer status reset to new"
        })
        loadCustomers() // Reload the list
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      console.error("Failed to reset customer status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset customer status"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading cart customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-green-600" />
            Cart Customers
          </h1>
          <p className="text-slate-600 mt-2">
            Customers who have added fabrication services to their cart (Status: 2)
          </p>
        </div>
        <Button onClick={loadCustomers} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total in Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{customers.length}</div>
            <p className="text-xs text-green-600 mt-1">Ready to purchase</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">With Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {customers.filter(c => c.company).length}
            </div>
            <p className="text-xs text-blue-600 mt-1">Business customers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {customers.filter(c => {
                const createdDate = new Date(c.created_at)
                const now = new Date()
                return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-purple-600 mt-1">New this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {customers.length > 0 ? '100%' : '0%'}
            </div>
            <p className="text-xs text-orange-600 mt-1">Visited → Cart</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>Cart Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {searchQuery ? "No customers found" : "No cart customers"}
              </h3>
              <p className="text-slate-600">
                {searchQuery ? "Try adjusting your search criteria" : "Customers who add items to cart will appear here"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-lg transition-shadow border-green-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">{customer.full_name}</h3>
                        <Badge className="bg-green-100 text-green-800">In Cart</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{customer.email}</span>
                        </div>

                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="h-4 w-4" />
                            <span>{customer.phone}</span>
                          </div>
                        )}

                        {customer.company && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Building className="h-4 w-4" />
                            <span className="truncate">{customer.company}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 space-y-2">
                        <Button
                          onClick={() => moveToVisitedCustomers(customer.id)}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Move to Visited
                        </Button>

                        <Button
                          onClick={() => resetCustomerStatus(customer.id)}
                          variant="outline"
                          className="w-full text-slate-600"
                          size="sm"
                        >
                          Reset Status
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* High-Value Customers Alert */}
      {customers.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Sales Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              You have {customers.length} customers with items in their cart. These are high-intent prospects 
              ready to make a purchase. Consider reaching out to them to complete their orders.
            </p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Send Follow-up Emails
              </Button>
              <Button size="sm" variant="outline">
                Export Customer List
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function CartCustomersPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <CartCustomersContent />
      </AdminLayout>
    </AdminGuard>
  )
}