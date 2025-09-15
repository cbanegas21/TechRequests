"use client"

import { useState, useEffect } from "react"
import { KPIStatsCards } from "@/components/kpi-stats-cards"
import { KPICharts } from "@/components/kpi-charts"
import { AgentMetricsTable } from "@/components/agent-metrics-table"
import { KPIFilters } from "@/components/kpi-filters"
import { calculateKPIStats, getAgentMetrics, getChartData, exportToCSV } from "@/lib/kpi-utils"
import { prisma } from "@/lib/db"
import type { KPIStats, AgentMetrics, KPIFilters as KPIFiltersType } from "@/lib/kpi-utils"
import { useToast } from "@/hooks/use-toast"

const mockAgents = [
  { id: "1", name: "Sarah Chen" },
  { id: "2", name: "Mike Rodriguez" },
]

const mockAccounts = ["Acme Corp", "TechStart Inc", "BigCorp Enterprise", "DataCorp", "Analytics Pro"]

export default function KPIsPage() {
  const [stats, setStats] = useState<KPIStats | null>(null)
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([])
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<KPIFiltersType>({
    dateRange: "month",
  })
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const [kpiStats, agentData, charts] = await Promise.all([
        calculateKPIStats(filters),
        getAgentMetrics(filters),
        getChartData(filters),
      ])

      setStats(kpiStats)
      setAgentMetrics(agentData)
      setChartData(charts)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load KPI data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters])

  const handleExportTickets = async () => {
    try {
      const tickets = await prisma.ticket.findMany({
        include: {
          requester: { select: { name: true, email: true } },
          assignee: { select: { name: true, email: true } },
        },
      })

      const exportData = tickets.map((ticket) => ({
        "Ticket ID": ticket.shortId,
        Title: ticket.title,
        Status: ticket.status,
        Urgency: ticket.urgency,
        Category: ticket.category,
        Account: ticket.accountName,
        Requester: ticket.requester?.name || ticket.requesterName || "",
        Assignee: ticket.assignee?.name || "Unassigned",
        Created: ticket.createdAt.toISOString().split("T")[0],
        Updated: ticket.updatedAt.toISOString().split("T")[0],
      }))

      exportToCSV(exportData, `tickets-export-${new Date().toISOString().split("T")[0]}.csv`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export tickets",
        variant: "destructive",
      })
    }
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading KPIs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">KPIs & Analytics</h1>
          <p className="text-muted-foreground">Track team performance and ticket metrics</p>
        </div>

        {/* Filters */}
        <KPIFilters
          filters={filters}
          onFiltersChange={setFilters}
          agents={mockAgents}
          accounts={mockAccounts}
          onExportTickets={handleExportTickets}
        />

        {stats && (
          <>
            {/* Stats Cards */}
            <KPIStatsCards stats={stats} />

            {/* Charts */}
            {chartData && <KPICharts chartData={chartData} agentMetrics={agentMetrics} />}

            {/* Agent Metrics Table */}
            <AgentMetricsTable metrics={agentMetrics} />
          </>
        )}

        {/* Loading indicator for updates */}
        {loading && stats && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm">
            Updating...
          </div>
        )}
      </div>
    </div>
  )
}
