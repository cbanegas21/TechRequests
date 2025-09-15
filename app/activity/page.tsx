"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActivityFeedItem } from "@/components/activity-feed-item"
import { ActivityFeedFilters } from "@/components/activity-feed-filters"
import { Activity, RefreshCw, TrendingUp, MessageSquare, FileText, Users, Clock } from "lucide-react"
import { mockDb } from "@/lib/db"

interface ActivityItem {
  id: string
  type:
    | "comment"
    | "ticket_created"
    | "status_changed"
    | "assigned"
    | "file_upload"
    | "gitlab_submission"
    | "priority_changed"
    | "due_date_changed"
  ticketId: string
  ticketTitle: string
  actor: {
    name: string
    email: string
    image?: string
    role: "agent" | "csp"
  }
  details: any
  createdAt: Date
}

interface ActivityFilters {
  search: string
  activityType: string
  userRole: string
  dateRange: {
    from?: Date
    to?: Date
  }
  ticketId: string
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<ActivityFilters>({
    search: "",
    activityType: "all",
    userRole: "all",
    dateRange: {},
    ticketId: "",
  })

  // Generate mock activity data from audit logs and comments
  const generateActivities = (): ActivityItem[] => {
    const activityItems: ActivityItem[] = []

    // Add audit log activities
    mockDb.auditLogs.forEach((log) => {
      const ticket = mockDb.tickets.find((t) => t.id === log.ticketId)
      const actor = mockDb.users.find((u) => u.id === log.actorUserId)

      if (ticket && actor) {
        let activityType: ActivityItem["type"] = "status_changed"
        let details: any = {}

        switch (log.action) {
          case "ticket_created":
            activityType = "ticket_created"
            break
          case "status_changed":
            activityType = "status_changed"
            details = { from: log.fromValue, to: log.toValue }
            break
          case "assigned":
            activityType = "assigned"
            const assignee = mockDb.users.find((u) => u.id === log.toValue)
            details = { assigneeName: assignee?.name || "Unknown" }
            break
          case "priority_changed":
            activityType = "priority_changed"
            details = { from: log.fromValue, to: log.toValue }
            break
        }

        activityItems.push({
          id: log.id,
          type: activityType,
          ticketId: ticket.shortId,
          ticketTitle: ticket.title,
          actor: {
            name: actor.name,
            email: actor.email,
            image: actor.image,
            role: actor.role,
          },
          details,
          createdAt: log.createdAt,
        })
      }
    })

    // Add comment activities
    mockDb.comments.forEach((comment) => {
      const ticket = mockDb.tickets.find((t) => t.id === comment.ticketId)
      const actor = mockDb.users.find((u) => u.id === comment.authorUserId)

      if (ticket && actor) {
        activityItems.push({
          id: comment.id,
          type: "comment",
          ticketId: ticket.shortId,
          ticketTitle: ticket.title,
          actor: {
            name: actor.name,
            email: actor.email,
            image: actor.image,
            role: actor.role,
          },
          details: {
            isInternal: comment.isInternal,
            preview: comment.body.slice(0, 100) + (comment.body.length > 100 ? "..." : ""),
          },
          createdAt: comment.createdAt,
        })
      }
    })

    // Sort by creation date (newest first)
    return activityItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Filter activities based on current filters
  const filterActivities = (activities: ActivityItem[], filters: ActivityFilters): ActivityItem[] => {
    return activities.filter((activity) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          activity.actor.name.toLowerCase().includes(searchLower) ||
          activity.ticketTitle.toLowerCase().includes(searchLower) ||
          activity.ticketId.toLowerCase().includes(searchLower) ||
          (activity.details.preview && activity.details.preview.toLowerCase().includes(searchLower))

        if (!matchesSearch) return false
      }

      // Activity type filter
      if (filters.activityType !== "all" && activity.type !== filters.activityType) {
        return false
      }

      // User role filter
      if (filters.userRole !== "all" && activity.actor.role !== filters.userRole) {
        return false
      }

      // Ticket ID filter
      if (filters.ticketId && !activity.ticketId.toLowerCase().includes(filters.ticketId.toLowerCase())) {
        return false
      }

      // Date range filter
      if (filters.dateRange.from && activity.createdAt < filters.dateRange.from) {
        return false
      }
      if (filters.dateRange.to && activity.createdAt > filters.dateRange.to) {
        return false
      }

      return true
    })
  }

  // Load activities
  const loadActivities = () => {
    setIsLoading(true)
    setTimeout(() => {
      const newActivities = generateActivities()
      setActivities(newActivities)
      setFilteredActivities(filterActivities(newActivities, filters))
      setIsLoading(false)
    }, 500)
  }

  // Update filtered activities when filters change
  useEffect(() => {
    setFilteredActivities(filterActivities(activities, filters))
  }, [activities, filters])

  // Initial load
  useEffect(() => {
    loadActivities()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadActivities, 30000)
    return () => clearInterval(interval)
  }, [])

  const clearFilters = () => {
    setFilters({
      search: "",
      activityType: "all",
      userRole: "all",
      dateRange: {},
      ticketId: "",
    })
  }

  // Calculate stats
  const stats = {
    total: filteredActivities.length,
    comments: filteredActivities.filter((a) => a.type === "comment").length,
    tickets: filteredActivities.filter((a) => a.type === "ticket_created").length,
    agents: new Set(filteredActivities.filter((a) => a.actor.role === "agent").map((a) => a.actor.email)).size,
    today: filteredActivities.filter((a) => {
      const today = new Date()
      const activityDate = new Date(a.createdAt)
      return activityDate.toDateString() === today.toDateString()
    }).length,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Activity Feed
            </h1>
            <p className="text-muted-foreground">
              Real-time activity tracking across all tech requests and system interactions.
            </p>
          </div>
          <Button onClick={loadActivities} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.today} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.comments}</div>
            <p className="text-xs text-muted-foreground">User interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Tickets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tickets}</div>
            <p className="text-xs text-muted-foreground">Tickets created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agents}</div>
            <p className="text-xs text-muted-foreground">Contributing agents</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ActivityFeedFilters filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading activities...
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activities found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {activities.length === 0
                  ? "No activities have been recorded yet."
                  : "Try adjusting your filters to see more activities."}
              </p>
              {activities.length > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredActivities.length} of {activities.length} activities
              </p>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Auto-refresh: 30s
              </Badge>
            </div>

            {filteredActivities.map((activity) => (
              <ActivityFeedItem key={activity.id} activity={activity} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
