"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AuthService } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Clock, X } from "lucide-react"

export function SessionMonitor() {
  const { user, logout } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!user) return

    const checkSession = () => {
      const sessionDuration = AuthService.getSessionDuration()
      const maxSessionDuration = 24 * 60 * 60 * 1000 // 24 hours
      const warningThreshold = 30 * 60 * 1000 // 30 minutes before expiry

      const remaining = maxSessionDuration - sessionDuration

      if (remaining <= 0) {
        // Session expired
        logout()
        return
      }

      if (remaining <= warningThreshold) {
        setShowWarning(true)
        setTimeLeft(Math.floor(remaining / 1000 / 60)) // minutes
      } else {
        setShowWarning(false)
      }
    }

    // Check immediately
    checkSession()

    // Check every minute
    const interval = setInterval(checkSession, 60 * 1000)

    return () => clearInterval(interval)
  }, [user, logout])

  if (!showWarning || !user) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-orange-200 bg-orange-50 shadow-lg">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 pr-8">
          <div className="font-medium mb-1">Session Expiring Soon</div>
          <div className="text-sm">
            Your session will expire in {timeLeft} minutes.
            <Button
              variant="link"
              className="p-0 h-auto text-orange-800 underline ml-1"
              onClick={() => window.location.reload()}
            >
              Refresh to extend
            </Button>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
          onClick={() => setShowWarning(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </Alert>
    </div>
  )
}
