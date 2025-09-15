import { prisma } from "@/lib/db"
import { generateTicketShortId } from "@/lib/ticket-utils"
import { emailService } from "@/lib/email-service"
import { redirect } from "next/navigation"

export async function submitTicket(formData: FormData) {
  // Extract form data
  const requesterType = formData.get("requesterType") as string
  const existingUserId = formData.get("existingUser") as string
  const requesterName = formData.get("requesterName") as string
  const requesterEmail = formData.get("requesterEmail") as string
  const accountId = formData.get("accountId") as string
  const title = formData.get("title") as string
  const category = formData.get("category") as string
  const workflowType = formData.get("workflowType") as string
  const priority = formData.get("priority") as string
  const projectType = formData.get("projectType") as string
  const description = formData.get("description") as string
  const attachments = formData.get("attachments") as string
  const videoAttachments = formData.get("videoAttachments") as string
  const imageAttachments = formData.get("imageAttachments") as string
  const evidenceAttachments = formData.get("evidenceAttachments") as string
  const emailNotifications = formData.get("emailNotifications") as string
  const dueDate = formData.get("dueDate") as string

  if (!title || !description || !category || !workflowType || !priority) {
    throw new Error("Missing required fields")
  }

  let ticketShortId: string

  try {
    // Generate unique ticket ID
    const shortId = await generateTicketShortId()
    ticketShortId = shortId

    const allAttachments = {
      general: attachments ? JSON.parse(attachments) : [],
      videos: videoAttachments ? JSON.parse(videoAttachments) : [],
      images: imageAttachments ? JSON.parse(imageAttachments) : [],
      evidence: evidenceAttachments ? JSON.parse(evidenceAttachments) : [],
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        shortId,
        title,
        description,
        requesterUserId: requesterType === "existing" ? existingUserId : null,
        requesterName: requesterType === "new" ? requesterName : null,
        requesterEmail: requesterType === "new" ? requesterEmail : null,
        accountName: accountId ? `ClientTether (${accountId})` : "ClientTether",
        category,
        workflowType,
        priority,
        projectType,
        status: "New Tech Request",
        attachments: JSON.stringify(allAttachments),
        emailNotifications: emailNotifications ? JSON.parse(emailNotifications) : [],
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    // Create SLA record
    await prisma.sLA.create({
      data: {
        ticketId: ticket.id,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        ticketId: ticket.id,
        actorUserId: requesterType === "existing" ? existingUserId : null,
        actorName: requesterType === "new" ? requesterName : "System",
        action: "ticket_created",
        toValue: "New Tech Request",
      },
    })

    const emailList = emailNotifications ? JSON.parse(emailNotifications) : []

    // Add requester email to notification list
    const requesterEmailAddr =
      requesterType === "existing"
        ? (await prisma.user.findUnique({ where: { id: existingUserId } }))?.email
        : requesterEmail

    if (requesterEmailAddr && !emailList.includes(requesterEmailAddr)) {
      emailList.push(requesterEmailAddr)
    }

    if (emailList.length > 0) {
      const ticketUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/ticket/${shortId}`

      await emailService.sendTicketCreatedNotification(
        {
          ticketId: ticket.id,
          shortId,
          title,
          status: "New Tech Request",
          requesterName:
            requesterType === "existing"
              ? (await prisma.user.findUnique({ where: { id: existingUserId } }))?.name || "Unknown"
              : requesterName || "Unknown",
          requesterEmail: requesterEmailAddr || "",
          priority,
          workflowType,
          description,
          url: ticketUrl,
        },
        emailList,
      )
    }
  } catch (error) {
    console.error("Error submitting ticket:", error)
    throw new Error("Failed to submit ticket. Please try again.")
  }

  redirect(`/submit/success?ticketId=${ticketShortId}`)
}
