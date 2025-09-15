"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KPIChartsProps {
  chartData: {
    statusData: Array<{ status: string; count: number }>
    urgencyData: Array<{ urgency: string; count: number }>
    timeSeriesData: Array<{ date: string; created: number; resolved: number }>
  }
  agentMetrics: Array<{
    agentName: string
    avgResponseHours: number
    avgResolutionHours: number
  }>
}

const COLORS = ["#0891b2", "#a16207", "#dc2626", "#059669", "#7c3aed", "#ea580c"]

export function KPICharts({ chartData, agentMetrics }: KPIChartsProps) {
  const safeChartData = {
    statusData: chartData?.statusData || [],
    urgencyData: chartData?.urgencyData || [],
    timeSeriesData: chartData?.timeSeriesData || [],
  }
  const safeAgentMetrics = agentMetrics || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Tickets by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={safeChartData.statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0891b2" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tickets by Urgency */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={safeChartData.urgencyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ urgency, percent }) => `${urgency} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {safeChartData.urgencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Created vs Resolved Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Created vs Resolved (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={safeChartData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} fontSize={12} />
              <YAxis />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
              <Line type="monotone" dataKey="created" stroke="#0891b2" name="Created" />
              <Line type="monotone" dataKey="resolved" stroke="#059669" name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Avg Response/Resolution by Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={safeAgentMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agentName" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${Math.round(value)}h`, ""]} />
              <Bar dataKey="avgResponseHours" fill="#a16207" name="Avg Response (h)" />
              <Bar dataKey="avgResolutionHours" fill="#dc2626" name="Avg Resolution (h)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
