"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Calendar, User, Building, Tag, ExternalLink } from "lucide-react"
import { mockDb } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UrgencyPill } from "@/components/urgency-pill"
import { StatusBadge } from "@/components/status-badge"
import { SLAIndicator } from "@/components/sla-indicator"
import { ActivityTimeline } from "@/components/activity-timeline"
import { CommentEditor } from "@/components/comment-editor"
import { TicketActions } from "./ticket-actions"
import { addComment } from "./actions"
import { EnhancedAttachmentsDisplay } from "@/components/enhanced-attachments-display"
import { useAuth } from "@/lib/auth"

interface TicketPageProps {
  params: { id: string }
}

export default function TicketPage({ params }: TicketPageProps) {
  const { user } = useAuth()
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadTicket = async () => {
    try {
      const foundTicket = mockDb.tickets.find((t) => t.shortId === params.id)
      if (foundTicket) {
        // Get related data
        const requester = mockDb.users.find((u) => u.id === foundTicket.requesterUserId)
        const assignee = foundTicket.assigneeUserId
          ? mockDb.users.find((u) => u.id === foundTicket.assigneeUserId)
          : null
        const comments = mockDb.comments.filter((c) => c.ticketId === foundTicket.id)
        const auditLogs = mockDb.auditLogs.filter((a) => a.ticketId === foundTicket.id)

        setTicket({
          ...foundTicket,
          requester,
          assignee,
          comments: comments.map((c) => ({
            ...c,
            author: mockDb.users.find((u) => u.id === c.authorUserId),
          })),
          auditLogs: auditLogs.map((a) => ({
            ...a,
            actor: mockDb.users.find((u) => u.id === a.actorUserId),
          })),
        })
      }
    } catch (error) {
      console.error("Error loading ticket:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTicket()
  }, [params.id])

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  if (!ticket) {
    notFound()
  }

  // Combine comments and audit logs for timeline
  const timelineItems = [
    ...ticket.comments.map((comment: any) => ({
      id: comment.id,
      type: "comment" as const,
      createdAt: comment.createdAt,
      author: comment.author,
      authorName: comment.authorName,
      body: comment.body,
      isInternal: comment.isInternal,
    })),
    ...ticket.auditLogs.map((log: any) => ({
      id: log.id,
      type: "audit" as const,
      createdAt: log.createdAt,
      author: log.actor,
      authorName: log.actorName,
      action: log.action,
      fromValue: log.fromValue,
      toValue: log.toValue,
    })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const parseAttachments = (jsonString: string | null): string[] => {
    if (!jsonString) return []
    try {
      const parsed = JSON.parse(jsonString)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const attachments = parseAttachments(ticket.attachments)
  const videoAttachments = parseAttachments(ticket.videoAttachments)
  const imageAttachments = parseAttachments(ticket.imageAttachments)
  const evidenceAttachments = parseAttachments(ticket.evidenceAttachments)
  const tags = parseAttachments(ticket.tags)

  const agents = mockDb.users.filter((u) => u.active && u.role === "agent")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">{ticket.shortId}</h1>
            <UrgencyPill urgency={ticket.priority || ticket.urgency} />
            <StatusBadge status={ticket.status} />
          </div>
          <h2 className="text-xl text-muted-foreground mb-4">{ticket.title}</h2>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>
                {ticket.requester?.name || ticket.requesterName}
                {ticket.requester?.email || ticket.requesterEmail
                  ? ` (${ticket.requester?.email || ticket.requesterEmail})`
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            </div>
            {ticket.assignee && (
              <div className="flex items-center gap-1">
                <span>Assigned to {ticket.assignee.name}</span>
              </div>
            )}
            {ticket.expectedFinishDate && (
              <div className="flex items-center gap-1">
                <span>
                  Expected completion {formatDistanceToNow(new Date(ticket.expectedFinishDate), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Attachments Display */}
            <EnhancedAttachmentsDisplay
              attachments={attachments}
              videoAttachments={videoAttachments}
              imageAttachments={imageAttachments}
              evidenceAttachments={evidenceAttachments}
            />

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Account</span>
                    </div>
                    <p className="text-sm">{ticket.accountName}</p>
                    {ticket.accountId && <p className="text-xs text-muted-foreground">ID: {ticket.accountId}</p>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">Category</span>
                    </div>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </div>
                </div>

                {ticket.workflowType && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">Workflow Type</span>
                    </div>
                    <Badge variant="secondary">{ticket.workflowType}</Badge>
                    {ticket.projectType && (
                      <Badge variant="outline" className="ml-2">
                        {ticket.projectType}
                      </Badge>
                    )}
                  </div>
                )}

                {tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {ticket.gitlabLink && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">GitLab Issue</span>
                    </div>
                    <a
                      href={ticket.gitlabLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {ticket.gitlabLink}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section - Enhanced */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Comments & Activity</h3>

              {/* Display comments in timeline format */}
              <div className="space-y-4">
                {timelineItems.map((item) => (
                  <Card key={`${item.type}-${item.id}`} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {item.authorName?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                          </span>
                          {item.type === "comment" && item.isInternal && (
                            <Badge variant="secondary" className="text-xs">
                              Internal
                            </Badge>
                          )}
                        </div>
                        {item.type === "comment" ? (
                          <p className="text-sm whitespace-pre-wrap">{item.body}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {item.action === "status_changed" &&
                              `Changed status from ${item.fromValue} to ${item.toValue}`}
                            {item.action === "commented" && "Added a comment"}
                            {item.action === "assigned" && `Assigned ticket`}
                            {item.action === "gitlab_linked" && "Linked GitLab issue"}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Comment Editor */}
              <CommentEditor
                onSubmit={async (body: string, isInternal: boolean) => {
                  if (!user) {
                    alert("Please sign in to comment")
                    return
                  }

                  const result = await addComment(ticket.id, body, isInternal, user.id)
                  if (result.success) {
                    await loadTicket()
                  } else {
                    alert(result.error || "Failed to add comment")
                  }
                }}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <TicketActions
              ticket={{
                ...ticket,
                attachments: attachments,
                videoAttachments: videoAttachments,
                imageAttachments: imageAttachments,
              }}
              agents={agents}
              comments={ticket.comments.map((comment: any) => ({
                id: comment.id,
                content: comment.body,
                authorName: comment.authorName,
                createdAt: comment.createdAt,
                isInternal: comment.isInternal,
              }))}
              onUpdate={loadTicket}
            />

            {/* SLA Metrics */}
            <SLAIndicator ticket={ticket} />

            {/* Activity Timeline */}
            <ActivityTimeline items={timelineItems} />
          </div>
        </div>
      </div>
    </div>
  )
}
