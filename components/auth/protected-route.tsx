"use client"

import type React from "react"

import { AuthGuard } from "./auth-guard"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}
