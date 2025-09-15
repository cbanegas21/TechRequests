"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { AttachmentList } from "@/components/attachment-list"
import { Upload, Video, ImageIcon, FileText } from "lucide-react"

interface EnhancedAttachmentManagerProps {
  videoAttachments: string[]
  onVideoAttachmentsChange: (attachments: string[]) => void
  imageAttachments: string[]
  onImageAttachmentsChange: (attachments: string[]) => void
  evidenceAttachments: string[]
  onEvidenceAttachmentsChange: (attachments: string[]) => void
  generalAttachments: string[]
  onGeneralAttachmentsChange: (attachments: string[]) => void
  onVideoFilesChange?: (files: File[]) => void
  onImageFilesChange?: (files: File[]) => void
  onDocumentFilesChange?: (files: File[]) => void
  initialVideoFiles?: File[]
  initialImageFiles?: File[]
  initialDocumentFiles?: File[]
}

export function EnhancedAttachmentManager({
  videoAttachments,
  onVideoAttachmentsChange,
  imageAttachments,
  onImageAttachmentsChange,
  evidenceAttachments,
  onEvidenceAttachmentsChange,
  generalAttachments,
  onGeneralAttachmentsChange,
  onVideoFilesChange = () => {},
  onImageFilesChange = () => {},
  onDocumentFilesChange = () => {},
  initialVideoFiles = [],
  initialImageFiles = [],
  initialDocumentFiles = [],
}: EnhancedAttachmentManagerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information & Evidence</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="evidence" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Evidence
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Upload Video Files</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Upload video files directly (MP4, MOV, AVI, WebM) - Max 100MB per file
              </p>
              <FileUpload
                type="video"
                maxFileSize={100}
                maxFiles={3}
                onFilesChange={onVideoFilesChange}
                acceptedTypes={["video/*"]}
                initialFiles={initialVideoFiles}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Video Links</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Add URLs to Fathom recordings, Zoom videos, or other video platforms
              </p>
              <AttachmentList
                attachments={videoAttachments}
                onAttachmentsChange={onVideoAttachmentsChange}
                placeholder="https://fathom.video/... or https://zoom.us/rec/..."
                type="video"
              />
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Upload Images</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Upload screenshots or images directly (JPG, PNG, GIF, WebP) - Max 10MB per file
              </p>
              <FileUpload
                type="image"
                maxFileSize={10}
                maxFiles={5}
                onFilesChange={onImageFilesChange}
                acceptedTypes={["image/*"]}
                initialFiles={initialImageFiles}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Image Links</h4>
              <p className="text-sm text-muted-foreground mb-3">Add URLs to screenshots or images hosted elsewhere</p>
              <AttachmentList
                attachments={imageAttachments}
                onAttachmentsChange={onImageAttachmentsChange}
                placeholder="https://example.com/screenshot.png or image URL..."
                type="image"
              />
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Evidence & Logs</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Add URLs to logs, error reports, or other evidence that supports this request
              </p>
              <AttachmentList
                attachments={evidenceAttachments}
                onAttachmentsChange={onEvidenceAttachmentsChange}
                placeholder="https://example.com/error-log.txt or evidence URL..."
                type="evidence"
              />
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Upload Documents</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Upload documents, specifications, or other files (PDF, DOC, TXT) - Max 50MB per file
              </p>
              <FileUpload
                type="document"
                maxFileSize={50}
                maxFiles={5}
                onFilesChange={onDocumentFilesChange}
                acceptedTypes={[".pdf", ".doc", ".docx", ".txt", ".csv", ".xlsx"]}
                initialFiles={initialDocumentFiles}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Document Links</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Add URLs to relevant documents, specifications, or other resources
              </p>
              <AttachmentList
                attachments={generalAttachments}
                onAttachmentsChange={onGeneralAttachmentsChange}
                placeholder="https://example.com/document.pdf or file URL..."
                type="general"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
