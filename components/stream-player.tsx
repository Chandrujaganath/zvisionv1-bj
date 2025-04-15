"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface StreamPlayerProps {
  streamUrl: string | null
  isLoading: boolean
  error: string | null
}

export function StreamPlayer({ streamUrl, isLoading, error }: StreamPlayerProps) {
  const [playerError, setPlayerError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamType, setStreamType] = useState<"mjpeg" | "hls" | "mp4" | "unknown">("unknown")

  useEffect(() => {
    if (!streamUrl) return
    setPlayerError(null)

    // Determine stream type based on URL or content type
    if (streamUrl.includes("mjpeg") || streamUrl.endsWith(".mjpg") || streamUrl.endsWith(".mjpeg")) {
      setStreamType("mjpeg")
    } else if (streamUrl.includes(".m3u8") || streamUrl.includes("hls")) {
      setStreamType("hls")
      // If HLS, we might need to load the hls.js library
      import("hls.js")
        .then((Hls) => {
          if (videoRef.current && Hls.default.isSupported()) {
            const hls = new Hls.default()
            hls.loadSource(streamUrl)
            hls.attachMedia(videoRef.current)
          }
        })
        .catch(() => {
          setPlayerError("Failed to load HLS player")
        })
    } else if (streamUrl.endsWith(".mp4")) {
      setStreamType("mp4")
    } else {
      // Try to detect based on response headers or just default to video tag
      setStreamType("unknown")
    }

    console.log(`Stream URL: ${streamUrl}, detected type: ${streamType}`)
  }, [streamUrl])

  const handleImageError = () => {
    setPlayerError("Failed to load stream. The camera might be offline or the stream URL is invalid.")
  }

  const handleVideoError = () => {
    setPlayerError("Failed to load video stream. The format might be unsupported or the camera is offline.")
  }

  if (isLoading) {
    return (
      <Card className="w-full bg-background/60 backdrop-blur-lg border-muted/40">
        <CardContent className="p-6 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error || playerError) {
    return (
      <Card className="w-full bg-background/60 backdrop-blur-lg border-muted/40">
        <CardContent className="p-6">
          <Alert variant="destructive" className="bg-destructive/10">
            <AlertDescription>{error || playerError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!streamUrl) {
    return (
      <Card className="w-full bg-background/60 backdrop-blur-lg border-muted/40">
        <CardContent className="p-6 flex justify-center items-center min-h-[300px]">
          <p className="text-muted-foreground">No stream URL available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-background/60 backdrop-blur-lg border-muted/40 overflow-hidden">
      <CardContent className="p-0">
        {streamType === "mjpeg" ? (
          <img
            ref={imgRef}
            src={streamUrl || "/placeholder.svg"}
            alt="Live camera feed"
            className="w-full h-auto"
            onError={handleImageError}
          />
        ) : (
          <video
            ref={videoRef}
            src={streamType === "unknown" || streamType === "mp4" ? streamUrl : undefined}
            className="w-full h-auto"
            controls
            autoPlay
            muted
            playsInline
            onError={handleVideoError}
          />
        )}
      </CardContent>
    </Card>
  )
}
