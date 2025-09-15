"use client"

import type React from "react"
import { AuthProvider } from "@/lib/auth"

interface SessionProviderWrapperProps {
  children: React.ReactNode
}

export function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  return <AuthProvider>{children}</AuthProvider>
}
