"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Newsletter subscription:", { firstName, email })
    setEmail("")
    setFirstName("")
  }

  const footerSections = {
    information: [
      { name: "Track Your Order", href: "/track-order" },
      { name: "FAQ", href: "/faq" },
      { name: "Careers", href: "/careers" },
      { name: "Company Profile", href: "/about" },
    ],
    account: [
      { name: "My Account", href: "/dashboard" },
      { name: "Cart", href: "/cart" },
      { name: "Wishlist", href: "/wishlist" },
      { name: "Order History", href: "/orders" },
    ],
    services: [
      { name: "PCB Fabrication", href: "/fabrication" },
      { name: "PCB Assembly", href: "/assembly" },
      { name: "Component Sourcing", href: "/product" },
      { name: "Design Services", href: "/designenquiry" },
    ],
    policies: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Return Policy", href: "/returns" },
      { name: "Shipping Policy", href: "/shipping" },
    ],
  }

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-700">
        {/* <div className="container mx-auto px-4 py-12"> */}
          {/* <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">
              Stay Updated with Glonix
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Get the latest updates on new products, technical insights, and exclusive offers
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto"
            >
              <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
                required
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 px-8"
              >
                Subscribe
              </Button>
            </form>
          </div> */}
        {/* </div> */}
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <Image src="../logo.png" alt="Glonix Electronics" width={120} height={48} className="h-12 w-auto" />
            
            </div>
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Glonix Electronics Pvt. Ltd.</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Your trusted partner for comprehensive electronic solutions. From PCB fabrication to custom hardware
              development, we deliver excellence in every project.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-300">+91 78068 32035</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-300">info@glonix.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-300">Chennai, Tamil Nadu, India</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Youtube, href: "#" },
              ].map(({ icon: Icon, href }, index) => (
                <Link
                  key={index}
                  href={href}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">Information</h3>
            <ul className="space-y-3">
              {footerSections.information.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-300 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">My Account</h3>
            <ul className="space-y-3">
              {footerSections.account.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-300 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">Services</h3>
            <ul className="space-y-3">
              {footerSections.services.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-300 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">Policies</h3>
            <ul className="space-y-3">
              {footerSections.policies.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-300 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 Glonix Electronics Private Limited. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed & Developed with ❤️ for Electronics Innovation</p>
        </div>
      </div>
    </footer>
  )
}
