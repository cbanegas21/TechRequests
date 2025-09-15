import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, BarChart3, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Tech Requests Portal</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Submit technical support requests, track progress, and manage your team's workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Submit Request</CardTitle>
            </CardHeader>
            <CardContent className="text-center flex flex-col h-full">
              <p className="text-muted-foreground mb-4 flex-grow">
                Create a new tech support request or report an issue
              </p>
              <Button asChild className="w-full mt-auto">
                <Link href="/submit">Submit Request</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <Search className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>View Board</CardTitle>
            </CardHeader>
            <CardContent className="text-center flex flex-col h-full">
              <p className="text-muted-foreground mb-4 flex-grow">Browse and manage tickets in a Kanban-style board</p>
              <Button asChild variant="outline" className="w-full mt-auto bg-transparent">
                <Link href="/board">View Board</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>KPIs & Reports</CardTitle>
            </CardHeader>
            <CardContent className="text-center flex flex-col h-full">
              <p className="text-muted-foreground mb-4 flex-grow">View team performance metrics and analytics</p>
              <Button asChild variant="outline" className="w-full mt-auto bg-transparent">
                <Link href="/kpis">View KPIs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Settings className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>Agent Mode</CardTitle>
            </CardHeader>
            <CardContent className="text-center flex flex-col h-full">
              <p className="text-muted-foreground mb-4 flex-grow">Access advanced features for Tier 2 agents</p>
              <Button asChild variant="ghost" className="w-full mt-auto">
                <Link href="/agent">Agent Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
