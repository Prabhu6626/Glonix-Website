"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Mail, Lock, User, Building, Phone, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    company: "",
    phone: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setLoading(true)

    const result = await register({
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      company: formData.company || undefined,
      phone: formData.phone || undefined,
    })

    if (result.success) {
      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/dashboard"
      localStorage.removeItem("redirectAfterLogin")
      router.push(redirectPath)
    } else {
      setError(result.error || "Registration failed")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5" />

      <div className="w-full max-w-md relative">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-lime-500 to-lime-600 rounded-2xl flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-heading text-slate-900">Join Glonix Electronics</CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Create your account to access our services
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-slate-700 font-medium">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="pl-10 h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-700 font-medium">
                    Company
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Your company name"
                      value={formData.company}
                      onChange={handleChange}
                      className="pl-10 h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">Already have an account?</span>
                </div>
              </div>

              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-12 border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-200 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 mb-2">Join thousands of satisfied customers</p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-lime-500 rounded-full" />
              Free Account
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-cyan-500 rounded-full" />
              Instant Access
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
