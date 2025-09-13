"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, Heart, ShoppingCart, Menu, ChevronDown, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { useWishlist } from "@/hooks/use-wishlist"

export function Header() {
  const { user, logout } = useAuth()
  const { itemCount: wishlistItemCount } = useWishlist()
  const router = useRouter()
  const [cartItemCount, setCartItemCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Load cart count from localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        setCartItemCount(parsedCart.length)
      } catch (err) {
        console.error("Failed to parse cart data:", err)
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/product?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Fabrication", href: "/fabrication" },
    { name: "Assembly", href: "/assembly" },
    { name: "Products", href: "/product" },
    {
      name: "Enquiry",
      href: "#",
      submenu: [
        { name: "Product Enquiry", href: "/product-enquiry" },
        { name: "Design Enquiry", href: "/designenquiry" },
      ],
    },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-cyan-800 to-cyan-700 text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>78068 32035 | Customer Support</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/orders" className="hover:text-cyan-200 transition-colors">
              My Orders
            </Link>
            <span>|</span>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 hover:text-cyan-200 transition-colors">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>Admin Dashboard</DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hover:text-cyan-200 transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="../logo.png" alt="Glonix Electronics" width={120} height={48} className="h-12 w-auto" />
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search products, SKU numbers..."
                className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 focus:border-cyan-500 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex relative"
              onClick={() => router.push("/wishlist")}
            >
              <Heart className="h-5 w-5" />
              {wishlistItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                  {wishlistItemCount}
                </Badge>
              )}
            </Button>

            <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/cart")}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-lime-500 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Mobile menu trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile search */}
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>

                  {/* Mobile navigation */}
                  <nav className="flex flex-col space-y-2">
                    {navItems.map((item) => (
                      <div key={item.name}>
                        {item.submenu ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded-md">
                              {item.name}
                              <ChevronDown className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                              {item.submenu.map((subItem) => (
                                <DropdownMenuItem key={subItem.name} asChild>
                                  <Link href={subItem.href} onClick={() => setMobileMenuOpen(false)}>
                                    {subItem.name}
                                  </Link>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Link
                            href={item.href}
                            className="block p-2 hover:bg-gray-100 rounded-md"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <div className="hidden md:block border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4">
          <nav className="flex justify-center space-x-8 py-3">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.submenu ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors">
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {item.submenu.map((subItem) => (
                        <DropdownMenuItem key={subItem.name} asChild>
                          <Link href={subItem.href}>{subItem.name}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
