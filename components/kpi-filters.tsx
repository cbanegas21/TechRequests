"use client"

import { useState } from "react"
import { CalendarDays, Filter, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { URGENCY_LEVELS, CATEGORIES } from "@/lib/ticket-utils"

export interface KPIFiltersType {
  dateRange?: string
  startDate?: Date
  endDate?: Date
  agent?: string
  urgency?: string
  account?: string
  category?: string
}

interface KPIFiltersProps {
  filters: KPIFiltersType
  onFiltersChange: (filters: KPIFiltersType) => void
  agents: Array<{ id: string; name: string }>
  accounts: string[]
  onExportTickets: () => void
}

export function KPIFilters({ filters, onFiltersChange, agents, accounts, onExportTickets }: KPIFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const updateFilter = (key: keyof KPIFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Date Range Quick Filters */}
      <div className="flex gap-2">
        <Button
          variant={filters.dateRange === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter("dateRange", "week")}
        >
          This Week
        </Button>
        <Button
          variant={filters.dateRange === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter("dateRange", "month")}
        >
          This Month
        </Button>
        <Button
          variant={filters.dateRange === "quarter" ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter("dateRange", "quarter")}
        >
          This Quarter
        </Button>
      </div>

      <div className="flex gap-2 ml-auto">
        {/* Custom Date Range */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <CalendarDays className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-sm font-medium">Start Date</Label>
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => updateFilter("startDate", date)}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">End Date</Label>
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => updateFilter("endDate", date)}
                  className="rounded-md border"
                />
              </div>
              <Button onClick={() => setIsCalendarOpen(false)} className="w-full" size="sm">
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>

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
                <h4 className="font-medium">Advanced Filters</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Agent</Label>
                  <Select value={filters.agent || "none"} onValueChange={(value) => updateFilter("agent", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Urgency</Label>
                  <Select value={filters.urgency || "none"} onValueChange={(value) => updateFilter("urgency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any</SelectItem>
                      {URGENCY_LEVELS.map((urgency) => (
                        <SelectItem key={urgency} value={urgency}>
                          {urgency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Category</Label>
                  <Select value={filters.category || "none"} onValueChange={(value) => updateFilter("category", value)}>
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
                  <Label className="text-sm">Account</Label>
                  <Select value={filters.account || "none"} onValueChange={(value) => updateFilter("account", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
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
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Export Tickets */}
        <Button onClick={onExportTickets} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Tickets
        </Button>
      </div>
    </div>
  )
}
