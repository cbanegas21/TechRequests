"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Shield, ShieldCheck, Loader2, User, LogIn, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { SettingsGearIcon } from "@/components/settings-gear-icon"
import { useAuth } from "@/lib/auth"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAgent, isLoading, user, logout } = useAuth()

  const navItems = [
    { href: "/submit", label: "Submit" },
    { href: "/board", label: "Board" },
    { href: "/activity", label: "Activity" },
    { href: "/kpis", label: "KPIs" },
  ]

  const handleSignIn = () => {
    router.push("/auth/signin")
  }

  const handleSignOut = () => {
    logout()
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleSettingsNavigation = () => {
    router.push("/settings")
  }

  const handleUserManagement = () => {
    router.push("/admin/users")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TR</span>
            </div>
            <span className="font-bold text-lg">Tech Requests</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-foreground border-b-2 border-primary pb-1" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Profile and Theme Toggle */}
          <div className="flex items-center space-x-3">
            <SettingsGearIcon />
            <ThemeToggle />

            {isLoading ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </Badge>
            ) : user ? (
              <div className="flex items-center space-x-2">
                <Badge variant={isAgent ? "default" : "secondary"} className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {isAgent ? "ADMIN" : "CSP"}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.name ? getInitials(user.name) : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.name && <p className="font-medium">{user.name}</p>}
                        {user.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSettingsNavigation}>Settings</DropdownMenuItem>
                    {isAgent && (
                      <DropdownMenuItem onClick={handleUserManagement}>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Public Mode
                </Badge>
                <Button variant="outline" size="sm" onClick={handleSignIn}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
