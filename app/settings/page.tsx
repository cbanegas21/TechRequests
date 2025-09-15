"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useTheme } from "next-themes"
import { settingsService, type UserSettings, DEFAULT_SETTINGS } from "@/lib/settings-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Palette,
  Bell,
  Shield,
  Save,
  Upload,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Clock,
  RotateCcw,
} from "lucide-react"

export default function SettingsPage() {
  const { user, isAgent } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Settings state
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    if (user?.id) {
      const loadedSettings = settingsService.loadSettings(user.id)
      setSettings(loadedSettings)
      settingsService.applySettings(loadedSettings)
      setIsLoading(false)
    }
  }, [user?.id])

  const handleSaveSettings = async () => {
    if (!user?.id) return

    setIsSaving(true)
    try {
      const success = settingsService.saveSettings(user.id, settings)
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Your preferences have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    if (!user?.id) return

    const resetSettings = settingsService.resetSettings(user.id)
    setSettings(resetSettings)
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to their default values.",
    })
  }

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)

    // Apply changes immediately for visual feedback
    if (updates.fontSize || updates.accentColor) {
      settingsService.applySettings(newSettings)
    }
  }

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and personalization options.</p>
      </div>

      <div className="grid gap-6">
        {/* User Profile Section */}
        <Card className="settings-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Profile
            </CardTitle>
            <CardDescription>Manage your profile information and account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback className="text-lg">{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{user?.name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex gap-2 mt-2">
                  {isAgent && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Agent
                    </Badge>
                  )}
                  <Badge variant="outline">ClientTether Team</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" defaultValue={user?.name || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="settings-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your interface.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <div className="px-3">
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                    max={24}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Small</span>
                    <span>{settings.fontSize}px</span>
                    <span>Large</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="accentColor"
                    value={settings.accentColor}
                    onChange={(e) => updateSettings({ accentColor: e.target.value })}
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={settings.accentColor}
                    onChange={(e) => updateSettings({ accentColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="settings-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how and when you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </h4>
                <div className="space-y-3">
                  {Object.entries(settings.emailNotifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          updateSettings({
                            emailNotifications: { ...settings.emailNotifications, [key]: checked },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Push Notifications
                </h4>
                <div className="space-y-3">
                  {Object.entries(settings.pushNotifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`push-${key}`} className="capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <Switch
                        id={`push-${key}`}
                        checked={value}
                        onCheckedChange={(checked) =>
                          updateSettings({
                            pushNotifications: { ...settings.pushNotifications, [key]: checked },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Quiet Hours
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quietStart">Start Time</Label>
                    <Input
                      id="quietStart"
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) =>
                        updateSettings({
                          quietHours: { ...settings.quietHours, start: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quietEnd">End Time</Label>
                    <Input
                      id="quietEnd"
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) =>
                        updateSettings({
                          quietHours: { ...settings.quietHours, end: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Mode Settings (only for agents) */}
        {isAgent && settings.agentSettings && (
          <Card className="settings-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Agent Mode Settings
              </CardTitle>
              <CardDescription>Advanced settings for tech team members and agents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(settings.agentSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={`agent-${key}`} className="capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {key === "autoAssign" && "Automatically assign new tickets to available agents"}
                        {key === "advancedMode" && "Enable advanced agent features and bulk operations"}
                        {key === "showInternalNotes" && "Display internal notes in ticket timeline"}
                        {key === "bulkActions" && "Allow bulk status changes and assignments"}
                      </p>
                    </div>
                    <Switch
                      id={`agent-${key}`}
                      checked={value}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          agentSettings: { ...settings.agentSettings!, [key]: checked },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleResetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}
