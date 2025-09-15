interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface TicketEmailData {
  ticketId: string
  shortId: string
  title: string
  status: string
  requesterName: string
  requesterEmail: string
  assigneeName?: string
  priority: string
  workflowType: string
  description: string
  url: string
}

interface CommentEmailData extends TicketEmailData {
  commentAuthor: string
  commentBody: string
  isInternal: boolean
}

class EmailService {
  private baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"

  private generateTicketCreatedTemplate(data: TicketEmailData): EmailTemplate {
    const subject = `New Tech Request: ${data.shortId} - ${data.title}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">New Tech Request Submitted</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #0ea5e9; margin-top: 0;">Ticket ${data.shortId}</h3>
          <h4 style="color: #334155; margin: 10px 0;">${data.title}</h4>
          
          <div style="margin: 20px 0;">
            <p><strong>Submitted by:</strong> ${data.requesterName}</p>
            <p><strong>Priority:</strong> <span style="background: #fef3c7; padding: 2px 8px; border-radius: 4px;">${data.priority}</span></p>
            <p><strong>Type:</strong> ${data.workflowType}</p>
            <p><strong>Status:</strong> ${data.status}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 6px;">
            <p style="margin: 0;"><strong>Description:</strong></p>
            <p style="margin: 10px 0 0 0;">${data.description}</p>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${data.url}" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Ticket</a>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 6px; font-size: 12px; color: #64748b;">
          <p>This is an automated notification from ClientTether Tech Requests. You're receiving this because you're listed in the email notifications for this ticket.</p>
        </div>
      </div>
    `

    const text = `
New Tech Request: ${data.shortId} - ${data.title}

Submitted by: ${data.requesterName}
Priority: ${data.priority}
Type: ${data.workflowType}
Status: ${data.status}

Description:
${data.description}

View ticket: ${data.url}
    `

    return { subject, html, text }
  }

  private generateStatusUpdateTemplate(data: TicketEmailData, oldStatus: string): EmailTemplate {
    const subject = `Status Update: ${data.shortId} - ${oldStatus} → ${data.status}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">Ticket Status Updated</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #0ea5e9; margin-top: 0;">Ticket ${data.shortId}</h3>
          <h4 style="color: #334155; margin: 10px 0;">${data.title}</h4>
          
          <div style="margin: 20px 0; padding: 15px; background: #ecfdf5; border: 1px solid #10b981; border-radius: 6px;">
            <p style="margin: 0; color: #065f46;"><strong>Status changed from "${oldStatus}" to "${data.status}"</strong></p>
            ${data.assigneeName ? `<p style="margin: 10px 0 0 0; color: #065f46;">Assigned to: ${data.assigneeName}</p>` : ""}
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${data.url}" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Ticket</a>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 6px; font-size: 12px; color: #64748b;">
          <p>This is an automated notification from ClientTether Tech Requests.</p>
        </div>
      </div>
    `

    const text = `
Ticket Status Updated: ${data.shortId}

${data.title}

Status changed from "${oldStatus}" to "${data.status}"
${data.assigneeName ? `Assigned to: ${data.assigneeName}` : ""}

View ticket: ${data.url}
    `

    return { subject, html, text }
  }

  private generateCommentTemplate(data: CommentEmailData): EmailTemplate {
    const subject = `New Comment: ${data.shortId} - ${data.title}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">New Comment Added</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #0ea5e9; margin-top: 0;">Ticket ${data.shortId}</h3>
          <h4 style="color: #334155; margin: 10px 0;">${data.title}</h4>
          
          <div style="margin: 20px 0;">
            <p><strong>Comment by:</strong> ${data.commentAuthor} ${data.isInternal ? '<span style="background: #fef3c7; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Internal</span>' : ""}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background: #f8fafc; border-left: 4px solid #0ea5e9; border-radius: 0 6px 6px 0;">
            <p style="margin: 0;">${data.commentBody}</p>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${data.url}" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Ticket</a>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 6px; font-size: 12px; color: #64748b;">
          <p>This is an automated notification from ClientTether Tech Requests.</p>
        </div>
      </div>
    `

    const text = `
New Comment: ${data.shortId} - ${data.title}

Comment by: ${data.commentAuthor}${data.isInternal ? " (Internal)" : ""}

${data.commentBody}

View ticket: ${data.url}
    `

    return { subject, html, text }
  }

  private async sendEmail(to: string[], template: EmailTemplate): Promise<boolean> {
    try {
      // In production, replace with actual email service like Resend, SendGrid, or AWS SES
      if (process.env.NODE_ENV === "development") {
        // Development logging
        console.log("[v0] Email Service - Sending email:", {
          to,
          subject: template.subject,
          preview: template.text.substring(0, 100) + "...",
        })
        return true
      }

      // Production email sending would go here
      // Example with Resend:
      // const { data, error } = await resend.emails.send({
      //   from: 'ClientTether Tech Requests <noreply@clienttether.com>',
      //   to,
      //   subject: template.subject,
      //   html: template.html,
      //   text: template.text,
      // })

      return true
    } catch (error) {
      console.error("[v0] Email Service - Failed to send email:", error)
      return false
    }
  }

  async sendTicketCreatedNotification(ticketData: TicketEmailData, emailList: string[]): Promise<boolean> {
    if (emailList.length === 0) return true

    const template = this.generateTicketCreatedTemplate(ticketData)
    return this.sendEmail(emailList, template)
  }

  async sendStatusUpdateNotification(
    ticketData: TicketEmailData,
    oldStatus: string,
    emailList: string[],
  ): Promise<boolean> {
    if (emailList.length === 0) return true

    const template = this.generateStatusUpdateTemplate(ticketData, oldStatus)
    return this.sendEmail(emailList, template)
  }

  async sendCommentNotification(commentData: CommentEmailData, emailList: string[]): Promise<boolean> {
    if (emailList.length === 0) return true

    // Don't send internal comment notifications to non-agents
    const filteredEmailList = commentData.isInternal
      ? emailList.filter((email) => email.endsWith("@clienttether.com"))
      : emailList

    if (filteredEmailList.length === 0) return true

    const template = this.generateCommentTemplate(commentData)
    return this.sendEmail(filteredEmailList, template)
  }
}

export const emailService = new EmailService()
