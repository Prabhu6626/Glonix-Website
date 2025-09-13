"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminApiService } from "@/lib/admin-api"
import type { User, UserFormData } from "@/lib/types"
import { Users, Search, Edit, UserCheck, UserX, Mail, Phone, Building, Calendar, Filter, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

function UserManagementContent() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<UserFormData>({
    full_name: "",
    email: "",
    company: "",
    phone: "",
    role: "customer",
    is_active: true,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { users: allUsers, total } = await AdminApiService.getAllUsers(0, 1000)
      setUsers(allUsers)
      setTotalUsers(total)
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.company && user.company.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      filtered = filtered.filter((user) => user.is_active === isActive)
    }

    setFilteredUsers(filtered)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      company: user.company || "",
      phone: user.phone || "",
      role: user.role,
      is_active: user.is_active,
    })
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      const success = await AdminApiService.updateUser(editingUser.id, editForm)
      if (success) {
        toast({
          title: "Success",
          description: "User updated successfully!"
        })
        await loadUsers()
        setEditingUser(null)
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user"
      })
    }
  }

  const handleToggleUserStatus = async (user: User) => {
    try {
      const success = await AdminApiService.updateUser(user.id, {
        is_active: !user.is_active,
      })
      
      if (success) {
        toast({
          title: "Success",
          description: `User ${!user.is_active ? "activated" : "deactivated"} successfully!`
        })
        await loadUsers()
      } else {
        throw new Error("Status update failed")
      }
    } catch (error) {
      console.error("Failed to update user status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user status"
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const success = await AdminApiService.deleteUser(userId)
      if (success) {
        toast({
          title: "Success",
          description: `User ${userName} deleted successfully!`
        })
        await loadUsers()
      } else {
        throw new Error("Delete failed")
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user"
      })
    }
  }

  const getRoleBadgeColor = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "staff":
        return "bg-blue-100 text-blue-800"
      case "customer":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getFabricationStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge className="bg-gray-100 text-gray-800">Not Visited</Badge>
      case 1:
        return <Badge className="bg-blue-100 text-blue-800">Visited</Badge>
      case 2:
        return <Badge className="bg-green-100 text-green-800">Cart Added</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
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
            <Users className="h-8 w-8 text-cyan-600" />
            User Management
          </h1>
          <p className="text-slate-600 mt-2">Manage registered users and their permissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{users.filter((u) => u.is_active).length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {users.filter((u) => u.role === "customer").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{users.filter((u) => u.role === "admin").length}</div>
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
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No users found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Fabrication</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">{user.full_name}</div>
                          <div className="text-sm text-slate-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.company && (
                            <div className="text-sm text-slate-600 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {user.company}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {user.phone && (
                          <div className="text-sm text-slate-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusBadgeColor(user.is_active)}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {getFabricationStatusBadge(user.fabrication_status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="full_name">Full Name</Label>
                                  <Input
                                    id="full_name"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="email">Email</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="company">Company</Label>
                                  <Input
                                    id="company"
                                    value={editForm.company}
                                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="phone">Phone</Label>
                                  <Input
                                    id="phone"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="role">Role</Label>
                                  <Select
                                    value={editForm.role}
                                    onValueChange={(value: User["role"]) => setEditForm({ ...editForm, role: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="customer">Customer</SelectItem>
                                      <SelectItem value="staff">Staff</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={editForm.is_active}
                                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                    className="rounded"
                                  />
                                  <Label htmlFor="is_active">Active User</Label>
                                </div>
                                <div className="flex gap-2 pt-4">
                                  <Button onClick={handleSaveUser} className="flex-1">
                                    Save Changes
                                  </Button>
                                  <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant={user.is_active ? "destructive" : "default"}>
                                {user.is_active ? (
                                  <>
                                    <UserX className="h-3 w-3 mr-1" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{user.is_active ? "Deactivate" : "Activate"} User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to {user.is_active ? "deactivate" : "activate"} {user.full_name}
                                  ?{user.is_active && " This will prevent them from accessing their account."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleToggleUserStatus(user)}>
                                  {user.is_active ? "Deactivate" : "Activate"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {user.role !== "admin" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.full_name}? This action cannot be undone and will permanently remove all user data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteUser(user.id, user.full_name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
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
    </div>
  )
}

export default function UserManagementPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <UserManagementContent />
      </AdminLayout>
    </AdminGuard>
  )
}