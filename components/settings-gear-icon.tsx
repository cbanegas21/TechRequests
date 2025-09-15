"use client"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function SettingsGearIcon() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.push("/settings")}
      className="h-9 w-9 hover:bg-accent/10 transition-colors"
      aria-label="Open Settings"
    >
      <Settings className="h-4 w-4" />
    </Button>
  )
}
