import { Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SLAIndicatorProps {
  ticket: {
    createdAt: string
    sla?: {
      firstResponseAt?: string | null
      resolvedAt?: string | null
      reopenedCount: number
    }
  }
}

export function SLAIndicator({ ticket }: SLAIndicatorProps) {
  const createdAt = new Date(ticket.createdAt)
  const now = new Date()

  const firstResponseAt = ticket.sla?.firstResponseAt ? new Date(ticket.sla.firstResponseAt) : null
  const resolvedAt = ticket.sla?.resolvedAt ? new Date(ticket.sla.resolvedAt) : null

  // Calculate response time
  const responseTimeHours = firstResponseAt
    ? Math.round((firstResponseAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
    : Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))

  // Calculate resolution time
  const resolutionTimeHours = resolvedAt
    ? Math.round((resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
    : Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))

  // SLA thresholds (configurable via env in real app)
  const responseThresholdHours = 24
  const resolutionThresholdHours = 7 * 24 // 7 days

  const isResponseBreached = responseTimeHours > responseThresholdHours && !firstResponseAt
  const isResolutionBreached = resolutionTimeHours > resolutionThresholdHours && !resolvedAt

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          SLA Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">First Response</span>
            {firstResponseAt ? (
              <Badge variant="outline" className="text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {responseTimeHours}h
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={isResponseBreached ? "text-red-700 border-red-200" : "text-yellow-700 border-yellow-200"}
              >
                {isResponseBreached && <AlertTriangle className="h-3 w-3 mr-1" />}
                {responseTimeHours}h
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Resolution</span>
            {resolvedAt ? (
              <Badge variant="outline" className="text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {Math.round(resolutionTimeHours / 24)}d
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={isResolutionBreached ? "text-red-700 border-red-200" : "text-blue-700 border-blue-200"}
              >
                {isResolutionBreached && <AlertTriangle className="h-3 w-3 mr-1" />}
                {Math.round(resolutionTimeHours / 24)}d
              </Badge>
            )}
          </div>

          {ticket.sla && ticket.sla.reopenedCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reopened</span>
              <Badge variant="outline" className="text-orange-700 border-orange-200">
                {ticket.sla.reopenedCount}x
              </Badge>
            </div>
          )}
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground">
          <div>Response SLA: {responseThresholdHours}h</div>
          <div>Resolution SLA: {resolutionThresholdHours / 24}d</div>
        </div>
      </CardContent>
    </Card>
  )
}
