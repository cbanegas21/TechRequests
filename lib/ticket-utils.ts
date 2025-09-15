import { prisma } from "./db"

export async function generateTicketShortId(): Promise<string> {
  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { createdAt: "desc" },
    select: { shortId: true },
  })

  if (!lastTicket) {
    return "TR-0001"
  }

  const lastNumber = Number.parseInt(lastTicket.shortId.split("-")[1])
  const nextNumber = lastNumber + 1
  return `TR-${nextNumber.toString().padStart(4, "0")}`
}

export function calculateSLAMetrics(ticket: any) {
  const now = new Date()
  const created = new Date(ticket.createdAt)

  let responseTimeMinutes: number | null = null
  let resolutionTimeMinutes: number | null = null

  if (ticket.sla?.firstResponseAt) {
    const firstResponse = new Date(ticket.sla.firstResponseAt)
    responseTimeMinutes = Math.floor((firstResponse.getTime() - created.getTime()) / (1000 * 60))
  }

  if (ticket.sla?.resolvedAt) {
    const resolved = new Date(ticket.sla.resolvedAt)
    resolutionTimeMinutes = Math.floor((resolved.getTime() - created.getTime()) / (1000 * 60))
  }

  return {
    responseTimeMinutes,
    resolutionTimeMinutes,
    ageMinutes: Math.floor((now.getTime() - created.getTime()) / (1000 * 60)),
  }
}

export const TICKET_STATUSES = [
  "New Tech Request",
  "Reviewed",
  "Assigned",
  "Validated",
  "Completed",
  "Ticket",
  "Rejected",
  "Escalated",
  "Scheduled Client",
] as const

export const PRIORITY_LEVELS = ["Low", "Medium", "High", "Urgent", "DEFCON"] as const

export const URGENCY_LEVELS = ["Low", "Medium", "High", "Urgent", "DEFCON"] as const

export const WORKFLOW_TYPES = [
  "Bug",
  "General",
  "Export",
  "Report Request",
  "Enterprise Import",
  "Data Migration",
  "Proposal Build",
  "White Label",
] as const

export const PROJECT_TYPES = ["Project", "Workflow"] as const

export const CATEGORIES = [
  "Bug Report",
  "Feature Request",
  "Technical Support",
  "Integration",
  "Performance",
  "Security",
  "Documentation",
  "Project Request",
  "Data Request",
  "Other",
] as const

export function isProjectType(workflowType: string): boolean {
  return ["White Label", "Data Migration", "Proposal Build"].includes(workflowType)
}

export function calculateExpectedCompletion(priority: string, workflowType: string, createdAt: Date): Date {
  const created = new Date(createdAt)
  let daysToAdd = 7 // Default

  // Priority-based timelines for workflows
  switch (priority) {
    case "DEFCON":
      return new Date(created.getTime() + 3 * 60 * 60 * 1000) // 3 hours
    case "Urgent":
      return new Date(created.getTime() + 48 * 60 * 60 * 1000) // 48 hours
    case "High":
      daysToAdd = 3
      break
    case "Medium":
      daysToAdd = 5
      break
    case "Low":
      daysToAdd = 7
      break
  }

  // Project-specific timelines
  if (workflowType === "Proposal Build" || workflowType === "White Label") {
    daysToAdd = 10
  } else if (workflowType === "Data Migration") {
    daysToAdd = 7
  } else if (workflowType === "Enterprise Import") {
    daysToAdd = 21 // 3 weeks
  } else if (workflowType === "Report Request") {
    daysToAdd = 7
  }

  return new Date(created.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
}
