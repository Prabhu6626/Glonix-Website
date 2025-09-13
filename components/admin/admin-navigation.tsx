"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  FileText,
  Lightbulb,
  ShoppingBag,
  Eye,
  Settings,
  BarChart3,
  LogOut
} from "lucide-react"

interface AdminNavigationProps {
  stats?: {
    pendingOrders?: number
    newMessages?: number
    pendingEnquiries?: number
    designEnquiries?: number
    productEnquiries?: number
  }
}

export function AdminNavigation({ stats }: AdminNavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const NavItem = ({ 
    href, 
    icon: Icon, 
    children, 
    badge,
    exact = false 
  }: {
    href: string
    icon: any
    children: React.ReactNode
    badge?: number
    exact?: boolean
  }) => (
    <Button
      asChild
      variant={isActive(href, exact) ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start h-auto p-3",
        isActive(href, exact)
          ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      <Link href={href}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">{children}</span>
          </div>
          {badge && badge > 0 && (
            <Badge 
              variant="secondary" 
              className={cn(
                "ml-2 text-xs",
                isActive(href, exact)
                  ? "bg-slate-200 text-slate-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {badge}
            </Badge>
          )}
        </div>
      </Link>
    </Button>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">Glonix Admin</h2>
            <p className="text-xs text-slate-500">Electronics Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6">
        {/* Main */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Main
          </h3>
          <NavItem href="/admin" icon={LayoutDashboard} exact>
            Dashboard
          </NavItem>
          <NavItem href="/admin/analytics" icon={BarChart3}>
            Analytics
          </NavItem>
        </div>

        {/* Customer Management */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Customer Management
          </h3>
          <NavItem href="/admin/users" icon={Users}>
            All Users
          </NavItem>
          <NavItem href="/admin/visitedCustomers" icon={Eye}>
            Visited Customers
          </NavItem>
        </div>

        {/* Product & Order Management */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Products & Orders
          </h3>
          <NavItem href="/admin/products" icon={Package}>
            Products
          </NavItem>
          <NavItem href="/admin/orders" icon={ShoppingCart} badge={stats?.pendingOrders}>
            Orders
          </NavItem>
        </div>

        {/* Enquiry Management */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Enquiry Management
          </h3>
          <NavItem href="/admin/design-enquiries" icon={Lightbulb} badge={stats?.designEnquiries}>
            Design Enquiries
          </NavItem>
          <NavItem href="/admin/product-enquiries" icon={ShoppingBag} badge={stats?.productEnquiries}>
            Product Enquiries
          </NavItem>
        </div>

        {/* Communication */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Communication
          </h3>
          <NavItem href="/admin/messages" icon={MessageSquare} badge={stats?.newMessages}>
            Messages
          </NavItem>
          <NavItem href="/admin/quotes" icon={FileText}>
            Quote Requests
          </NavItem>
        </div>

        {/* System */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            System
          </h3>
          <NavItem href="/admin/settings" icon={Settings}>
            Settings
          </NavItem>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}