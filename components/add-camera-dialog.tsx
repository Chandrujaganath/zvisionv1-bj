"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/apiClient"
import type { RegisterCameraPayload } from "@/types/camera"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface AddCameraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCameraAdded: () => void
}

export function AddCameraDialog({ open, onOpenChange, onCameraAdded }: AddCameraDialogProps) {
  const [cameraId, setCameraId] = useState("")
  const [location, setLocation] = useState("")
  const [streamUrl, setStreamUrl] = useState("")
  const [roi, setRoi] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!cameraId.trim()) {
      setError("Camera ID is required")
      return
    }

    setIsSubmitting(true)

    try {
      const payload: RegisterCameraPayload = {
        camera_id: cameraId,
        camera_config: {
          location: location || undefined,
          roi: roi || undefined,
          stream_url: streamUrl || undefined,
        },
      }

      const response = await apiClient.post("/cameras/register", payload)

      if (response.data.success) {
        resetForm()
        onCameraAdded()
      } else {
        setError("Failed to register camera")
      }
    } catch (err: any) {
      console.error("Error registering camera:", err)
      setError(err.response?.data?.message || "Failed to register camera")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCameraId("")
    setLocation("")
    setStreamUrl("")
    setRoi("")
    setError(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Register New Camera</DialogTitle>
            <DialogDescription>Enter the details for the new camera you want to register.</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="bg-destructive/10 my-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="camera-id" className="text-right">
                Camera ID*
              </Label>
              <Input
                id="camera-id"
                value={cameraId}
                onChange={(e) => setCameraId(e.target.value)}
                className="col-span-3"
                placeholder="cam_001"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
                placeholder="Front Door"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stream-url" className="text-right">
                Stream URL
              </Label>
              <Input
                id="stream-url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="col-span-3"
                placeholder="rtsp://example.com/stream"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roi" className="text-right">
                ROI
              </Label>
              <Input
                id="roi"
                value={roi}
                onChange={(e) => setRoi(e.target.value)}
                className="col-span-3"
                placeholder="0,0,640,480"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Camera"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
