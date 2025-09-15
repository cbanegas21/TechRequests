"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X, Link, Video, ImageIcon, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface AttachmentListProps {
  attachments: string[]
  onAttachmentsChange: (attachments: string[]) => void
  placeholder?: string
  type?: "general" | "video" | "image" | "evidence"
}

export function AttachmentList({
  attachments,
  onAttachmentsChange,
  placeholder = "https://example.com/document.pdf",
  type = "general",
}: AttachmentListProps) {
  const [newUrl, setNewUrl] = useState("")

  const addAttachment = () => {
    const trimmedUrl = newUrl.trim()
    if (trimmedUrl && !attachments.includes(trimmedUrl)) {
      onAttachmentsChange([...attachments, trimmedUrl])
      setNewUrl("")
    }
  }

  const removeAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addAttachment()
    }
  }

  const getAttachmentIcon = (url: string) => {
    const lowerUrl = url.toLowerCase()

    if (
      type === "video" ||
      lowerUrl.includes("fathom") ||
      lowerUrl.includes("zoom") ||
      lowerUrl.includes("loom") ||
      lowerUrl.match(/\.(mp4|mov|avi|webm)$/)
    ) {
      return <Video className="h-4 w-4 text-blue-500" />
    }

    if (type === "image" || lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      return <ImageIcon className="h-4 w-4 text-green-500" />
    }

    if (type === "evidence" || lowerUrl.includes("log") || lowerUrl.includes("error")) {
      return <FileText className="h-4 w-4 text-amber-500" />
    }

    return <Link className="h-4 w-4 text-muted-foreground" />
  }

  const getAttachmentType = (url: string) => {
    const lowerUrl = url.toLowerCase()

    if (lowerUrl.includes("fathom")) return "Fathom Recording"
    if (lowerUrl.includes("zoom")) return "Zoom Recording"
    if (lowerUrl.includes("loom")) return "Loom Video"
    if (lowerUrl.match(/\.(mp4|mov|avi|webm)$/)) return "Video File"
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "Image"
    if (lowerUrl.match(/\.(pdf)$/)) return "PDF Document"
    if (lowerUrl.includes("log") || lowerUrl.includes("error")) return "Log File"

    return "Link"
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full"
          />
        </div>
        <Button type="button" onClick={addAttachment} disabled={!newUrl.trim()} size="sm" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Attached{" "}
            {type === "general" ? "Files" : type === "video" ? "Videos" : type === "image" ? "Images" : "Evidence"} (
            {attachments.length}):
          </Label>
          {attachments.map((url, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-md border">
              {getAttachmentIcon(url)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium truncate" title={url}>
                    {url.split("/").pop() || url}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {getAttachmentType(url)}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground truncate block" title={url}>
                  {url}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  onClick={() => window.open(url, "_blank")}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  title="Open in new tab"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  title="Remove attachment"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
