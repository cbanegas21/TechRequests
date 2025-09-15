"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { AgentMetrics } from "@/lib/kpi-utils"
import { exportToCSV } from "@/lib/kpi-utils"

interface AgentMetricsTableProps {
  metrics: AgentMetrics[]
}

export function AgentMetricsTable({ metrics }: AgentMetricsTableProps) {
  const formatHours = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours)}h`
    }
    return `${Math.round(hours / 24)}d`
  }

  const getSLABadgeColor = (percent: number) => {
    if (percent >= 90) return "bg-green-100 text-green-800 border-green-200"
    if (percent >= 75) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const handleExport = () => {
    const exportData = metrics.map((metric) => ({
      "Agent Name": metric.agentName,
      "Tickets Assigned": metric.ticketsAssigned,
      "Tickets Resolved": metric.ticketsResolved,
      "Avg Response Time (hours)": Math.round(metric.avgResponseHours * 100) / 100,
      "Avg Resolution Time (hours)": Math.round(metric.avgResolutionHours * 100) / 100,
      "SLA Compliance (%)": Math.round(metric.slaCompliancePercent * 100) / 100,
    }))

    exportToCSV(exportData, `agent-metrics-${new Date().toISOString().split("T")[0]}.csv`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Agent Performance Metrics</CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Resolved</TableHead>
                <TableHead className="text-right">Avg Response</TableHead>
                <TableHead className="text-right">Avg Resolution</TableHead>
                <TableHead className="text-right">SLA Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No agent metrics available
                  </TableCell>
                </TableRow>
              ) : (
                metrics.map((metric) => (
                  <TableRow key={metric.agentId}>
                    <TableCell className="font-medium">{metric.agentName}</TableCell>
                    <TableCell className="text-right">{metric.ticketsAssigned}</TableCell>
                    <TableCell className="text-right">{metric.ticketsResolved}</TableCell>
                    <TableCell className="text-right">
                      {metric.avgResponseHours > 0 ? formatHours(metric.avgResponseHours) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {metric.avgResolutionHours > 0 ? formatHours(metric.avgResolutionHours) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={getSLABadgeColor(metric.slaCompliancePercent)}>
                        {Math.round(metric.slaCompliancePercent)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
