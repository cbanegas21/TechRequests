interface UserSettings {
  fontSize: number
  accentColor: string
  emailNotifications: {
    newTickets: boolean
    statusUpdates: boolean
    comments: boolean
    assignments: boolean
    weeklyDigest: boolean
  }
  pushNotifications: {
    desktop: boolean
    mobile: boolean
    quietHours: boolean
  }
  quietHours: {
    start: string
    end: string
  }
  agentSettings?: {
    autoAssign: boolean
    advancedMode: boolean
    showInternalNotes: boolean
    bulkActions: boolean
  }
}

const DEFAULT_SETTINGS: UserSettings = {
  fontSize: 16,
  accentColor: "#6366f1",
  emailNotifications: {
    newTickets: true,
    statusUpdates: true,
    comments: true,
    assignments: false,
    weeklyDigest: true,
  },
  pushNotifications: {
    desktop: true,
    mobile: false,
    quietHours: true,
  },
  quietHours: {
    start: "22:00",
    end: "08:00",
  },
  agentSettings: {
    autoAssign: false,
    advancedMode: true,
    showInternalNotes: true,
    bulkActions: true,
  },
}

class SettingsService {
  private getStorageKey(userId: string): string {
    return `v0-settings-${userId}`
  }

  loadSettings(userId: string): UserSettings {
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId))
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      // Silent fail in production
    }
    return DEFAULT_SETTINGS
  }

  saveSettings(userId: string, settings: UserSettings): boolean {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(settings))

      document.documentElement.style.setProperty("--font-size-base", `${settings.fontSize}px`)
      document.documentElement.style.setProperty("--color-primary", settings.accentColor)

      return true
    } catch (error) {
      return false
    }
  }

  resetSettings(userId: string): UserSettings {
    try {
      localStorage.removeItem(this.getStorageKey(userId))

      document.documentElement.style.removeProperty("--font-size-base")
      document.documentElement.style.removeProperty("--color-primary")

      return DEFAULT_SETTINGS
    } catch (error) {
      return DEFAULT_SETTINGS
    }
  }

  applySettings(settings: UserSettings): void {
    // Apply font size
    document.documentElement.style.setProperty("--font-size-base", `${settings.fontSize}px`)

    // Apply accent color
    document.documentElement.style.setProperty("--color-primary", settings.accentColor)
  }

  // Check if current time is within quiet hours
  isQuietHours(settings: UserSettings): boolean {
    if (!settings.pushNotifications.quietHours) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const [startHour, startMin] = settings.quietHours.start.split(":").map(Number)
    const [endHour, endMin] = settings.quietHours.end.split(":").map(Number)

    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    }

    return currentTime >= startTime && currentTime <= endTime
  }
}

export const settingsService = new SettingsService()
export type { UserSettings }
export { DEFAULT_SETTINGS }
