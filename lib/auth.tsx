"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  image?: string
  isAgent: boolean
}

interface AuthContextType {
  isAgent: boolean
  isLoading: boolean
  user: User | null
  login: (email: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        import("@/lib/db").then(({ mockDb }) => {
          const currentUser = mockDb.users.find((u) => u.id === parsedUser.id)
          if (currentUser) {
            // Update stored user with latest database info
            const updatedUser = {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              image: currentUser.image,
              isAgent: currentUser.role === "agent",
            }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            setUser(updatedUser)
          } else {
            // User no longer exists, clear session
            localStorage.removeItem("user")
            setUser(null)
          }
        })
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  const isAgent = user?.isAgent || false

  const login = async (email: string): Promise<boolean> => {
    try {
      const { mockDb } = await import("@/lib/db")
      const existingUser = mockDb.users.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (existingUser) {
        const userSession = {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
          isAgent: existingUser.role === "agent",
        }

        localStorage.setItem("user", JSON.stringify(userSession))
        setUser(userSession)
        router.replace("/")
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.replace("/auth/signin")
  }

  return <AuthContext.Provider value={{ isAgent, isLoading, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
