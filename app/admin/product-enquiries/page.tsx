// app/admin/product-enquiries/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminGuard } from "@/components/admin/admin-guard"
import { EnquiryApiService } from "@/lib/enquiry-api"
import type { Enquiry } from "@/lib/types"
import { Package, Search, Filter, Eye, Reply, Clock, User, FileText, Send, ExternalLink, ShoppingCart } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

function AdminProductEnquiriesContent() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [filteredEnquiries, setFilteredEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEnquiries, setTotalEnquiries] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [replying, setReplying] = useState(false)

  useEffect(() => {
    loadEnquiries()
  }, [])

  useEffect(() => {
    filterEnquiries()
  }, [enquiries, searchQuery, statusFilter, priorityFilter])

  const loadEnquiries = async () => {
    try {
      setLoading(true)
      const { enquiries: allEnquiries, total } = await EnquiryApiService.getAllEnquiries(0, 1000, "product_enquiry")
      setEnquiries(allEnquiries)
      setTotalEnquiries(total)
    } catch (error) {
      console.error("Failed to load enquiries:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product enquiries"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterEnquiries = () => {
    let filtered = enquiries

    if (searchQuery) {
      filtered = filtered.filter(enquiry =>
        enquiry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enquiry.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enquiry.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enquiry.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enquiry.requirements?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(enquiry => enquiry.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(enquiry => enquiry.priority === priorityFilter)
    }

    setFilteredEnquiries(filtered)
  }

  const handleViewEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry)
    setIsViewDialogOpen(true)
  }

  const handleReplyToEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry)
    setReplyMessage("")
    setIsReplyDialogOpen(true)
  }

  const submitReply = async () => {
    if (!selectedEnquiry || !replyMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reply message"
      })
      return
    }

    setReplying(true)

    try {
      const success = await EnquiryApiService.replyToEnquiry(selectedEnquiry.id, {
        message: replyMessage.trim()
      })

      if (success) {
        toast({
          title: "Success",
          description: "Reply sent successfully"
        })
        setIsReplyDialogOpen(false)
        setReplyMessage("")
        await loadEnquiries() // Reload to get updated data
      } else {
        throw new Error("Reply failed")
      }
    } catch (error) {
      console.error("Reply error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reply"
      })
    } finally {
      setReplying(false)
    }
  }

  const updateEnquiryStatus = async (enquiryId: string, status: string) => {
    try {
      const success = await EnquiryApiService.updateEnquiryStatus(enquiryId, status)
      if (success) {
        toast({
          title: "Success",
          description: "Status updated successfully"
        })
        await loadEnquiries()
      } else {
        throw new Error("Status update failed")
      }
    } catch (error) {
      console.error("Status update error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "replied":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading product enquiries...</p>
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
            <ShoppingCart className="h-8 w-8 text-green-600" />
            Product Enquiries
          </h1>
          <p className="text-slate-600 mt-2">Manage product and component enquiries</p>
        </div>
        <Button onClick={loadEnquiries} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{totalEnquiries}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {enquiries.filter(e => e.status === "new").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {enquiries.filter(e => e.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Replied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {enquiries.filter(e => e.status === "replied").length}
            </div>
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
                placeholder="Search enquiries..."
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
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Enquiries ({filteredEnquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEnquiries.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No enquiries found</h3>
              <p className="text-slate-600">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "No product enquiries have been submitted yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Budget</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Timeline</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">{enquiry.title}</div>
                          <div className="text-sm text-slate-600 truncate max-w-xs">
                            {enquiry.abstract || "No description"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">{enquiry.user_name}</div>
                          <div className="text-sm text-slate-600">{enquiry.user_email}</div>
                          {enquiry.user_phone && (
                            <div className="text-sm text-slate-600">{enquiry.user_phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getPriorityColor(enquiry.priority || "medium")}>
                          {enquiry.priority || "medium"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {enquiry.budget ? `$${enquiry.budget}` : "Not specified"}
                      </td>
                      <td className="py-4 px-4">
                        {enquiry.timeline || "Not specified"}
                      </td>
                      <td className="py-4 px-4">
                        <Select 
                          value={enquiry.status} 
                          onValueChange={(value) => updateEnquiryStatus(enquiry.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="replied">Replied</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-600">
                          {new Date(enquiry.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(enquiry.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleViewEnquiry(enquiry)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleReplyToEnquiry(enquiry)}
                            disabled={enquiry.status === "completed" || enquiry.status === "closed"}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
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

      {/* View Enquiry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Product Enquiry Details
            </DialogTitle>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Product Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-slate-600">Product Name</Label>
                      <p className="font-medium">{selectedEnquiry.title}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Description</Label>
                      <p className="text-slate-900">{selectedEnquiry.abstract || "No description provided"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Requirements</Label>
                      <p className="text-slate-900">{selectedEnquiry.requirements || "No specific requirements"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Quantity</Label>
                      <p className="text-slate-900">{selectedEnquiry.quantity || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-slate-600">Name</Label>
                      <p className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedEnquiry.user_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Email</Label>
                      <p className="text-slate-900">{selectedEnquiry.user_email}</p>
                    </div>
                    {selectedEnquiry.user_phone && (
                      <div>
                        <Label className="text-slate-600">Phone</Label>
                        <p className="text-slate-900">{selectedEnquiry.user_phone}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-slate-600">Company</Label>
                      <p className="text-slate-900">{selectedEnquiry.company || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-slate-600">Budget</Label>
                  <p className="font-medium">
                    {selectedEnquiry.budget ? `$${selectedEnquiry.budget}` : "Not specified"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600">Timeline</Label>
                  <p className="font-medium">{selectedEnquiry.timeline || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Priority</Label>
                  <Badge className={getPriorityColor(selectedEnquiry.priority || "medium")}>
                    {selectedEnquiry.priority || "medium"}
                  </Badge>
                </div>
              </div>

              {selectedEnquiry.attachments && selectedEnquiry.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {selectedEnquiry.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-700">{file.name}</span>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Status</h3>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(selectedEnquiry.status)}>
                    {selectedEnquiry.status}
                  </Badge>
                  <div className="text-sm text-slate-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Created: {new Date(selectedEnquiry.created_at).toLocaleString()}
                  </div>
                  {selectedEnquiry.updated_at !== selectedEnquiry.created_at && (
                    <div className="text-sm text-slate-600">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Updated: {new Date(selectedEnquiry.updated_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {selectedEnquiry.replies && selectedEnquiry.replies.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Replies</h3>
                  <div className="space-y-4">
                    {selectedEnquiry.replies.map((reply, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-slate-900">Admin Reply</div>
                          <div className="text-sm text-slate-500">
                            {new Date(reply.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-slate-700">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Reply to Enquiry
            </DialogTitle>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="replyMessage">Your Reply</Label>
                <Textarea
                  id="replyMessage"
                  placeholder="Type your reply message here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="min-h-32 mt-1"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsReplyDialogOpen(false)}
                  disabled={replying}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReply}
                  disabled={replying || !replyMessage.trim()}
                >
                  {replying ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminProductEnquiriesPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminProductEnquiriesContent />
      </AdminLayout>
    </AdminGuard>
  )
}