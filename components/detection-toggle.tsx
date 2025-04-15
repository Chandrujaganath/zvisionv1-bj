"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/apiClient"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface DetectionToggleProps {
  cameraId: string
  initialStatus: boolean
  onStatusChange: (isRunning: boolean) => void
  disabled?: boolean
}

export function DetectionToggle({ cameraId, initialStatus, onStatusChange, disabled = false }: DetectionToggleProps) {
  const [isDetectionRunning, setIsDetectionRunning] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleDetection = async (checked: boolean) => {
    setIsLoading(true)

    try {
      const endpoint = checked ? `/cameras/${cameraId}/detection/start` : `/cameras/${cameraId}/detection/stop`

      const response = await apiClient.post(endpoint)

      if (response.data.success) {
        setIsDetectionRunning(checked)
        onStatusChange(checked)

        toast({
          title: checked ? "Detection Started" : "Detection Stopped",
          description: checked ? "The camera is now monitoring for activity" : "The camera has stopped monitoring",
          duration: 3000,
        })
      } else {
        throw new Error("Failed to update detection status")
      }
    } catch (error: any) {
      console.error("Error toggling detection:", error)

      // Handle 404 errors specifically
      if (error.response?.status === 404) {
        toast({
          title: "Feature Not Available",
          description: "Detection control is not available for this camera",
          variant: "destructive",
          duration: 5000,
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to ${isDetectionRunning ? "stop" : "start"} detection. Please try again.`,
          variant: "destructive",
          duration: 5000,
        })
      }

      // Revert the UI state
      setIsDetectionRunning(initialStatus)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="detection-mode"
        checked={isDetectionRunning}
        onCheckedChange={toggleDetection}
        disabled={disabled || isLoading}
      />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor="detection-mode" className="flex items-center gap-2">
          Detection
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
        </Label>
        <p className="text-sm text-muted-foreground">
          {isDetectionRunning ? "Active - Monitoring for events" : "Inactive - Not monitoring"}
        </p>
      </div>
    </div>
  )
}
