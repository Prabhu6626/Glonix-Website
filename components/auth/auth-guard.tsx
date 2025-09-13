"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { user, loading, error, refreshUser, clearError, isAuthenticated } = useAuth()
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    clearError()

    try {
      await refreshUser()
      setRetryCount((prev) => prev + 1)
    } catch (error) {
      console.error("Retry failed:", error)
    } finally {
      setIsRetrying(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-600 mb-4" />
              <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">Verifying Authentication</h3>
              <p className="text-slate-600 text-center">Please wait while we verify your session...</p>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">Authentication Error</h3>
            </div>

            <Alert className="border-red-200 bg-red-50 mb-6">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button onClick={handleRetry} disabled={isRetrying} className="w-full">
                {isRetrying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={() => (window.location.href = "/login")} className="w-full">
                Go to Login
              </Button>
            </div>

            {retryCount > 0 && <p className="text-xs text-slate-500 text-center mt-4">Retry attempts: {retryCount}</p>}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center p-12">
            <div className="mx-auto w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-cyan-600" />
            </div>
            <h3 className="font-heading font-semibold text-xl text-slate-900 mb-4">Authentication Required</h3>
            <p className="text-slate-600 mb-8">You need to be logged in to access this page.</p>
            <div className="space-y-3">
              <Button onClick={() => (window.location.href = "/login")} className="w-full">
                Sign In
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/register")} className="w-full">
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
