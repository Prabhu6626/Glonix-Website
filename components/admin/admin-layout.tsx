"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Users, Package, ShoppingCart, MessageSquare, FileText, BarChart3, Settings, Menu, Home } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

const adminNavItems = [
  {
    name: "Overview",
    href: "/admin",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: <Package className="h-5 w-5" />,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    name: "Visited Customers",
    href: "/admin/visitedCustomers",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    name: "Cart Customers",
    href: "/admin/cartCustomers",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    name: "Product Enquiry",
    href: "/admin/product-enquiries",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    name: "Design Enquiry",
    href: "/admin/design-enquiries",
    icon: <MessageSquare className="h-5 w-5" />,
  },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-cyan-400">Admin Panel</h2>
        <p className="text-sm text-slate-400 mt-1">Glonix Electronics</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <Home className="h-5 w-5" />
          Back to Site
        </Link>
      </div>
    </div>
  )
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
