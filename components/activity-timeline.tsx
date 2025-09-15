"use client"

import { formatDistanceToNow } from "date-fns"
import { User, GitBranch, AlertTriangle, CheckCircle, Clock, ArrowRight, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"

interface TimelineItem {
  id: string
  type: "comment" | "audit"
  createdAt: string
  author?: {
    id: string
    name: string
    role: string
    image?: string
  } | null
  authorName?: string | null
  body?: string
  isInternal?: boolean
  action?: string
  fromValue?: string | null
  toValue?: string | null
}

interface ActivityTimelineProps {
  items: TimelineItem[]
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  const { isAgent } = useAuth()

  const getActionIcon = (action: string) => {
    switch (action) {
      case "ticket_created":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "status_changed":
        return <ArrowRight className="h-4 w-4 text-blue-600" />
      case "assigned":
        return <User className="h-4 w-4 text-purple-600" />
      case "escalated":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "gitlab_linked":
        return <GitBranch className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionDescription = (item: TimelineItem) => {
    switch (item.action) {
      case "ticket_created":
        return "created this ticket"
      case "status_changed":
        return `changed status from ${item.fromValue || "unknown"} to ${item.toValue}`
      case "assigned":
        return `assigned this ticket`
      case "escalated":
        return "escalated this ticket"
      case "gitlab_linked":
        return "linked GitLab issue"
      default:
        return item.action || "performed an action"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Filter out internal comments if not an agent
  const filteredItems = items.filter((item) => {
    if (item.type === "comment" && item.isInternal && !isAgent) {
      return false
    }
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
          ) : (
            filteredItems.map((item, index) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {item.type === "comment" ? (
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.author?.image || ""} alt={item.author?.name || item.authorName || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                          {item.author?.name
                            ? getInitials(item.author.name)
                            : item.authorName
                              ? getInitials(item.authorName)
                              : "U"}
                        </AvatarFallback>
                      </Avatar>
                      {item.isInternal && (
                        <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-0.5">
                          <Shield className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {getActionIcon(item.action || "")}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium">{item.author?.name || item.authorName || "System"}</span>
                    {item.author?.role && (
                      <Badge variant={item.author.role === "agent" ? "default" : "outline"} className="text-xs">
                        {item.author.role === "agent" ? "Agent" : "CSP"}
                      </Badge>
                    )}
                    {item.isInternal && (
                      <Badge
                        variant="outline"
                        className="text-xs text-orange-700 border-orange-200 bg-orange-50 dark:bg-orange-900/20"
                      >
                        Internal
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {item.type === "comment" ? (
                    <div
                      className={`text-sm whitespace-pre-wrap p-3 rounded-md border ${
                        item.isInternal
                          ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800"
                          : "bg-muted border-border"
                      }`}
                    >
                      {item.body}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">{getActionDescription(item)}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
