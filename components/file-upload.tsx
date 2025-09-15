"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, File, ImageIcon, Video, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  acceptedTypes?: string[]
  maxFileSize?: number // in MB
  maxFiles?: number
  type?: "image" | "video" | "document"
  initialFiles?: File[] // Added prop to maintain state across tab switches
}

interface UploadedFile {
  file: File
  preview?: string
  uploading: boolean
  progress: number
  uploaded: boolean
  error?: string
}

export function FileUpload({
  onFilesChange,
  acceptedTypes = ["image/*", "video/*", ".pdf", ".doc", ".docx", ".txt"],
  maxFileSize = 50, // 50MB default
  maxFiles = 5,
  type = "document",
  initialFiles = [], // Default to empty array
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (initialFiles.length > 0) {
      const uploadedFiles: UploadedFile[] = initialFiles.map((file) => ({
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        uploading: false,
        progress: 100,
        uploaded: true,
      }))
      setFiles(uploadedFiles)
    } else if (initialFiles.length === 0 && files.length > 0) {
      // Clear files if parent state is cleared
      files.forEach((fileObj) => {
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview)
        }
      })
      setFiles([])
    }
  }, [initialFiles])

  const getAcceptedTypesForInput = () => {
    if (type === "image") return "image/*"
    if (type === "video") return "video/*"
    return acceptedTypes.join(",")
  }

  const getMaxSizeForType = () => {
    if (type === "video") return 100 // 100MB for videos
    if (type === "image") return 10 // 10MB for images
    return maxFileSize
  }

  const validateFile = (file: File): string | null => {
    const maxSize = getMaxSizeForType()
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    if (type === "image" && !file.type.startsWith("image/")) {
      return "Only image files are allowed"
    }

    if (type === "video" && !file.type.startsWith("video/")) {
      return "Only video files are allowed"
    }

    return null
  }

  const simulateUpload = (fileObj: UploadedFile): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setFiles((prev) =>
            prev.map((f) => (f.file === fileObj.file ? { ...f, uploading: false, uploaded: true, progress: 100 } : f)),
          )
          resolve()
        } else {
          setFiles((prev) => prev.map((f) => (f.file === fileObj.file ? { ...f, progress } : f)))
        }
      }, 200)
    })
  }

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)

      if (files.length + fileArray.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive",
        })
        return
      }

      const validFiles: UploadedFile[] = []

      for (const file of fileArray) {
        const error = validateFile(file)
        if (error) {
          toast({
            title: "Invalid file",
            description: `${file.name}: ${error}`,
            variant: "destructive",
          })
          continue
        }

        const fileObj: UploadedFile = {
          file,
          uploading: true,
          progress: 0,
          uploaded: false,
        }

        // Create preview for images
        if (file.type.startsWith("image/")) {
          fileObj.preview = URL.createObjectURL(file)
        }

        validFiles.push(fileObj)
      }

      if (validFiles.length === 0) return

      const newFilesList = [...files, ...validFiles]
      setFiles(newFilesList)

      onFilesChange(newFilesList.map((f) => f.file))

      // Simulate upload for each file
      for (const fileObj of validFiles) {
        await simulateUpload(fileObj)
      }
    },
    [files, maxFiles, onFilesChange, toast],
  )

  const removeFile = (index: number) => {
    const fileToRemove = files[index]
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }

    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesChange(newFiles.map((f) => f.file))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-green-500" />
    if (file.type.startsWith("video/")) return <Video className="h-4 w-4 text-blue-500" />
    return <File className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          Drop files here or{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            browse
          </Button>
        </p>
        <p className="text-xs text-muted-foreground">
          {type === "image" && "Images up to 10MB"}
          {type === "video" && "Videos up to 100MB"}
          {type === "document" && `Documents up to ${maxFileSize}MB`}
          {" • "}Maximum {maxFiles} files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptedTypesForInput()}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Uploaded Files ({files.length}/{maxFiles}):
          </p>
          {files.map((fileObj, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-md border">
              <div className="flex items-center gap-2">
                {getFileIcon(fileObj.file)}
                {fileObj.preview && (
                  <img
                    src={fileObj.preview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-8 w-8 object-cover rounded"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium truncate" title={fileObj.file.name}>
                    {fileObj.file.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(fileObj.file.size)}
                  </Badge>
                  {fileObj.uploaded && (
                    <Badge variant="default" className="text-xs bg-green-500">
                      <Check className="h-3 w-3 mr-1" />
                      Uploaded
                    </Badge>
                  )}
                  {fileObj.error && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                </div>

                {fileObj.uploading && <Progress value={fileObj.progress} className="h-1" />}

                {fileObj.error && <p className="text-xs text-destructive">{fileObj.error}</p>}
              </div>

              <Button
                type="button"
                onClick={() => removeFile(index)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                title="Remove file"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
