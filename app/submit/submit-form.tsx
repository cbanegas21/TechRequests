"use client"

import { useState, useEffect } from "react"
import { submitTicket } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedAttachmentManager } from "@/components/enhanced-attachment-manager"
import { UrgencyPill } from "@/components/urgency-pill"
import { CATEGORIES, PRIORITY_LEVELS, WORKFLOW_TYPES, isProjectType } from "@/lib/ticket-utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { AlertTriangle, RotateCcw } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface SubmitFormProps {
  users: User[]
}

export function SubmitForm({ users }: SubmitFormProps) {
  const { user } = useAuth() // Added auth to auto-fill requester info
  const [requesterType, setRequesterType] = useState<"existing" | "new">("existing")
  const [attachments, setAttachments] = useState<string[]>([])
  const [videoAttachments, setVideoAttachments] = useState<string[]>([])
  const [imageAttachments, setImageAttachments] = useState<string[]>([])
  const [evidenceAttachments, setEvidenceAttachments] = useState<string[]>([])
  const [selectedWorkflowType, setSelectedWorkflowType] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [documentFiles, setDocumentFiles] = useState<File[]>([])

  const { toast } = useToast()

  const clientTetherTeam = users.filter((user) => user.role === "csp")

  useEffect(() => {
    if (user) {
      setRequesterType("existing")
    }
  }, [user])

  const resetForm = () => {
    setRequesterType(user ? "existing" : "existing")
    setAttachments([])
    setVideoAttachments([])
    setImageAttachments([])
    setEvidenceAttachments([])
    setSelectedWorkflowType("")
    setVideoFiles([])
    setImageFiles([])
    setDocumentFiles([])
    setIsSubmitting(false)

    // Force component remount to clear all form inputs
    setFormKey((prev) => prev + 1)

    toast({
      title: "Form Reset",
      description: "The form has been cleared and is ready for a new submission.",
    })
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("reset") === "true") {
      setTimeout(() => {
        resetForm()
      }, 100)

      // Clean up URL without causing navigation issues
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [window.location.search]) // Add dependency on window.location.search to trigger on URL changes

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      // Add all the attachment data to formData
      formData.set("attachments", JSON.stringify(attachments))
      formData.set("videoAttachments", JSON.stringify(videoAttachments))
      formData.set("imageAttachments", JSON.stringify(imageAttachments))
      formData.set("evidenceAttachments", JSON.stringify(evidenceAttachments))
      formData.set("requesterType", requesterType)
      formData.set("projectType", isProjectType(selectedWorkflowType) ? "Project" : "Workflow")

      // Add uploaded files to form data
      videoFiles.forEach((file, index) => {
        formData.append(`videoFile_${index}`, file)
      })
      imageFiles.forEach((file, index) => {
        formData.append(`imageFile_${index}`, file)
      })
      documentFiles.forEach((file, index) => {
        formData.append(`documentFile_${index}`, file)
      })

      // Call the server action - it will handle the redirect
      await submitTicket(formData)
    } catch (error) {
      console.error("[v0] Submit error:", error)
      toast({
        title: "Error",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6" key={formKey}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={resetForm} className="flex items-center gap-2 bg-transparent">
          <RotateCcw className="h-4 w-4" />
          Reset Form
        </Button>
      </div>

      <form action={submitTicket} className="space-y-6">
        {/* Requester Information */}
        <Card>
          <CardHeader>
            <CardTitle>Requester Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="bg-muted/50 p-4 rounded-lg border">
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-base font-medium">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-base">{user.email}</p>
                  </div>
                </div>
                <input type="hidden" name="existingUser" value={user.id} />
                <input type="hidden" name="requesterType" value="existing" />
              </div>
            ) : (
              <div>
                <Label className="text-base font-medium">I am:</Label>
                <RadioGroup
                  value={requesterType}
                  onValueChange={(value) => setRequesterType(value as "existing" | "new")}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing">A ClientTether team member</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new">Someone else (customer, external user)</Label>
                  </div>
                </RadioGroup>

                {requesterType === "existing" ? (
                  <div className="mt-4">
                    <Label htmlFor="existingUser">Select your name</Label>
                    <Select name="existingUser" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your name..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clientTetherTeam.map((teamUser) => (
                          <SelectItem key={teamUser.id} value={teamUser.id}>
                            {teamUser.name} ({teamUser.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="requesterName">Full Name *</Label>
                      <Input id="requesterName" name="requesterName" required placeholder="Enter your full name" />
                    </div>
                    <div>
                      <Label htmlFor="requesterEmail">Email Address *</Label>
                      <Input
                        id="requesterEmail"
                        name="requesterEmail"
                        type="email"
                        required
                        placeholder="your.email@company.com"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <input type="hidden" name="attachments" value={JSON.stringify(attachments)} />
            <input type="hidden" name="videoAttachments" value={JSON.stringify(videoAttachments)} />
            <input type="hidden" name="imageAttachments" value={JSON.stringify(imageAttachments)} />
            <input type="hidden" name="evidenceAttachments" value={JSON.stringify(evidenceAttachments)} />
            <input
              type="hidden"
              name="projectType"
              value={isProjectType(selectedWorkflowType) ? "Project" : "Workflow"}
            />
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required placeholder="Brief description of the issue or request" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="workflowType">Workflow Type *</Label>
                <Select name="workflowType" required onValueChange={setSelectedWorkflowType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFLOW_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {isProjectType(type) && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                          {type}
                          {isProjectType(type) && <span className="text-xs text-amber-600">(Project)</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority Level *</Label>
                <Select name="priority" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                          <UrgencyPill urgency={priority} />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="accountId">Account ID (Optional)</Label>
              <Input id="accountId" name="accountId" placeholder="Enter the client's account ID if applicable" />
            </div>

            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                name="description"
                required
                rows={6}
                placeholder="Please provide a detailed description of the issue or request. Include steps to reproduce, expected behavior, and any error messages."
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Desired Due Date (Optional)</Label>
              <Input id="dueDate" name="dueDate" type="date" min={new Date().toISOString().split("T")[0]} />
            </div>
          </CardContent>
        </Card>

        <EnhancedAttachmentManager
          videoAttachments={videoAttachments}
          onVideoAttachmentsChange={setVideoAttachments}
          imageAttachments={imageAttachments}
          onImageAttachmentsChange={setImageAttachments}
          evidenceAttachments={evidenceAttachments}
          onEvidenceAttachmentsChange={setEvidenceAttachments}
          generalAttachments={attachments}
          onGeneralAttachmentsChange={setAttachments}
          onVideoFilesChange={setVideoFiles}
          onImageFilesChange={setImageFiles}
          onDocumentFilesChange={setDocumentFiles}
          initialVideoFiles={videoFiles}
          initialImageFiles={imageFiles}
          initialDocumentFiles={documentFiles}
        />

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? "Submitting..." : "Submit Tech Request"}
          </Button>
        </div>
      </form>
    </div>
  )
}
