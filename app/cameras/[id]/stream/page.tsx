"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiClient } from "@/lib/apiClient"
import type { Camera, CameraDetailResponse } from "@/types/camera"
import type { DetectionResponse, StreamResponse } from "@/types/stream"
import { Loader2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StreamPlayer } from "@/components/stream-player"
import { DetectionToggle } from "@/components/detection-toggle"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/toaster"

export default function StreamPage() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const cameraId = params.id as string

  const [camera, setCamera] = useState<Camera | null>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [isDetectionRunning, setIsDetectionRunning] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCameraAndStreamInfo = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch camera details
      const cameraResponse = await apiClient.get<CameraDetailResponse>(`/cameras/${cameraId}`)

      if (cameraResponse.data.success) {
        const cameraData = {
          id: cameraId,
          ...cameraResponse.data.data,
        }
        setCamera(cameraData)

        // Use stream_url from camera data if available
        if (cameraData.stream_url) {
          setStreamUrl(cameraData.stream_url)
        } else {
          // Otherwise, try to fetch stream info
          try {
            const streamResponse = await apiClient.get<StreamResponse>(`/stream/${cameraId}`)
            if (streamResponse.data.success) {
              setStreamUrl(streamResponse.data.data.stream_url)
            }
          } catch (streamErr) {
            console.error("Error fetching stream info:", streamErr)
            setError("Stream information not available")
          }
        }

        // Fetch detection status
        try {
          const detectionResponse = await apiClient.get<DetectionResponse>(`/cameras/${cameraId}/detection/status`)
          if (detectionResponse.data.success) {
            setIsDetectionRunning(detectionResponse.data.data.status === "running")
          }
        } catch (detectionErr) {
          console.error("Error fetching detection status:", detectionErr)
          // Don't set error, just default to not running
          setIsDetectionRunning(false)
        }
      } else {
        setError("Failed to load camera details")
      }
    } catch (err: any) {
      console.error("Error fetching camera details:", err)

      if (err.response?.status === 401) {
        // Token expired or invalid
        logout()
      } else if (err.response?.status === 404) {
        setError("Camera not found")
      } else {
        setError("Failed to load camera details. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Client-side redirect if not authenticated
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchCameraAndStreamInfo()
  }, [isAuthenticated, router, cameraId])

  const handleDetectionStatusChange = (isRunning: boolean) => {
    setIsDetectionRunning(isRunning)
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/cameras/${cameraId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Live Stream</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>

      <Card className="bg-background/60 backdrop-blur-lg border-muted/40 mb-6">
        <CardHeader>
          <CardTitle>{camera?.location || cameraId}</CardTitle>
          <CardDescription>Live camera feed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="bg-destructive/10">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <StreamPlayer streamUrl={streamUrl} isLoading={loading} error={null} />

              <Separator />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <DetectionToggle
                  cameraId={cameraId}
                  initialStatus={isDetectionRunning}
                  onStatusChange={handleDetectionStatusChange}
                  disabled={loading || !streamUrl}
                />

                <Button variant="outline" onClick={() => router.push(`/cameras/${cameraId}`)}>
                  Camera Details
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
