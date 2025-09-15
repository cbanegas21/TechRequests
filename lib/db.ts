interface User {
  id: string
  name: string
  email: string
  role: "agent" | "csp"
  active: boolean
  googleId?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

interface Ticket {
  id: string
  shortId: string
  title: string
  description: string
  requesterUserId?: string
  requesterName?: string
  requesterEmail?: string
  accountName: string
  accountId?: string // Added optional account ID field
  category: string
  urgency: string
  priority: "Low" | "Medium" | "High" | "Urgent" | "DEFCON" // Added priority levels
  workflowType:
    | "Bug"
    | "General"
    | "White Label"
    | "Data Migration"
    | "Export"
    | "Proposal Build"
    | "Report Request"
    | "Enterprise Import" // Added workflow types
  projectType: "Project" | "Workflow" // Added project classification
  status:
    | "New Tech Request"
    | "Reviewed"
    | "Assigned"
    | "Validated"
    | "Completed"
    | "Ticket"
    | "Rejected"
    | "Escalated"
    | "Scheduled Client" // Updated pipeline stages
  tags?: string
  attachments?: string
  videoAttachments?: string // Added video attachments
  imageAttachments?: string // Added image attachments
  evidenceAttachments?: string // Added evidence attachments
  dueDate?: Date
  expectedFinishDate?: Date // Added expected finish date
  assigneeUserId?: string
  assignedDate?: Date // Added assigned date tracking
  startedAt?: Date // Added start progress tracking
  completedAt?: Date // Added completion tracking
  timeSpentMinutes?: number // Added time tracking in minutes
  gitlabLink?: string
  emailNotifications?: string // Added email notification settings (JSON string of emails)
  createdAt: Date
  updatedAt: Date
}

interface Comment {
  id: string
  ticketId: string
  body: string
  isInternal: boolean
  authorUserId?: string
  authorName?: string
  createdAt: Date
  updatedAt: Date
}

interface SLA {
  id: string
  ticketId: string
  firstResponseAt?: Date
  resolvedAt?: Date
  reopenedCount: number
  expectedCompletionDate?: Date // Added expected completion based on priority/type
  isOnTime?: boolean // Added on-time tracking
  createdAt: Date
  updatedAt: Date
}

interface AuditLog {
  id: string
  ticketId: string
  actorUserId?: string
  actorName?: string
  action: string
  fromValue?: string
  toValue?: string
  timestamp: Date // Added explicit timestamp field
  createdAt: Date
  updatedAt: Date
}

// Mock data storage
const users: User[] = [
  {
    id: "1",
    name: "Kent Hall",
    email: "kent@clienttether.com",
    role: "agent", // Admin
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Angel Handal",
    email: "angel@clienttether.com",
    role: "agent", // Admin
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Carlos Banegas",
    email: "carlos@clienttether.com",
    role: "agent", // Admin
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Kurt Brown",
    email: "kurt@clienttether.com",
    role: "agent", // Admin
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    name: "Crystal Flynn",
    email: "crystal@clienttether.com",
    role: "csp", // Regular user
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "6",
    name: "Giann Hoosier",
    email: "giann@clienttether.com",
    role: "csp", // Regular user
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "7",
    name: "Alannah Bowman",
    email: "alannah@clienttether.com",
    role: "csp", // Regular user
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

const tickets: Ticket[] = [
  {
    id: "1",
    shortId: "TR-0001",
    title: "Login page not loading",
    description:
      "Users are reporting that the login page is not loading properly. The page appears blank after clicking the login button.",
    requesterUserId: "3",
    accountName: "ClientTether",
    accountId: "CT-001",
    category: "Bug Report",
    urgency: "High",
    priority: "High",
    workflowType: "Bug",
    projectType: "Workflow",
    status: "Assigned",
    assigneeUserId: "6",
    assignedDate: new Date("2024-01-15T10:30:00Z"),
    expectedFinishDate: new Date("2024-01-18T17:00:00Z"), // 3 days for High priority
    emailNotifications: JSON.stringify(["giann@clienttether.com", "sarah.chen@clienttether.com"]),
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T14:30:00Z"),
  },
  {
    id: "2",
    shortId: "TR-0002",
    title: "White Label Setup for New Client",
    description:
      "Need to set up a complete white label solution for Acme Corp including custom branding, domain configuration, and user setup.",
    requesterName: "Kurt Brown",
    requesterEmail: "kurt@clienttether.com",
    accountName: "ClientTether",
    accountId: "CT-002",
    category: "Project Request",
    urgency: "Medium",
    priority: "Medium",
    workflowType: "White Label",
    projectType: "Project",
    status: "New Tech Request",
    expectedFinishDate: new Date("2024-01-26T17:00:00Z"), // 10 days for White Label
    emailNotifications: JSON.stringify(["kurt@clienttether.com"]),
    createdAt: new Date("2024-01-16T09:15:00Z"),
    updatedAt: new Date("2024-01-16T09:15:00Z"),
  },
  {
    id: "3",
    shortId: "TR-0003",
    title: "DEFCON: Production Database Down",
    description:
      "Critical production database is completely down. All client systems are affected. Need immediate attention.",
    requesterUserId: "5",
    accountName: "ClientTether",
    category: "Critical Issue",
    urgency: "Critical",
    priority: "DEFCON",
    workflowType: "Bug",
    projectType: "Workflow",
    status: "Escalated",
    assigneeUserId: "7",
    assignedDate: new Date("2024-01-17T08:00:00Z"),
    expectedFinishDate: new Date("2024-01-17T11:00:00Z"), // 3 hours for DEFCON
    emailNotifications: JSON.stringify(["kent@clienttether.com", "mike.rodriguez@clienttether.com"]),
    createdAt: new Date("2024-01-17T08:00:00Z"),
    updatedAt: new Date("2024-01-17T08:15:00Z"),
  },
]

const comments: Comment[] = [
  {
    id: "1",
    ticketId: "1",
    body: "I'm looking into this issue. It seems to be related to the recent deployment.",
    isInternal: false,
    authorUserId: "6",
    createdAt: new Date("2024-01-15T11:00:00Z"),
    updatedAt: new Date("2024-01-15T11:00:00Z"),
  },
]

const slas: SLA[] = [
  {
    id: "1",
    ticketId: "1",
    firstResponseAt: new Date("2024-01-15T11:00:00Z"),
    expectedCompletionDate: new Date("2024-01-18T17:00:00Z"),
    isOnTime: true,
    reopenedCount: 0,
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T11:00:00Z"),
  },
  {
    id: "2",
    ticketId: "2",
    expectedCompletionDate: new Date("2024-01-26T17:00:00Z"),
    isOnTime: true,
    reopenedCount: 0,
    createdAt: new Date("2024-01-16T09:15:00Z"),
    updatedAt: new Date("2024-01-16T09:15:00Z"),
  },
  {
    id: "3",
    ticketId: "3",
    firstResponseAt: new Date("2024-01-17T08:05:00Z"),
    expectedCompletionDate: new Date("2024-01-17T11:00:00Z"),
    isOnTime: true,
    reopenedCount: 0,
    createdAt: new Date("2024-01-17T08:00:00Z"),
    updatedAt: new Date("2024-01-17T08:05:00Z"),
  },
]

const auditLogs: AuditLog[] = [
  {
    id: "1",
    ticketId: "1",
    actorUserId: "3",
    actorName: "Carlos Banegas",
    action: "ticket_created",
    toValue: "New Tech Request",
    timestamp: new Date("2024-01-15T10:00:00Z"),
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
  },
  {
    id: "2",
    ticketId: "1",
    actorUserId: "6",
    actorName: "Crystal Flynn",
    action: "status_changed",
    fromValue: "New Tech Request",
    toValue: "Assigned",
    timestamp: new Date("2024-01-15T10:30:00Z"),
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: "3",
    ticketId: "2",
    actorUserId: "4",
    actorName: "Kurt Brown",
    action: "ticket_created",
    toValue: "New Tech Request",
    timestamp: new Date("2024-01-16T09:15:00Z"),
    createdAt: new Date("2024-01-16T09:15:00Z"),
    updatedAt: new Date("2024-01-16T09:15:00Z"),
  },
]

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Proper user update method that persists changes
export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex === -1) return null

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date(),
  }

  // Update localStorage if this is the current user
  const storedUser = localStorage.getItem("user")
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser)
      if (parsedUser.id === userId) {
        const updatedSession = {
          ...parsedUser,
          name: users[userIndex].name,
          email: users[userIndex].email,
          image: users[userIndex].image,
          isAgent: users[userIndex].role === "agent",
        }
        localStorage.setItem("user", JSON.stringify(updatedSession))
      }
    } catch (error) {
      console.error("Error updating stored user session:", error)
    }
  }

  return users[userIndex]
}

// Mock Prisma client implementation
export const prisma = {
  user: {
    findMany: async (options?: any) => {
      let result = [...users]

      if (options?.where) {
        if (options.where.active !== undefined) {
          result = result.filter((u) => u.active === options.where.active)
        }
        if (options.where.role) {
          result = result.filter((u) => u.role === options.where.role)
        }
        if (options.where.email) {
          result = result.filter((u) => u.email === options.where.email)
        }
        if (options.where.googleId) {
          result = result.filter((u) => u.googleId === options.where.googleId)
        }
      }

      if (options?.select) {
        result = result.map((user) => {
          const selected: any = {}
          Object.keys(options.select).forEach((key) => {
            if (options.select[key]) selected[key] = (user as any)[key]
          })
          return selected
        })
      }

      if (options?.orderBy?.name === "asc") {
        result.sort((a, b) => a.name.localeCompare(b.name))
      }

      return result
    },

    findUnique: async (options: any) => {
      let user = null

      if (options.where.id) {
        user = users.find((u) => u.id === options.where.id)
      } else if (options.where.email) {
        user = users.find((u) => u.email === options.where.email)
      } else if (options.where.googleId) {
        user = users.find((u) => u.googleId === options.where.googleId)
      }

      if (!user) return null

      if (options?.select) {
        const selected: any = {}
        Object.keys(options.select).forEach((key) => {
          if (options.select[key]) selected[key] = (user as any)[key]
        })
        return selected
      }

      return user
    },

    create: async (options: any) => {
      const newUser: User = {
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true,
        role: "csp", // Default role for new users
        ...options.data,
      }
      users.push(newUser)
      return newUser
    },

    upsert: async (options: any) => {
      const existingUser = users.find((u) => u.email === options.where.email)

      if (existingUser) {
        // Update existing user
        Object.assign(existingUser, options.update, { updatedAt: new Date() })
        return existingUser
      } else {
        // Create new user
        const newUser: User = {
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          active: true,
          role: "csp", // Default role for new users
          ...options.create,
        }
        users.push(newUser)
        return newUser
      }
    },

    update: async (options: any) => {
      const updatedUser = updateUser(options.where.id, options.data)
      if (!updatedUser) throw new Error("User not found")
      return updatedUser
    },
  },

  ticket: {
    findMany: async (options?: any) => {
      let result = [...tickets]

      if (options?.where) {
        Object.keys(options.where).forEach((key) => {
          if (options.where[key] !== undefined) {
            if (key === "OR") {
              const orConditions = options.where[key]
              result = result.filter((ticket) =>
                orConditions.some((condition: any) => {
                  return Object.keys(condition).some((condKey) => {
                    const value = (ticket as any)[condKey]
                    const searchValue = condition[condKey]
                    if (searchValue?.contains) {
                      return value?.toLowerCase().includes(searchValue.contains.toLowerCase())
                    }
                    return value === searchValue
                  })
                }),
              )
            } else if (key === "createdAt" && options.where[key].gte) {
              result = result.filter((t) => t.createdAt >= options.where[key].gte)
            } else {
              result = result.filter((t) => (t as any)[key] === options.where[key])
            }
          }
        })
      }

      if (options?.include) {
        result = result.map((ticket) => {
          const enhanced: any = { ...ticket }

          if (options.include.requester) {
            enhanced.requester = ticket.requesterUserId ? users.find((u) => u.id === ticket.requesterUserId) : null
          }

          if (options.include.assignee) {
            enhanced.assignee = ticket.assigneeUserId ? users.find((u) => u.id === ticket.assigneeUserId) : null
          }

          if (options.include.comments) {
            enhanced.comments = comments
              .filter((c) => c.ticketId === ticket.id)
              .map((comment) => {
                const commentWithAuthor: any = { ...comment }
                if (options.include.comments.include?.author) {
                  commentWithAuthor.author = comment.authorUserId
                    ? users.find((u) => u.id === comment.authorUserId)
                    : null
                }
                return commentWithAuthor
              })
          }

          if (options.include.auditLogs) {
            enhanced.auditLogs = auditLogs
              .filter((a) => a.ticketId === ticket.id)
              .map((log) => {
                const logWithActor: any = { ...log }
                if (options.include.auditLogs.include?.actor) {
                  logWithActor.actor = log.actorUserId ? users.find((u) => u.id === log.actorUserId) : null
                }
                return logWithActor
              })
          }

          if (options.include.sla) {
            enhanced.sla = slas.find((s) => s.ticketId === ticket.id)
          }

          return enhanced
        })
      }

      if (options?.orderBy?.createdAt === "desc") {
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }

      return result
    },

    findUnique: async (options: any) => {
      const ticket = tickets.find((t) =>
        options.where.id ? t.id === options.where.id : t.shortId === options.where.shortId,
      )
      if (!ticket) return null

      if (options?.include) {
        const enhanced: any = { ...ticket }

        if (options.include.requester) {
          enhanced.requester = ticket.requesterUserId ? users.find((u) => u.id === ticket.requesterUserId) : null
        }

        if (options.include.assignee) {
          enhanced.assignee = ticket.assigneeUserId ? users.find((u) => u.id === ticket.assigneeUserId) : null
        }

        if (options.include.comments) {
          enhanced.comments = comments
            .filter((c) => c.ticketId === ticket.id)
            .map((comment) => {
              const commentWithAuthor: any = { ...comment }
              if (options.include.comments.include?.author) {
                commentWithAuthor.author = comment.authorUserId
                  ? users.find((u) => u.id === comment.authorUserId)
                  : null
              }
              return commentWithAuthor
            })
        }

        if (options.include.auditLogs) {
          enhanced.auditLogs = auditLogs
            .filter((a) => a.ticketId === ticket.id)
            .map((log) => {
              const logWithActor: any = { ...log }
              if (options.include.auditLogs.include?.actor) {
                logWithActor.actor = log.actorUserId ? users.find((u) => u.id === log.actorUserId) : null
              }
              return logWithActor
            })
        }

        if (options.include.sla) {
          enhanced.sla = slas.find((s) => s.ticketId === ticket.id)
        }

        return enhanced
      }

      return ticket
    },

    findFirst: async (options?: any) => {
      const result = [...tickets]

      if (options?.orderBy?.createdAt === "desc") {
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }

      if (options?.select) {
        const ticket = result[0]
        if (!ticket) return null

        const selected: any = {}
        Object.keys(options.select).forEach((key) => {
          if (options.select[key]) selected[key] = (ticket as any)[key]
        })
        return selected
      }

      return result[0] || null
    },

    create: async (options: any) => {
      const newTicket: Ticket = {
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...options.data,
      }
      tickets.push(newTicket)
      return newTicket
    },

    update: async (options: any) => {
      const index = tickets.findIndex((t) => t.id === options.where.id)
      if (index === -1) throw new Error("Ticket not found")

      tickets[index] = {
        ...tickets[index],
        ...options.data,
        updatedAt: new Date(),
      }
      return tickets[index]
    },

    count: async (options?: any) => {
      let result = [...tickets]

      if (options?.where) {
        Object.keys(options.where).forEach((key) => {
          if (options.where[key] !== undefined) {
            result = result.filter((t) => (t as any)[key] === options.where[key])
          }
        })
      }

      return result.length
    },

    groupBy: async (options: any) => {
      const groupField = options.by[0]
      const groups: any = {}

      tickets.forEach((ticket) => {
        const value = (ticket as any)[groupField]
        if (!groups[value]) {
          groups[value] = { [groupField]: value, _count: { [groupField]: 0 } }
        }
        groups[value]._count[groupField]++
      })

      return Object.values(groups)
    },
  },

  comment: {
    create: async (options: any) => {
      const newComment: Comment = {
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...options.data,
      }
      comments.push(newComment)
      return newComment
    },
  },

  sLA: {
    create: async (options: any) => {
      const newSLA: SLA = {
        id: generateId(),
        reopenedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...options.data,
      }
      slas.push(newSLA)
      return newSLA
    },

    updateMany: async (options: any) => {
      const updatedSLAs = slas.filter((s) => s.ticketId === options.where.ticketId)

      if (options.where.firstResponseAt === null) {
        updatedSLAs.forEach((sla) => {
          if (!sla.firstResponseAt) {
            Object.assign(sla, options.data, { updatedAt: new Date() })
          }
        })
      } else {
        updatedSLAs.forEach((sla) => {
          if (options.data.reopenedCount?.increment) {
            sla.reopenedCount += options.data.reopenedCount.increment
          }
          Object.assign(sla, options.data, { updatedAt: new Date() })
        })
      }

      return { count: updatedSLAs.length }
    },
  },

  auditLog: {
    create: async (options: any) => {
      const newLog: AuditLog = {
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...options.data,
      }
      auditLogs.push(newLog)
      return newLog
    },
  },
}

// Helper function to get or create user from Google Auth session
export async function getOrCreateUserFromSession(session: any) {
  if (!session?.user?.email) return null

  const existingUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (existingUser) {
    return existingUser
  }

  // Create new user if they don't exist
  const agentEmails = [
    "kent@clienttether.com",
    "angel@clienttether.com",
    "carlos@clienttether.com",
    "kurt@clienttether.com",
  ]

  const isAgent = agentEmails.includes(session.user.email)

  return await prisma.user.create({
    data: {
      name: session.user.name || "Unknown User",
      email: session.user.email,
      role: isAgent ? "agent" : "csp",
      googleId: session.user.id,
      image: session.user.image,
    },
  })
}

export const createAuditLog = async (
  ticketId: string,
  actorUserId: string,
  actorName: string,
  action: string,
  fromValue?: string,
  toValue?: string,
) => {
  const now = new Date()
  return await prisma.auditLog.create({
    data: {
      ticketId,
      actorUserId,
      actorName,
      action,
      fromValue,
      toValue,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    },
  })
}

export const updateTicketTimeTracking = async (ticketId: string, action: "start" | "pause" | "complete") => {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) return null

  const now = new Date()
  const updates: any = { updatedAt: now }

  switch (action) {
    case "start":
      updates.startedAt = now
      break
    case "pause":
      if (ticket.startedAt && !ticket.completedAt) {
        const timeSpent = Math.floor((now.getTime() - ticket.startedAt.getTime()) / (1000 * 60))
        updates.timeSpentMinutes = (ticket.timeSpentMinutes || 0) + timeSpent
        updates.startedAt = null // Reset start time
      }
      break
    case "complete":
      if (ticket.startedAt) {
        const timeSpent = Math.floor((now.getTime() - ticket.startedAt.getTime()) / (1000 * 60))
        updates.timeSpentMinutes = (ticket.timeSpentMinutes || 0) + timeSpent
      }
      updates.completedAt = now
      updates.startedAt = null
      break
  }

  return await prisma.ticket.update({
    where: { id: ticketId },
    data: updates,
  })
}

export const mockDb = {
  users,
  tickets,
  comments,
  slas,
  auditLogs,
}
