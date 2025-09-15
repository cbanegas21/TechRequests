"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TicketCard } from "@/components/ticket-card"
import { useAuth } from "@/lib/auth"

interface KanbanColumnProps {
  title: string
  status: string
  tickets: Array<{
    id: string
    shortId: string
    title: string
    accountName: string
    urgency: string
    status: string
    createdAt: string
    requester?: {
      id: string
      name: string
      email: string
    } | null
    requesterName?: string
    assignee?: {
      id: string
      name: string
      email: string
    } | null
    sla?: {
      firstResponseAt?: string | null
      resolvedAt?: string | null
    } | null
  }>
  onTicketMove?: (ticketId: string, newStatus: string) => void
}

export function KanbanColumn({ title, status, tickets, onTicketMove }: KanbanColumnProps) {
  const [draggedOver, setDraggedOver] = useState(false)
  const { isAgent } = useAuth()

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAgent) return
    e.preventDefault()
    setDraggedOver(true)
  }

  const handleDragLeave = () => {
    setDraggedOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!isAgent) return
    e.preventDefault()
    setDraggedOver(false)

    const ticketId = e.dataTransfer.getData("text/plain")
    if (ticketId && onTicketMove) {
      onTicketMove(ticketId, status)
    }
  }

  const getColumnHeaderColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "text-blue-700"
      case "in progress":
        return "text-amber-700"
      case "done":
        return "text-emerald-700"
      case "gitlab ticket":
        return "text-purple-700"
      case "escalation":
        return "text-red-700"
      case "recurring issue":
        return "text-orange-700"
      case "reopened":
        return "text-pink-700"
      case "declined":
        return "text-gray-700"
      default:
        return "text-gray-700"
    }
  }

  return (
    <div
      className={`trello-column rounded-xl p-3 min-h-[600px] flex flex-col ${
        draggedOver ? "ring-2 ring-white/50" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-3 px-2">
        <div className="flex items-center justify-between">
          <h2 className={`text-sm font-bold column-header ${getColumnHeaderColor(status)}`}>{title}</h2>
          <Badge
            variant="secondary"
            className="column-badge bg-white/20 text-white border-white/30 text-xs px-2 py-0.5 dark:bg-black/20 dark:text-gray-200"
          >
            {tickets.length}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {tickets.length === 0 ? (
          <div className="text-center text-sm py-8 px-2">
            <div className="empty-state bg-white/10 dark:bg-black/10 rounded-lg p-4 border border-white/20 dark:border-gray-600 text-white/60 dark:text-gray-400">
              No tickets
            </div>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              draggable={isAgent}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", ticket.id)
              }}
              className={isAgent ? "cursor-move" : ""}
            >
              <TicketCard ticket={ticket} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
