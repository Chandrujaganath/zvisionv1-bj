"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiClient } from "@/lib/apiClient"
import type { Camera, CameraResponse } from "@/types/camera"
import { CameraCard } from "@/components/camera-card"
import { Loader2, Plus } from "lucide-react"
import { AddCameraDialog } from "@/components/add-camera-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CamerasPage() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const fetchCameras = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<CameraResponse>("/cameras")

      if (response.data.success) {
        // Convert object of cameras to array with IDs
        const cameraArray = Object.entries(response.data.data).map(([id, camera]) => ({
          id,
          ...camera,
        }))

        setCameras(cameraArray)
      } else {
        setError("Failed to load cameras")
      }
    } catch (err: any) {
      console.error("Error fetching cameras:", err)

      if (err.response?.status === 401) {
        // Token expired or invalid
        logout()
      } else {
        setError("Failed to load cameras. Please try again.")
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

    fetchCameras()
  }, [isAuthenticated, router])

  const handleAddCamera = async () => {
    setIsAddDialogOpen(true)
  }

  const handleCameraAdded = () => {
    fetchCameras()
    setIsAddDialogOpen(false)
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cameras</h1>
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
            <CardTitle>Camera Registry</CardTitle>
            <CardDescription>Manage your connected cameras</CardDescription>
          </div>
          <Button onClick={handleAddCamera}>
            <Plus className="mr-2 h-4 w-4" />
            Add Camera
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
          ) : cameras.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No cameras found</p>
              <Button variant="outline" className="mt-4" onClick={handleAddCamera}>
                Register your first camera
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cameras.map((camera) => (
                <CameraCard
                  key={camera.id}
                  camera={camera}
                  onDelete={fetchCameras}
                  onClick={() => router.push(`/cameras/${camera.id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddCameraDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onCameraAdded={handleCameraAdded} />
    </div>
  )
}
