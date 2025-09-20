"use client"

import { useState } from "react"
import { Play, GitBranch, CheckCircle, X, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { updateTicketStatus, assignTicket, updateGitlabLink } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { TICKET_STATUSES } from "@/lib/ticket-utils"
import { GitlabAISubmission } from "@/components/gitlab-ai-submission"

interface TicketActionsProps {
  ticket: {
    id: string
    shortId: string
    status: string
    assigneeUserId?: string | null
    gitlabLink?: string | null
    title: string
    description: string
    category: string
    urgency: string
    requesterName: string
    requesterEmail: string
    attachments?: string[]
    videoAttachments?: string[]
    imageAttachments?: string[]
  }
  agents: Array<{
    id: string
    name: string
    email: string
  }>
  comments?: Array<{
    id: string
    content: string
    authorName: string
    createdAt: Date
    isInternal: boolean
  }>
  onUpdate?: () => void
}

export function TicketActions({ ticket, agents, comments = [], onUpdate }: TicketActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [gitlabUrl, setGitlabUrl] = useState(ticket.gitlabLink || "")
  const [isGitlabDialogOpen, setIsGitlabDialogOpen] = useState(false)
  const { toast } = useToast()
  const { isAgent, user } = useAuth()

  if (!isAgent || user?.role === "csp") {
    return null
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateTicketStatus(ticket.id, newStatus, user.id)
      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Ticket status changed to ${newStatus}`,
        })
        if (onUpdate) onUpdate()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAssignChange = async (assigneeId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const result = await assignTicket(ticket.id, assigneeId, user.id)
      if (result.success) {
        const assignee = agents.find((a) => a.id === assigneeId)
        toast({
          title: "Ticket Assigned",
          description: `Assigned to ${assignee?.name}`,
        })
        if (onUpdate) onUpdate()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleGitlabLink = async () => {
    if (!gitlabUrl.trim()) return

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateGitlabLink(ticket.id, gitlabUrl.trim(), user.id)
      if (result.success) {
        toast({
          title: "GitLab Link Added",
          description: "GitLab issue has been linked",
        })
        setIsGitlabDialogOpen(false)
        if (onUpdate) onUpdate()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add GitLab link",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEscalateToGitlab = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateTicketStatus(ticket.id, "Ticket", user.id)
      if (result.success) {
        toast({
          title: "Escalated to GitLab",
          description: "Ticket has been escalated and moved to Ticket pipeline",
        })
        if (onUpdate) onUpdate()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to escalate to GitLab",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const quickActions = [
    {
      label: "Start Progress",
      icon: Play,
      action: () => handleStatusChange("In Progress"),
      disabled: ticket.status === "In Progress",
      variant: "default" as const,
    },
    {
      label: "Mark Done",
      icon: CheckCircle,
      action: () => handleStatusChange("Done"),
      disabled: ticket.status === "Done",
      variant: "default" as const,
    },
    {
      label: "Decline",
      icon: X,
      action: () => handleStatusChange("Declined"),
      disabled: ticket.status === "Declined",
      variant: "outline" as const,
    },
    {
      label: "Escalate to GitLab",
      icon: ArrowUp,
      action: handleEscalateToGitlab,
      disabled: ticket.status === "Ticket",
      variant: "secondary" as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Dropdown */}
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <Select value={ticket.status} onValueChange={handleStatusChange} disabled={isUpdating}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TICKET_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignee Dropdown */}
        <div>
          <Label className="text-sm font-medium">Assignee</Label>
          <Select
            value={ticket.assigneeUserId || "unassigned"}
            onValueChange={handleAssignChange}
            disabled={isUpdating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Actions</Label>
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                onClick={action.action}
                disabled={action.disabled || isUpdating}
                className="justify-start"
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* GitLab Integration */}
        <div>
          <Label className="text-sm font-medium">GitLab Integration</Label>
          <div className="space-y-2">
            {ticket.status === "In Progress" && <GitlabAISubmission ticket={ticket} comments={comments} />}

            <Dialog open={isGitlabDialogOpen} onOpenChange={setIsGitlabDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <GitBranch className="h-4 w-4 mr-2" />
                  {ticket.gitlabLink ? "Update GitLab Link" : "Link GitLab Issue"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Link GitLab Issue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gitlab-url">GitLab Issue URL</Label>
                    <Input
                      id="gitlab-url"
                      value={gitlabUrl}
                      onChange={(e) => setGitlabUrl(e.target.value)}
                      placeholder="https://gitlab.com/company/project/-/issues/123"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsGitlabDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGitlabLink} disabled={!gitlabUrl.trim() || isUpdating}>
                      {isUpdating ? "Linking..." : "Link Issue"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
