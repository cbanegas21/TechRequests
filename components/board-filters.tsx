"use client"

import { useState } from "react"
import { Search, Filter, X, Briefcase, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PRIORITY_LEVELS, CATEGORIES, TICKET_STATUSES, WORKFLOW_TYPES } from "@/lib/ticket-utils"

interface BoardFiltersProps {
  filters: {
    search: string
    priority: string // Updated from urgency to priority
    category: string
    status: string
    assignee: string
    account: string
    workflowType: string // Added workflow type filter
    projectType: string // Added project type filter
    dateRange: string
  }
  onFiltersChange: (filters: any) => void
  agents: Array<{ id: string; name: string }>
  accounts: string[]
}

export function BoardFilters({ filters, onFiltersChange, agents, accounts }: BoardFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      priority: "",
      category: "",
      status: "",
      assignee: "",
      account: "",
      workflowType: "",
      projectType: "",
      dateRange: "",
    })
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateFilter("assignee", "me")}
          className={filters.assignee === "me" ? "bg-primary text-primary-foreground" : ""}
        >
          My Tickets
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateFilter("assignee", "submitted")}
          className={filters.assignee === "submitted" ? "bg-primary text-primary-foreground" : ""}
        >
          Submitted by Me
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateFilter("projectType", "Project")}
          className={filters.projectType === "Project" ? "bg-amber-500 text-white" : ""}
        >
          <Briefcase className="h-3 w-3 mr-1" />
          Projects
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateFilter("projectType", "Workflow")}
          className={filters.projectType === "Workflow" ? "bg-blue-500 text-white" : ""}
        >
          <Zap className="h-3 w-3 mr-1" />
          Workflows
        </Button>
      </div>

      {/* Advanced Filters */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Type</Label>
                <Select value={filters.projectType} onValueChange={(value) => updateFilter("projectType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any</SelectItem>
                    <SelectItem value="Project">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3 w-3" />
                        Projects
                      </div>
                    </SelectItem>
                    <SelectItem value="Workflow">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3" />
                        Workflows
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Workflow Type</Label>
                <Select value={filters.workflowType} onValueChange={(value) => updateFilter("workflowType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any</SelectItem>
                    {WORKFLOW_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {["White Label", "Data Migration", "Proposal Build"].includes(type) && (
                            <Briefcase className="h-3 w-3 text-amber-500" />
                          )}
                          {type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Priority</Label>
                <Select value={filters.priority} onValueChange={(value) => updateFilter("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any</SelectItem>
                    {PRIORITY_LEVELS.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Category</Label>
                <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Status</Label>
                <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any</SelectItem>
                    {TICKET_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Assignee</Label>
                <Select value={filters.assignee} onValueChange={(value) => updateFilter("assignee", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm">Account</Label>
              <Select value={filters.account} onValueChange={(value) => updateFilter("account", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account} value={account}>
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="quarter">This quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
