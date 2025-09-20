"use server"
export const runtime = "nodejs"

import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth-lite"

export async function submitTicket(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const priority = formData.get("priority") as string

  if (!title || !description) {
    return { success: false, error: "Title and description are required" }
  }

  try {
    const user = getUser()
    const requesterName = user?.name || name || null
    const requesterEmail = user?.email || email || null

    // Generate unique shortId
    let shortId: string
    let attempts = 0
    do {
      const num = Math.floor(Math.random() * 9999) + 1
      shortId = `TR-${num.toString().padStart(4, "0")}`
      attempts++

      const existing = await prisma.ticket.findUnique({
        where: { shortId },
      })

      if (!existing) break

      if (attempts > 10) {
        throw new Error("Could not generate unique ticket ID")
      }
    } while (true)

    // Create ticket
    await prisma.ticket.create({
      data: {
        shortId,
        title,
        description,
        priority: priority || "Medium",
        requesterName,
        requesterEmail,
        status: "New",
      },
    })

    redirect(`/ticket/${shortId}`)
  } catch (error) {
    console.error("Failed to create ticket:", error)
    return { success: false, error: "Failed to create ticket" }
  }
}
