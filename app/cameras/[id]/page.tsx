"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiClient } from "@/lib/apiClient"
import type { Camera, CameraDetailResponse } from "@/types/camera"
import { Loader2, ArrowLeft, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

export default function CameraDetailPage() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const cameraId = params.id as string

  const [camera, setCamera] = useState<Camera | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCameraDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<CameraDetailResponse>(`/cameras/${cameraId}`)

      if (response.data.success) {
        setCamera({
          id: cameraId,
          ...response.data.data,
        })
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

    fetchCameraDetails()
  }, [isAuthenticated, router, cameraId])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await apiClient.delete(`/cameras/${cameraId}`)
      router.push("/cameras")
    } catch (error) {
      console.error("Error deleting camera:", error)
      setError("Failed to delete camera")
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/cameras")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Camera Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>

      <Card className="bg-background/60 backdrop-blur-lg border-muted/40 mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{cameraId}</CardTitle>
            <CardDescription>Camera details and configuration</CardDescription>
          </div>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={loading || isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Camera
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="bg-destructive/10">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : camera ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Camera ID</h3>
                    <p>{camera.id}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                    <p>{camera.location || "Not specified"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Stream URL</h3>
                    <p className="break-all">{camera.stream_url || "Not specified"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    {camera.status ? (
                      <Badge variant={camera.status === "online" ? "default" : "secondary"}>{camera.status}</Badge>
                    ) : (
                      <p>Unknown</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">ROI</h3>
                    <p>{camera.roi || "Not specified"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Seen</h3>
                    <p>{camera.last_seen || "Never"}</p>
                  </div>
                </div>
              </div>

              {/* Additional camera properties */}
              {Object.entries(camera)
                .filter(([key]) => !["id", "location", "roi", "stream_url", "status", "last_seen"].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
                    </h3>
                    <p>{typeof value === "object" ? JSON.stringify(value) : String(value)}</p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No camera data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Camera</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete camera {cameraId}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
