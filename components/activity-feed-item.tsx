"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  MessageSquare,
  FileText,
  UserPlus,
  Settings,
  Upload,
  GitBranch,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityFeedItemProps {
  activity: {
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
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "comment":
      return <MessageSquare className="h-4 w-4" />
    case "ticket_created":
      return <FileText className="h-4 w-4" />
    case "status_changed":
      return <ArrowRight className="h-4 w-4" />
    case "assigned":
      return <UserPlus className="h-4 w-4" />
    case "file_upload":
      return <Upload className="h-4 w-4" />
    case "gitlab_submission":
      return <GitBranch className="h-4 w-4" />
    case "priority_changed":
      return <AlertTriangle className="h-4 w-4" />
    case "due_date_changed":
      return <Clock className="h-4 w-4" />
    default:
      return <Settings className="h-4 w-4" />
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case "comment":
      return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20"
    case "ticket_created":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
    case "status_changed":
      return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20"
    case "assigned":
      return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20"
    case "file_upload":
      return "text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/20"
    case "gitlab_submission":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
    case "priority_changed":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20"
    case "due_date_changed":
      return "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20"
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
  }
}

const getActivityDescription = (activity: ActivityFeedItemProps["activity"]) => {
  const { type, details, actor } = activity

  switch (type) {
    case "comment":
      return (
        <span>
          <strong>{actor.name}</strong> commented on ticket
          {details.isInternal && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Internal
            </Badge>
          )}
        </span>
      )
    case "ticket_created":
      return (
        <span>
          <strong>{actor.name}</strong> created a new ticket
        </span>
      )
    case "status_changed":
      return (
        <span>
          <strong>{actor.name}</strong> changed status from{" "}
          <Badge variant="outline" className="mx-1">
            {details.from}
          </Badge>
          to{" "}
          <Badge variant="outline" className="mx-1">
            {details.to}
          </Badge>
        </span>
      )
    case "assigned":
      return (
        <span>
          <strong>{actor.name}</strong> assigned ticket to <strong>{details.assigneeName}</strong>
        </span>
      )
    case "file_upload":
      return (
        <span>
          <strong>{actor.name}</strong> uploaded {details.fileCount} file(s)
        </span>
      )
    case "gitlab_submission":
      return (
        <span>
          <strong>{actor.name}</strong> submitted ticket to GitLab
        </span>
      )
    case "priority_changed":
      return (
        <span>
          <strong>{actor.name}</strong> changed priority from{" "}
          <Badge variant="outline" className="mx-1">
            {details.from}
          </Badge>
          to{" "}
          <Badge variant="outline" className="mx-1">
            {details.to}
          </Badge>
        </span>
      )
    case "due_date_changed":
      return (
        <span>
          <strong>{actor.name}</strong> updated due date to{" "}
          <strong>{new Date(details.newDate).toLocaleDateString()}</strong>
        </span>
      )
    default:
      return (
        <span>
          <strong>{actor.name}</strong> performed an action
        </span>
      )
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

export function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Activity Icon */}
          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={activity.actor.image || "/placeholder.svg"} alt={activity.actor.name} />
                <AvatarFallback className="text-xs">{getInitials(activity.actor.name)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{getActivityDescription(activity)}</p>
              </div>

              <Badge variant={activity.actor.role === "agent" ? "default" : "secondary"} className="text-xs">
                {activity.actor.role === "agent" ? "Agent" : "CSP"}
              </Badge>
            </div>

            {/* Ticket Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>Ticket:</span>
              <span className="font-mono">{activity.ticketId}</span>
              <span>•</span>
              <span className="truncate">{activity.ticketTitle}</span>
            </div>

            {/* Comment Preview */}
            {activity.type === "comment" && activity.details.preview && (
              <div className="bg-muted/50 rounded-md p-2 text-sm text-muted-foreground italic border-l-2 border-muted-foreground/20">
                "{activity.details.preview}"
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
