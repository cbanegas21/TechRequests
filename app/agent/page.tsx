"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, ShieldCheck, Eye, BarChart3, Kanban, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function AgentPage() {
  const [passcode, setPasscode] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { isAgent, isLoading, login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const success = login(passcode)
      if (success) {
        toast({
          title: "Agent Mode Activated",
          description: "You now have access to advanced features",
        })
        setTimeout(() => {
          router.push("/board")
        }, 100)
      } else {
        toast({
          title: "Invalid Passcode",
          description: "Please check your passcode and try again",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoggingIn(false)
      setPasscode("")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (isAgent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShieldCheck className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-foreground">Agent Mode Active</h1>
            </div>
            <p className="text-muted-foreground">
              You have access to all agent features and can manage tickets across the platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Kanban className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Manage Board</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">Drag and drop tickets, update statuses, and assign work</p>
                <Button asChild className="w-full">
                  <a href="/board">Go to Board</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <BarChart3 className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>View Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">Monitor team performance and SLA metrics</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a href="/kpis">View KPIs</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Eye className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Monitor Tickets</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">View all tickets with internal notes and advanced actions</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a href="/board?view=all">View All</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Agent Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>Edit all ticket fields</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>Change ticket status and priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>Assign tickets to team members</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>Add internal notes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>Link GitLab issues</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>View SLA metrics and analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Agent Access</CardTitle>
          <p className="text-muted-foreground">Enter your agent passcode to access advanced features</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="passcode">Agent Passcode</Label>
              <Input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode..."
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn || !passcode}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Agent Mode"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Agent mode provides access to:</p>
            <ul className="mt-2 space-y-1">
              <li>• Ticket management and editing</li>
              <li>• Internal notes and comments</li>
              <li>• Advanced analytics and reporting</li>
              <li>• Team performance metrics</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
