import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Zap, Clock } from "lucide-react"

interface ProjectClassificationBadgeProps {
  workflowType: string
  projectType?: string
  priority?: string
  className?: string
}

export function ProjectClassificationBadge({
  workflowType,
  projectType,
  priority,
  className,
}: ProjectClassificationBadgeProps) {
  const isProject =
    projectType === "Project" || ["White Label", "Data Migration", "Proposal Build"].includes(workflowType)

  if (isProject) {
    return (
      <Badge variant="secondary" className={`bg-amber-100 text-amber-800 border-amber-200 ${className}`}>
        <Briefcase className="h-3 w-3 mr-1" />
        Project
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={`bg-blue-50 text-blue-700 border-blue-200 ${className}`}>
      <Zap className="h-3 w-3 mr-1" />
      Workflow
    </Badge>
  )
}

export function ProjectTypeIndicator({
  workflowType,
  size = "sm",
}: {
  workflowType: string
  size?: "sm" | "md" | "lg"
}) {
  const isProject = ["White Label", "Data Migration", "Proposal Build"].includes(workflowType)

  const iconSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"

  if (isProject) {
    return (
      <div className="flex items-center gap-1 text-amber-600">
        <Briefcase className={iconSize} />
        <span className="text-xs font-medium">Project</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-blue-600">
      <Zap className={iconSize} />
      <span className="text-xs font-medium">Workflow</span>
    </div>
  )
}

export function ProjectMetricsCard({
  title,
  total,
  onTime,
  avgTime,
  timeUnit = "days",
  icon,
}: {
  title: string
  total: number
  onTime: number
  avgTime: number
  timeUnit?: "hours" | "days"
  icon?: React.ReactNode
}) {
  const onTimePercentage = total > 0 ? Math.round((onTime / total) * 100) : 0

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{total}</span>
          <Badge variant={onTimePercentage >= 80 ? "default" : "destructive"}>{onTimePercentage}% on time</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            Avg: {avgTime.toFixed(1)} {timeUnit}
          </span>
        </div>
      </div>
    </div>
  )
}
