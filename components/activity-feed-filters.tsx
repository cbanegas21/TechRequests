"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  Filter,
  CalendarIcon,
  X,
  MessageSquare,
  FileText,
  UserPlus,
  Settings,
  Upload,
  GitBranch,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"

interface ActivityFilters {
  search: string
  activityType: string
  userRole: string
  dateRange: {
    from?: Date
    to?: Date
  }
  ticketId: string
}

interface ActivityFeedFiltersProps {
  filters: ActivityFilters
  onFiltersChange: (filters: ActivityFilters) => void
  onClearFilters: () => void
}

const activityTypes = [
  { value: "all", label: "All Activities", icon: Settings },
  { value: "comment", label: "Comments", icon: MessageSquare },
  { value: "ticket_created", label: "Tickets Created", icon: FileText },
  { value: "status_changed", label: "Status Changes", icon: Settings },
  { value: "assigned", label: "Assignments", icon: UserPlus },
  { value: "file_upload", label: "File Uploads", icon: Upload },
  { value: "gitlab_submission", label: "GitLab Submissions", icon: GitBranch },
  { value: "priority_changed", label: "Priority Changes", icon: AlertTriangle },
  { value: "due_date_changed", label: "Due Date Changes", icon: Clock },
]

const userRoles = [
  { value: "all", label: "All Users" },
  { value: "agent", label: "Agents Only" },
  { value: "csp", label: "CSPs Only" },
]

export function ActivityFeedFilters({ filters, onFiltersChange, onClearFilters }: ActivityFeedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof ActivityFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.activityType !== "all" ||
    filters.userRole !== "all" ||
    filters.ticketId ||
    filters.dateRange.from ||
    filters.dateRange.to

  const activeFilterCount = [
    filters.search,
    filters.activityType !== "all" ? filters.activityType : null,
    filters.userRole !== "all" ? filters.userRole : null,
    filters.ticketId,
    filters.dateRange.from,
    filters.dateRange.to,
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Activity Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Activities</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by user, ticket, or description..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="space-y-2">
          <Label>Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            {activityTypes.slice(0, 4).map((type) => {
              const Icon = type.icon
              return (
                <Button
                  key={type.value}
                  variant={filters.activityType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("activityType", type.value)}
                  className="flex items-center gap-1"
                >
                  <Icon className="h-3 w-3" />
                  {type.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Activity Type */}
              <div className="space-y-2">
                <Label>Activity Type</Label>
                <Select value={filters.activityType} onValueChange={(value) => updateFilter("activityType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* User Role */}
              <div className="space-y-2">
                <Label>User Role</Label>
                <Select value={filters.userRole} onValueChange={(value) => updateFilter("userRole", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ticket ID */}
              <div className="space-y-2">
                <Label htmlFor="ticketId">Ticket ID</Label>
                <Input
                  id="ticketId"
                  placeholder="e.g., TR-0001"
                  value={filters.ticketId}
                  onChange={(e) => updateFilter("ticketId", e.target.value)}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : <span>From date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => updateFilter("dateRange", { ...filters.dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : <span>To date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => updateFilter("dateRange", { ...filters.dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
