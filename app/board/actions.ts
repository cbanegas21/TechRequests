import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function moveTicket(ticketId: string, newStatus: string) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { status: true },
    })

    if (!ticket) {
      return { success: false, error: "Ticket not found" }
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: newStatus },
    })

    if (newStatus === "Done") {
      await prisma.sLA.updateMany({
        where: { ticketId },
        data: { resolvedAt: new Date() },
      })
    } else if (newStatus === "Reopened") {
      await prisma.sLA.updateMany({
        where: { ticketId },
        data: {
          reopenedCount: { increment: 1 },
          resolvedAt: null,
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        ticketId,
        actorName: "Agent",
        action: "status_changed",
        fromValue: ticket.status,
        toValue: newStatus,
      },
    })

    revalidatePath("/board")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to move ticket" }
  }
}

export async function getFilteredTickets(filters: {
  search?: string
  urgency?: string
  category?: string
  status?: string
  assignee?: string
  account?: string
  dateRange?: string
}) {
  try {
    const where: any = {}

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { shortId: { contains: filters.search, mode: "insensitive" } },
        { accountName: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    if (filters.urgency) {
      where.urgency = filters.urgency
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.account) {
      where.accountName = filters.account
    }

    if (filters.assignee) {
      if (filters.assignee === "unassigned") {
        where.assigneeUserId = null
      } else if (filters.assignee !== "me" && filters.assignee !== "submitted") {
        where.assigneeUserId = filters.assignee
      }
    }

    if (filters.dateRange) {
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

      where.createdAt = {
        gte: startDate,
      }
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        sla: {
          select: { firstResponseAt: true, resolvedAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return tickets
  } catch (error) {
    return []
  }
}
