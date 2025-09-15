import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "done":
        return "bg-green-100 text-green-800 border-green-200"
      case "gitlab ticket":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "escalation":
        return "bg-red-100 text-red-800 border-red-200"
      case "recurring issue":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "reopened":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "declined":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getStatusStyles(status),
        className,
      )}
    >
      {status}
    </span>
  )
}
