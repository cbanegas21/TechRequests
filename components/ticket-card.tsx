import Link from "next/link"
import { User, Clock, AlertTriangle, Calendar, Target, Briefcase, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UrgencyPill } from "@/components/urgency-pill"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TicketCardProps {
  ticket: {
    id: string
    shortId: string
    title: string
    accountName: string
    urgency: string
    priority?: string // Added priority field
    workflowType?: string // Added workflow type
    projectType?: string // Added project type
    expectedFinishDate?: string // Added expected finish date
    status: string
    createdAt: string
    requester?: {
      id: string
      name: string
      email: string
    } | null
    requesterName?: string
    assignee?: {
      id: string
      name: string
      email: string
    } | null
    sla?: {
      firstResponseAt?: string | null
      resolvedAt?: string | null
      expectedCompletionDate?: string | null // Added expected completion
      isOnTime?: boolean // Added on-time tracking
    } | null
  }
  isDragging?: boolean
}

export function TicketCard({ ticket, isDragging }: TicketCardProps) {
  const createdAt = new Date(ticket.createdAt)
  const now = new Date()
  const ageHours = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
  const ageDays = Math.round(ageHours / 24)

  const expectedCompletion = ticket.expectedFinishDate ? new Date(ticket.expectedFinishDate) : null
  const isOverdue = expectedCompletion && now > expectedCompletion && !["Completed", "Rejected"].includes(ticket.status)
  const isApproachingDeadline =
    expectedCompletion && !isOverdue && expectedCompletion.getTime() - now.getTime() < 24 * 60 * 60 * 1000 // Within 24 hours

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const submitterName = ticket.requester?.name || ticket.requesterName || "Unknown"
  const submitterInitials = getInitials(submitterName)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  const isProject =
    ticket.projectType === "Project" ||
    ["White Label", "Data Migration", "Proposal Build"].includes(ticket.workflowType || "")

  return (
    <Card
      className={`trello-card cursor-pointer rounded-lg border-0 bg-card text-card-foreground ${isDragging ? "opacity-50" : ""}`}
    >
      <CardContent className="p-3">
        <Link href={`/ticket/${ticket.shortId}`} className="block space-y-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-card-foreground leading-tight line-clamp-2">{ticket.title}</h3>
              <UrgencyPill urgency={ticket.priority || ticket.urgency} className="flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">{ticket.shortId}</p>
              {isProject && (
                <Badge
                  variant="secondary"
                  className="project-badge text-[10px] px-1.5 py-0.5 h-auto bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-foreground border-primary/30 dark:border-primary/40"
                >
                  <Briefcase className="h-2.5 w-2.5 mr-1" />
                  Project
                </Badge>
              )}
            </div>
          </div>

          {ticket.workflowType && (
            <div className="flex items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0.5 h-auto border-muted-foreground/30 text-muted-foreground dark:border-muted-foreground/40 dark:text-muted-foreground"
              >
                <Zap className="h-2.5 w-2.5 mr-1" />
                {ticket.workflowType}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Submitted {formatDate(createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="submitter-initials text-[10px] bg-muted text-muted-foreground dark:bg-muted/80 dark:text-foreground">
                  {submitterInitials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">by {submitterName}</span>
            </div>
          </div>

          {expectedCompletion && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>Due {formatDate(expectedCompletion)}</span>
            </div>
          )}

          {/* Account */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate font-medium">{ticket.accountName}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-muted-foreground/20">
            <div className="flex items-center gap-2">
              {/* Age */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{ageDays > 0 ? `${ageDays}d` : `${ageHours}h`}</span>
              </div>

              {isOverdue && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 h-auto">
                  <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                  Overdue
                </Badge>
              )}
              {isApproachingDeadline && !isOverdue && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5 h-auto bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700"
                >
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  Due Soon
                </Badge>
              )}
            </div>

            {/* Assignee */}
            {ticket.assignee ? (
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="assignee-initials text-[10px] bg-primary/20 text-primary dark:bg-primary/40 dark:text-primary-foreground font-medium border border-primary/30 dark:border-primary/50">
                    {getInitials(ticket.assignee.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
