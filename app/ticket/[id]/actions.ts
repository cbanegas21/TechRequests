"use server"
export const runtime = "nodejs"

import { prisma } from "@/lib/db"
import { getUser, isAdminOrAgent } from "@/lib/auth-lite"

export async function updateTicketStatus(ticketId: string, newStatus: string, actorUserId: string) {
  if (!isAdminOrAgent()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: newStatus },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update status" }
  }
}

export async function assignTicket(ticketId: string, assigneeId: string, actorUserId: string) {
  if (!isAdminOrAgent()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { assigneeUserId: assigneeId },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to assign ticket" }
  }
}

export async function updateGitlabLink(ticketId: string, gitlabUrl: string, actorUserId: string) {
  if (!isAdminOrAgent()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { gitlabLink: gitlabUrl },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update GitLab link" }
  }
}

export async function addComment(ticketShortId: string, body: string, authorName?: string, authorEmail?: string) {
  try {
    const u = getUser()
    if (u?.role === "csp") {
      const t = await prisma.ticket.findUnique({
        where: { shortId: ticketShortId },
        select: { requesterEmail: true },
      })
      if (!t || t.requesterEmail?.toLowerCase() !== (u.email || "").toLowerCase()) {
        return { success: false, error: "Unauthorized" }
      }
    }

    // Find ticket by shortId
    const ticket = await prisma.ticket.findUnique({
      where: { shortId: ticketShortId },
    })

    if (!ticket) {
      return { success: false, error: "Ticket not found" }
    }

    // Create comment
    await prisma.comment.create({
      data: {
        ticketId: ticket.id,
        body,
        authorName: authorName || null,
        authorEmail: authorEmail || null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to add comment:", error)
    return { success: false, error: "Failed to add comment" }
  }
}
