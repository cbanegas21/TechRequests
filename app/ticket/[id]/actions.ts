import { prisma, mockDb, createAuditLog, updateTicketTimeTracking } from "@/lib/db"
import { emailService } from "@/lib/email-service"
import { revalidatePath } from "next/cache"

export async function addComment(ticketId: string, body: string, isInternal: boolean, userId?: string) {
  try {
    let currentUser = null
    if (userId) {
      currentUser = mockDb.users.find((u) => u.id === userId)
    }

    if (!currentUser) {
      return { success: false, error: "Authentication required" }
    }

    const comment = await prisma.comment.create({
      data: {
        ticketId,
        body,
        isInternal,
        authorUserId: currentUser.id,
        authorName: currentUser.name,
      },
    })

    // If this is the first agent response, update SLA
    if (currentUser.role === "agent") {
      await prisma.sLA.updateMany({
        where: {
          ticketId,
          firstResponseAt: null,
        },
        data: {
          firstResponseAt: new Date(),
        },
      })
    }

    await createAuditLog(
      ticketId,
      currentUser.id,
      currentUser.name,
      "commented",
      undefined,
      isInternal ? "internal_comment" : "public_comment",
    )

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        shortId: true,
        title: true,
        status: true,
        requesterName: true,
        requesterEmail: true,
        emailNotifications: true,
        requesterUserId: true,
      },
    })

    if (ticket) {
      const emailList = Array.isArray(ticket.emailNotifications) ? ticket.emailNotifications : []

      // Add requester email if not already in list
      const requesterEmail =
        ticket.requesterEmail ||
        (ticket.requesterUserId
          ? (await prisma.user.findUnique({ where: { id: ticket.requesterUserId } }))?.email
          : null)

      if (requesterEmail && !emailList.includes(requesterEmail)) {
        emailList.push(requesterEmail)
      }

      if (emailList.length > 0) {
        const ticketUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/ticket/${ticket.shortId}`

        await emailService.sendCommentNotification(
          {
            ticketId,
            shortId: ticket.shortId,
            title: ticket.title,
            status: ticket.status,
            requesterName: ticket.requesterName || "Unknown",
            requesterEmail: requesterEmail || "",
            priority: "Medium",
            workflowType: "General",
            description: "",
            url: ticketUrl,
            commentAuthor: currentUser.name,
            commentBody: body,
            isInternal,
          },
          emailList,
        )
      }
    }

    revalidatePath(`/ticket/${ticketId}`)
    return { success: true, comment }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { success: false, error: "Failed to add comment" }
  }
}

export async function updateTicketStatus(ticketId: string, status: string, userId?: string) {
  try {
    let currentUser = null
    if (userId) {
      currentUser = mockDb.users.find((u) => u.id === userId)
    }

    if (!currentUser || currentUser.role !== "agent") {
      return { success: false, error: "Admin access required" }
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        status: true,
        shortId: true,
        title: true,
        requesterName: true,
        requesterEmail: true,
        emailNotifications: true,
        requesterUserId: true,
        priority: true,
        workflowType: true,
        description: true,
        assigneeUserId: true,
      },
    })

    if (!ticket) {
      return { success: false, error: "Ticket not found" }
    }

    const oldStatus = ticket.status

    const updateData: any = { status }

    if (status === "Completed") {
      updateData.completedAt = new Date()
      // Update time tracking for completion
      await updateTicketTimeTracking(ticketId, "complete")
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
    })

    // Update SLA based on status
    if (status === "Completed") {
      await prisma.sLA.updateMany({
        where: { ticketId },
        data: { resolvedAt: new Date() },
      })
    } else if (status === "Reopened") {
      await prisma.sLA.updateMany({
        where: { ticketId },
        data: {
          reopenedCount: { increment: 1 },
          resolvedAt: null,
        },
      })
    }

    await createAuditLog(ticketId, currentUser.id, currentUser.name, "status_changed", ticket.status, status)

    revalidatePath(`/ticket/${ticketId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating ticket status:", error)
    return { success: false, error: "Failed to update status" }
  }
}

export async function startProgress(ticketId: string, userId?: string) {
  try {
    let currentUser = null
    if (userId) {
      currentUser = mockDb.users.find((u) => u.id === userId)
    }

    if (!currentUser || currentUser.role !== "agent") {
      return { success: false, error: "Admin access required" }
    }

    // Update ticket status and start time tracking
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: "Assigned",
        startedAt: new Date(),
        assigneeUserId: currentUser.id,
        assignedDate: new Date(),
      },
    })

    // Create audit log
    await createAuditLog(ticketId, currentUser.id, currentUser.name, "progress_started", undefined, "Assigned")

    revalidatePath(`/ticket/${ticketId}`)
    return { success: true }
  } catch (error) {
    console.error("Error starting progress:", error)
    return { success: false, error: "Failed to start progress" }
  }
}

export async function assignTicket(ticketId: string, assigneeUserId: string, userId?: string) {
  try {
    let currentUser = null
    if (userId) {
      currentUser = mockDb.users.find((u) => u.id === userId)
    }

    if (!currentUser || currentUser.role !== "agent") {
      return { success: false, error: "Admin access required" }
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assigneeUserId,
        assignedDate: new Date(),
      },
    })

    const assignee = mockDb.users.find((u) => u.id === assigneeUserId)
    await createAuditLog(
      ticketId,
      currentUser.id,
      currentUser.name,
      "assigned",
      undefined,
      assignee?.name || assigneeUserId,
    )

    revalidatePath(`/ticket/${ticketId}`)
    return { success: true }
  } catch (error) {
    console.error("Error assigning ticket:", error)
    return { success: false, error: "Failed to assign ticket" }
  }
}

export async function updateGitlabLink(ticketId: string, gitlabLink: string, userId?: string) {
  try {
    let currentUser = null
    if (userId) {
      currentUser = mockDb.users.find((u) => u.id === userId)
    }

    if (!currentUser || currentUser.role !== "agent") {
      return { success: false, error: "Admin access required" }
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { gitlabLink },
    })

    await createAuditLog(ticketId, currentUser.id, currentUser.name, "gitlab_linked", undefined, gitlabLink)

    revalidatePath(`/ticket/${ticketId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating GitLab link:", error)
    return { success: false, error: "Failed to update GitLab link" }
  }
}
