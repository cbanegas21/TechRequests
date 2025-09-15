"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { BoardFilters } from "@/components/board-filters"
import { KanbanColumn } from "@/components/kanban-column"
import { moveTicket, getFilteredTickets } from "./actions"
import { TICKET_STATUSES } from "@/lib/ticket-utils"

// Mock data - in real app this would come from server
const mockAgents = [
  { id: "1", name: "Sarah Chen" },
  { id: "2", name: "Mike Rodriguez" },
]

const mockAccounts = ["ClientTether", "Acme Corp", "TechStart Inc", "BigCorp Enterprise"]

export default function BoardPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    priority: "", // Updated from urgency to priority
    category: "",
    status: "",
    assignee: "",
    account: "",
    workflowType: "", // Added workflow type filter
    projectType: "", // Added project type filter
    dateRange: "",
  })
  const { toast } = useToast()

  // Load tickets
  const loadTickets = async () => {
    setLoading(true)
    try {
      const filteredTickets = await getFilteredTickets(filters)
      setTickets(filteredTickets)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load tickets on mount and filter changes
  useEffect(() => {
    loadTickets()
  }, [filters])

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(loadTickets, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [filters])

  const handleTicketMove = async (ticketId: string, newStatus: string) => {
    // Optimistic update
    setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket)))

    try {
      const result = await moveTicket(ticketId, newStatus)
      if (!result.success) {
        // Revert optimistic update on failure
        loadTickets()
        toast({
          title: "Error",
          description: result.error || "Failed to move ticket",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Ticket Moved",
          description: `Ticket moved to ${newStatus}`,
        })
      }
    } catch (error) {
      // Revert optimistic update on error
      loadTickets()
      toast({
        title: "Error",
        description: "Failed to move ticket",
        variant: "destructive",
      })
    }
  }

  // Group tickets by status
  const ticketsByStatus = TICKET_STATUSES.reduce(
    (acc, status) => {
      acc[status] = tickets.filter((ticket) => ticket.status === status)
      return acc
    },
    {} as Record<string, any[]>,
  )

  if (loading && tickets.length === 0) {
    return (
      <div className="trello-board">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-white/80 mt-4">Loading tickets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="trello-board">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Tech Request Board</h1>
          <p className="text-white/80">Manage and track tech requests through the ClientTether workflow pipeline</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <BoardFilters filters={filters} onFiltersChange={setFilters} agents={mockAgents} accounts={mockAccounts} />
        </div>

        <div className="flex items-center gap-4">
          <button
            className="pipeline-nav-arrow bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full border border-white/30 transition-all duration-200 flex-shrink-0"
            onClick={() => {
              const container = document.getElementById("pipeline-container")
              if (container) container.scrollLeft -= 320
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 overflow-hidden">
            <div className="flex gap-4 overflow-x-auto min-h-[600px] scrollbar-hide" id="pipeline-container">
              {TICKET_STATUSES.map((status, index) => (
                <div key={status} className="flex-shrink-0 w-80 transition-transform duration-300">
                  <KanbanColumn
                    title={status}
                    status={status}
                    tickets={ticketsByStatus[status] || []}
                    onTicketMove={handleTicketMove}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            className="pipeline-nav-arrow bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full border border-white/30 transition-all duration-200 flex-shrink-0"
            onClick={() => {
              const container = document.getElementById("pipeline-container")
              if (container) container.scrollLeft += 320
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Loading indicator for updates */}
        {loading && tickets.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-md text-sm border border-white/30">
            Updating...
          </div>
        )}
      </div>
    </div>
  )
}
