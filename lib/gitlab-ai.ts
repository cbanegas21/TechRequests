import { generateText } from "ai"

interface GitlabTicketData {
  ticket: {
    id: string
    shortId: string
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
  comments: Array<{
    id: string
    content: string
    authorName: string
    createdAt: Date
  }>
  additionalContext?: string
}

export async function generateGitlabTicket(data: GitlabTicketData) {
  try {
    const { ticket, comments, additionalContext } = data

    // Prepare the context for AI
    const ticketContext = `
TICKET INFORMATION:
- ID: ${ticket.shortId}
- Title: ${ticket.title}
- Category: ${ticket.category}
- Urgency: ${ticket.urgency}
- Requester: ${ticket.requesterName} (${ticket.requesterEmail})
- Description: ${ticket.description}

COMMENTS THREAD:
${comments
  .map((comment) => `[${comment.createdAt.toLocaleString()}] ${comment.authorName}: ${comment.content}`)
  .join("\n")}

ATTACHMENTS:
${ticket.attachments?.length ? `Files: ${ticket.attachments.join(", ")}` : "No file attachments"}
${ticket.videoAttachments?.length ? `Videos: ${ticket.videoAttachments.join(", ")}` : "No video attachments"}
${ticket.imageAttachments?.length ? `Images: ${ticket.imageAttachments.join(", ")}` : "No image attachments"}

ADDITIONAL CONTEXT:
${additionalContext || "None provided"}
`

    const prompt = `
You are a technical support specialist at ClientTether creating a GitLab issue from a tech request ticket. 

Based on the following ticket information, generate a professional GitLab issue email that includes:

1. **Description**: Clear summary of the issue/feature request
2. **Steps to Reproduce**: Detailed steps if it's a bug (if not applicable, write "N/A - Feature Request" or similar)
3. **Actual Result**: What currently happens (for bugs) or current state (for features)
4. **Expected Result**: What should happen or what the desired outcome is
5. **Additional Information**: Any relevant technical details, environment info, or context

Format the email as a professional technical issue report. Be concise but thorough. If there are attachments mentioned, reference them appropriately.

TICKET DATA:
${ticketContext}

Generate a well-structured email body that a developer can immediately understand and act upon:
`

    const { text } = await generateText({
      model: "llama-3.1-70b-versatile",
      prompt,
      maxTokens: 1500,
    })

    return {
      success: true,
      emailContent: text,
    }
  } catch (error) {
    console.error("Error generating GitLab ticket:", error)
    return {
      success: false,
      error: "Failed to generate GitLab ticket content",
    }
  }
}
