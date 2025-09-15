import { TrendingUp, TrendingDown, Clock, AlertTriangle, GitBranch } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { KPIStats } from "@/lib/kpi-utils"

interface KPIStatsCardsProps {
  stats: KPIStats
}

export function KPIStatsCards({ stats }: KPIStatsCardsProps) {
  const formatHours = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours)}h`
    }
    return `${Math.round(hours / 24)}d`
  }

  const cards = [
    {
      title: "Tickets Created",
      value: stats.ticketsCreated,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "In Progress",
      value: stats.ticketsInProgress,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Resolved on Time",
      value: stats.ticketsResolvedOnTime,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Declined",
      value: stats.ticketsDeclined,
      icon: TrendingDown,
      color: "text-gray-600",
    },
    {
      title: "GitLab Tickets Submitted",
      value: stats.gitlabTicketsSubmitted,
      icon: GitBranch,
      color: "text-orange-600",
    },
    {
      title: "Avg Response Time",
      value: formatHours(stats.avgFirstResponseHours),
      icon: Clock,
      color: "text-purple-600",
    },
    {
      title: "Avg Resolution Time",
      value: formatHours(stats.avgResolutionHours),
      icon: Clock,
      color: "text-indigo-600",
    },
    {
      title: "SLA Breaches",
      value: stats.slaBreaches.response + stats.slaBreaches.resolution,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
