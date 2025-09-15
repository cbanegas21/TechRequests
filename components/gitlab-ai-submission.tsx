"use client"

import { useState } from "react"
import { Bot, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { generateGitlabTicket } from "@/lib/gitlab-ai"

interface GitlabAISubmissionProps {
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
    isInternal: boolean
  }>
}

export function GitlabAISubmission({ ticket, comments }: GitlabAISubmissionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [additionalContext, setAdditionalContext] = useState("")
  const [generatedEmail, setGeneratedEmail] = useState("")
  const { toast } = useToast()

  const handleGenerateTicket = async () => {
    setIsGenerating(true)
    try {
      const result = await generateGitlabTicket({
        ticket,
        comments: comments.filter((c) => !c.isInternal), // Only include public comments
        additionalContext,
      })

      if (result.success) {
        setGeneratedEmail(result.emailContent)
        toast({
          title: "GitLab Ticket Generated",
          description: "AI has generated the GitLab ticket content. Review and send when ready.",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate GitLab ticket",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendEmail = () => {
    // Create mailto link with the generated content
    const subject = `[${ticket.shortId}] ${ticket.title}`
    const to = "incoming+clienttether1-ct-tickets-54862706-issue-@incoming.gitlab.com"
    const body = encodeURIComponent(generatedEmail)

    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`
    window.open(mailtoLink, "_blank")

    toast({
      title: "Email Client Opened",
      description: "The GitLab ticket email has been prepared in your default email client.",
    })

    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200 hover:from-orange-500/20 hover:to-red-500/20"
        >
          <Bot className="h-4 w-4 mr-2" />
          Submit GitLab Ticket (AI)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI GitLab Ticket Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ticket Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <strong>ID:</strong> {ticket.shortId}
              </div>
              <div>
                <strong>Title:</strong> {ticket.title}
              </div>
              <div>
                <strong>Category:</strong> {ticket.category}
              </div>
              <div>
                <strong>Urgency:</strong> {ticket.urgency}
              </div>
              <div>
                <strong>Requester:</strong> {ticket.requesterName} ({ticket.requesterEmail})
              </div>
            </CardContent>
          </Card>

          {/* Additional Context */}
          <div>
            <Label htmlFor="additional-context">Additional Context (Optional)</Label>
            <Textarea
              id="additional-context"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Provide any additional technical details, debugging steps taken, or specific requirements for the GitLab ticket..."
              className="min-h-[100px]"
            />
          </div>

          {/* Generate Button */}
          {!generatedEmail && (
            <Button onClick={handleGenerateTicket} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI is analyzing ticket and generating GitLab content...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Generate GitLab Ticket with AI
                </>
              )}
            </Button>
          )}

          {/* Generated Email Content */}
          {generatedEmail && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Generated GitLab Ticket Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">
                    To: incoming+clienttether1-ct-tickets-54862706-issue-@incoming.gitlab.com
                  </div>
                  <div className="text-sm font-medium mb-4">
                    Subject: [{ticket.shortId}] {ticket.title}
                  </div>
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-background p-3 rounded border">
                    {generatedEmail}
                  </pre>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSendEmail} className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Open in Email Client
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedEmail("")
                      setAdditionalContext("")
                    }}
                  >
                    Regenerate
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
