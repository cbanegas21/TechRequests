"use client"

import { Video, ImageIcon, FileText, ExternalLink, Download, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EnhancedAttachmentsDisplayProps {
  attachments?: string[]
  videoAttachments?: string[]
  imageAttachments?: string[]
  evidenceAttachments?: string[]
}

export function EnhancedAttachmentsDisplay({
  attachments = [],
  videoAttachments = [],
  imageAttachments = [],
  evidenceAttachments = [],
}: EnhancedAttachmentsDisplayProps) {
  const totalAttachments =
    attachments.length + videoAttachments.length + imageAttachments.length + evidenceAttachments.length

  if (totalAttachments === 0) {
    return null
  }

  const AttachmentItem = ({ url, type }: { url: string; type: "video" | "image" | "evidence" | "general" }) => {
    const getIcon = () => {
      switch (type) {
        case "video":
          return <Video className="h-4 w-4 text-blue-500" />
        case "image":
          return <ImageIcon className="h-4 w-4 text-green-500" />
        case "evidence":
          return <FileText className="h-4 w-4 text-amber-500" />
        default:
          return <ExternalLink className="h-4 w-4 text-muted-foreground" />
      }
    }

    const getTypeLabel = () => {
      const lowerUrl = url.toLowerCase()
      if (lowerUrl.includes("fathom")) return "Fathom Recording"
      if (lowerUrl.includes("zoom")) return "Zoom Recording"
      if (lowerUrl.includes("loom")) return "Loom Video"
      if (lowerUrl.match(/\.(mp4|mov|avi|webm)$/)) return "Video File"
      if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "Image"
      if (lowerUrl.match(/\.(pdf)$/)) return "PDF Document"
      if (lowerUrl.includes("log") || lowerUrl.includes("error")) return "Log File"
      return "Document"
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md border">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium truncate" title={url}>
              {url.split("/").pop() || url}
            </span>
            <Badge variant="outline" className="text-xs">
              {getTypeLabel()}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground truncate block" title={url}>
            {url}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {type === "image" && (
            <Button
              onClick={() => window.open(url, "_blank")}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Preview image"
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
          <Button
            onClick={() => window.open(url, "_blank")}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            title="Open in new tab"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Attachments & Evidence ({totalAttachments})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({totalAttachments})</TabsTrigger>
            <TabsTrigger value="videos" disabled={videoAttachments.length === 0}>
              Videos ({videoAttachments.length})
            </TabsTrigger>
            <TabsTrigger value="images" disabled={imageAttachments.length === 0}>
              Images ({imageAttachments.length})
            </TabsTrigger>
            <TabsTrigger value="evidence" disabled={evidenceAttachments.length === 0}>
              Evidence ({evidenceAttachments.length})
            </TabsTrigger>
            <TabsTrigger value="files" disabled={attachments.length === 0}>
              Files ({attachments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {videoAttachments.map((url, index) => (
              <AttachmentItem key={`video-${index}`} url={url} type="video" />
            ))}
            {imageAttachments.map((url, index) => (
              <AttachmentItem key={`image-${index}`} url={url} type="image" />
            ))}
            {evidenceAttachments.map((url, index) => (
              <AttachmentItem key={`evidence-${index}`} url={url} type="evidence" />
            ))}
            {attachments.map((url, index) => (
              <AttachmentItem key={`file-${index}`} url={url} type="general" />
            ))}
          </TabsContent>

          <TabsContent value="videos" className="space-y-3 mt-4">
            {videoAttachments.map((url, index) => (
              <AttachmentItem key={index} url={url} type="video" />
            ))}
          </TabsContent>

          <TabsContent value="images" className="space-y-3 mt-4">
            {imageAttachments.map((url, index) => (
              <AttachmentItem key={index} url={url} type="image" />
            ))}
          </TabsContent>

          <TabsContent value="evidence" className="space-y-3 mt-4">
            {evidenceAttachments.map((url, index) => (
              <AttachmentItem key={index} url={url} type="evidence" />
            ))}
          </TabsContent>

          <TabsContent value="files" className="space-y-3 mt-4">
            {attachments.map((url, index) => (
              <AttachmentItem key={index} url={url} type="general" />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
