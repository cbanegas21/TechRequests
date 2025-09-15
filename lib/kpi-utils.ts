import { prisma } from "./db"

export interface KPIFilters {
  dateRange?: string
  startDate?: Date
  endDate?: Date
  agent?: string
  priority?: string // Updated from urgency to priority
  workflowType?: string // Added workflow type filter
  projectType?: string // Added project type filter
  account?: string
  category?: string
}

export interface KPIStats {
  ticketsCreated: number
  ticketsInProgress: number
  ticketsResolvedOnTime: number
  ticketsDeclined: number
  gitlabTicketsSubmitted: number
  avgFirstResponseHours: number
  medianFirstResponseHours: number
  avgResolutionHours: number
  slaBreaches: {
    response: number
    resolution: number
  }
  projectMetrics: {
    proposalBuilds: {
      total: number
      onTime: number
      avgDays: number
    }
    whiteLabelBuilds: {
      total: number
      onTime: number
      avgDays: number
    }
    imports: {
      total: number
      onTime: number
      avgDays: number
    }
    enterpriseImports: {
      total: number
      onTime: number
      avgDays: number
    }
    reportRequests: {
      total: number
      onTime: number
      avgDays: number
    }
  }
  workflowMetrics: {
    low: { total: number; onTime: number; avgDays: number }
    medium: { total: number; onTime: number; avgDays: number }
    high: { total: number; onTime: number; avgDays: number }
    urgent: { total: number; onTime: number; avgHours: number }
    defcon: { total: number; onTime: number; avgHours: number }
  }
}

export interface AgentMetrics {
  agentId: string
  agentName: string
  ticketsAssigned: number
  ticketsResolved: number
  avgResponseHours: number
  avgResolutionHours: number
  slaCompliancePercent: number
}

function getExpectedCompletionHours(workflowType: string, priority: string): number {
  // Project-specific timelines (in hours)
  if (workflowType === "Proposal Build" || workflowType === "White Label") {
    return 10 * 24 // 10 days
  } else if (workflowType === "Data Migration") {
    return 7 * 24 // 7 days
  } else if (workflowType === "Enterprise Import") {
    return 21 * 24 // 3 weeks
  } else if (workflowType === "Report Request") {
    return 7 * 24 // 7 days
  }

  // Priority-based timelines for workflows
  switch (priority) {
    case "DEFCON":
      return 3 // 3 hours
    case "Urgent":
      return 48 // 48 hours
    case "High":
      return 3 * 24 // 3 days
    case "Medium":
      return 5 * 24 // 5 days
    case "Low":
      return 7 * 24 // 7 days
    default:
      return 7 * 24 // Default 7 days
  }
}

async function calculateProjectMetrics(whereClause: any) {
  const projectTypes = [
    { type: "Proposal Build", expectedDays: 10 },
    { type: "White Label", expectedDays: 10 },
    { type: "Data Migration", expectedDays: 7 },
    { type: "Enterprise Import", expectedDays: 21 },
    { type: "Report Request", expectedDays: 7 },
  ]

  const metrics: any = {}

  for (const project of projectTypes) {
    const tickets = await prisma.ticket.findMany({
      where: {
        ...whereClause,
        workflowType: project.type,
      },
      include: { sla: true },
    })

    const completedTickets = tickets.filter((t) => t.status === "Completed" && t.sla?.resolvedAt)
    const onTimeTickets = completedTickets.filter((t) => {
      const resolutionTime =
        (new Date(t.sla!.resolvedAt!).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      return resolutionTime <= project.expectedDays
    })

    const avgDays =
      completedTickets.length > 0
        ? completedTickets.reduce((sum, t) => {
            const days =
              (new Date(t.sla!.resolvedAt!).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            return sum + days
          }, 0) / completedTickets.length
        : 0

    const key =
      project.type.toLowerCase().replace(/\s+/g, "") +
      (project.type.includes("Import") ? "s" : project.type.includes("Build") ? "s" : "s")
    metrics[key] = {
      total: tickets.length,
      onTime: onTimeTickets.length,
      avgDays: Math.round(avgDays * 10) / 10,
    }
  }

  return {
    proposalBuilds: metrics.proposalbuilds || { total: 0, onTime: 0, avgDays: 0 },
    whiteLabelBuilds: metrics.whitelabelbuilds || { total: 0, onTime: 0, avgDays: 0 },
    imports: metrics.datamigrations || { total: 0, onTime: 0, avgDays: 0 },
    enterpriseImports: metrics.enterpriseimports || { total: 0, onTime: 0, avgDays: 0 },
    reportRequests: metrics.reportrequests || { total: 0, onTime: 0, avgDays: 0 },
  }
}

async function calculateWorkflowMetrics(whereClause: any) {
  const priorities = ["Low", "Medium", "High", "Urgent", "DEFCON"]
  const metrics: any = {}

  for (const priority of priorities) {
    const tickets = await prisma.ticket.findMany({
      where: {
        ...whereClause,
        priority: priority,
        projectType: "Workflow", // Only workflows, not projects
      },
      include: { sla: true },
    })

    const completedTickets = tickets.filter((t) => t.status === "Completed" && t.sla?.resolvedAt)
    const expectedHours = getExpectedCompletionHours("", priority)

    const onTimeTickets = completedTickets.filter((t) => {
      const resolutionTime =
        (new Date(t.sla!.resolvedAt!).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60)
      return resolutionTime <= expectedHours
    })

    const avgTime =
      completedTickets.length > 0
        ? completedTickets.reduce((sum, t) => {
            const time = (new Date(t.sla!.resolvedAt!).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60)
            return sum + time
          }, 0) / completedTickets.length
        : 0

    const key = priority.toLowerCase()
    if (priority === "Urgent" || priority === "DEFCON") {
      metrics[key] = {
        total: tickets.length,
        onTime: onTimeTickets.length,
        avgHours: Math.round(avgTime * 10) / 10,
      }
    } else {
      metrics[key] = {
        total: tickets.length,
        onTime: onTimeTickets.length,
        avgDays: Math.round((avgTime / 24) * 10) / 10,
      }
    }
  }

  return metrics
}

export async function calculateKPIStats(filters: KPIFilters = {}): Promise<KPIStats> {
  const whereClause = buildWhereClause(filters)

  // Get basic counts
  const [ticketsCreated, ticketsInProgress, ticketsDeclined] = await Promise.all([
    prisma.ticket.count({ where: whereClause }),
    prisma.ticket.count({ where: { ...whereClause, status: "Assigned" } }), // Updated to use new status
    prisma.ticket.count({ where: { ...whereClause, status: "Rejected" } }), // Updated to use new status
  ])

  const gitlabTicketsSubmitted = await prisma.ticket.count({
    where: {
      ...whereClause,
      gitlabLink: {
        not: null,
      },
    },
  })

  // Get tickets with SLA data for calculations
  const ticketsWithSLA = await prisma.ticket.findMany({
    where: whereClause,
    include: {
      sla: true,
    },
  })

  const ticketsResolvedOnTime = ticketsWithSLA.filter((t) => {
    if (t.status === "Completed" && t.sla?.resolvedAt) {
      const expectedHours = getExpectedCompletionHours(t.workflowType || "", t.priority || t.urgency)
      const resolutionTime = (new Date(t.sla.resolvedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60)
      return resolutionTime <= expectedHours
    }
    return false
  }).length

  // Calculate response times
  const responseTimes = ticketsWithSLA
    .filter((t) => t.sla?.firstResponseAt)
    .map((t) => {
      const created = new Date(t.createdAt)
      const responded = new Date(t.sla!.firstResponseAt!)
      return (responded.getTime() - created.getTime()) / (1000 * 60 * 60) // hours
    })

  // Calculate resolution times
  const resolutionTimes = ticketsWithSLA
    .filter((t) => t.sla?.resolvedAt)
    .map((t) => {
      const created = new Date(t.createdAt)
      const resolved = new Date(t.sla!.resolvedAt!)
      return (resolved.getTime() - created.getTime()) / (1000 * 60 * 60) // hours
    })

  // Calculate averages and medians
  const avgFirstResponseHours =
    responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0

  const medianFirstResponseHours =
    responseTimes.length > 0 ? responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length / 2)] : 0

  const avgResolutionHours =
    resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0

  const responseThreshold = 24

  const responseBreaches = ticketsWithSLA.filter((t) => {
    if (t.sla?.firstResponseAt) {
      const responseTime =
        (new Date(t.sla.firstResponseAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60)
      return responseTime > responseThreshold
    }
    // Also count tickets without response that are older than threshold
    const ageHours = (new Date().getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60)
    return ageHours > responseThreshold && t.status === "New Tech Request"
  }).length

  const resolutionBreaches = ticketsWithSLA.filter((t) => {
    const expectedHours = getExpectedCompletionHours(t.workflowType || "", t.priority || t.urgency)

    if (t.sla?.resolvedAt) {
      const resolutionTime = (new Date(t.sla.resolvedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60)
      return resolutionTime > expectedHours
    }
    // Also count unresolved tickets older than expected completion time
    const ageHours = (new Date().getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60)
    return ageHours > expectedHours && !["Completed", "Rejected"].includes(t.status)
  }).length

  const projectMetrics = await calculateProjectMetrics(whereClause)
  const workflowMetrics = await calculateWorkflowMetrics(whereClause)

  return {
    ticketsCreated,
    ticketsInProgress,
    ticketsResolvedOnTime,
    ticketsDeclined,
    gitlabTicketsSubmitted,
    avgFirstResponseHours,
    medianFirstResponseHours,
    avgResolutionHours,
    slaBreaches: {
      response: responseBreaches,
      resolution: resolutionBreaches,
    },
    projectMetrics,
    workflowMetrics,
  }
}

export async function getAgentMetrics(filters: KPIFilters = {}): Promise<AgentMetrics[]> {
  const agents = await prisma.user.findMany({
    where: { role: "agent", active: true },
  })

  const metrics: AgentMetrics[] = []

  for (const agent of agents) {
    const whereClause = {
      ...buildWhereClause(filters),
      assigneeUserId: agent.id,
    }

    const assignedTickets = await prisma.ticket.findMany({
      where: whereClause,
      include: { sla: true },
    })

    const resolvedTickets = assignedTickets.filter((t) => t.status === "Done")

    // Calculate response times for this agent
    const responseTimes = assignedTickets
      .filter((t) => t.sla?.firstResponseAt)
      .map((t) => {
        const created = new Date(t.createdAt)
        const responded = new Date(t.sla!.firstResponseAt!)
        return (responded.getTime() - created.getTime()) / (1000 * 60 * 60)
      })

    // Calculate resolution times for this agent
    const resolutionTimes = resolvedTickets
      .filter((t) => t.sla?.resolvedAt)
      .map((t) => {
        const created = new Date(t.createdAt)
        const resolved = new Date(t.sla!.resolvedAt!)
        return (resolved.getTime() - created.getTime()) / (1000 * 60 * 60)
      })

    // Calculate SLA compliance
    const responseThreshold = 24
    const resolutionThreshold = 7 * 24

    const withinResponseSLA = responseTimes.filter((t) => t <= responseThreshold).length
    const withinResolutionSLA = resolutionTimes.filter((t) => t <= resolutionThreshold).length
    const totalSLAChecks = responseTimes.length + resolutionTimes.length

    const slaCompliancePercent =
      totalSLAChecks > 0 ? ((withinResponseSLA + withinResolutionSLA) / totalSLAChecks) * 100 : 100

    metrics.push({
      agentId: agent.id,
      agentName: agent.name,
      ticketsAssigned: assignedTickets.length,
      ticketsResolved: resolvedTickets.length,
      avgResponseHours: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
      avgResolutionHours:
        resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0,
      slaCompliancePercent,
    })
  }

  return metrics.sort((a, b) => b.ticketsAssigned - a.ticketsAssigned)
}

export async function getChartData(filters: KPIFilters = {}) {
  const whereClause = buildWhereClause(filters)

  // Tickets by Status
  const statusData = await prisma.ticket.groupBy({
    by: ["status"],
    where: whereClause,
    _count: { status: true },
  })

  const priorityData = await prisma.ticket.groupBy({
    by: ["priority"],
    where: whereClause,
    _count: { priority: true },
  })

  const workflowTypeData = await prisma.ticket.groupBy({
    by: ["workflowType"],
    where: whereClause,
    _count: { workflowType: true },
  })

  // Created vs Resolved over time (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const timeSeriesData = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

    const [created, resolved] = await Promise.all([
      prisma.ticket.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          ...whereClause,
          status: "Completed", // Updated to use new status
          sla: {
            resolvedAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        },
      }),
    ])

    timeSeriesData.push({
      date: startOfDay.toISOString().split("T")[0],
      created,
      resolved,
    })
  }

  return {
    statusData: statusData.map((item) => ({
      status: item.status,
      count: item._count.status,
    })),
    priorityData: priorityData.map((item) => ({
      priority: item.priority,
      count: item._count.priority,
    })),
    workflowTypeData: workflowTypeData.map((item) => ({
      workflowType: item.workflowType,
      count: item._count.workflowType,
    })),
    timeSeriesData,
  }
}

function buildWhereClause(filters: KPIFilters) {
  const where: any = {}

  // Date range filter
  if (filters.startDate && filters.endDate) {
    where.createdAt = {
      gte: filters.startDate,
      lte: filters.endDate,
    }
  } else if (filters.dateRange) {
    const now = new Date()
    let startDate: Date

    switch (filters.dateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        break
      default:
        startDate = new Date(0)
    }

    where.createdAt = { gte: startDate }
  }

  // Other filters
  if (filters.agent) {
    where.assigneeUserId = filters.agent
  }

  if (filters.priority) {
    where.priority = filters.priority
  }

  if (filters.workflowType) {
    where.workflowType = filters.workflowType
  }

  if (filters.projectType) {
    where.projectType = filters.projectType
  }

  if (filters.account) {
    where.accountName = filters.account
  }

  if (filters.category) {
    where.category = filters.category
  }

  return where
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}
