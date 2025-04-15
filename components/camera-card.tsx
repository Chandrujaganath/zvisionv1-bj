"use client"

import type React from "react"

import type { Camera } from "@/types/camera"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Info } from "lucide-react"
import { useState } from "react"
import { apiClient } from "@/lib/apiClient"
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

interface CameraCardProps {
  camera: Camera
  onDelete: () => void
  onClick: () => void
}

export function CameraCard({ camera, onDelete, onClick }: CameraCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering onClick
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      await apiClient.delete(`/cameras/${camera.id}`)
      onDelete()
    } catch (error) {
      console.error("Error deleting camera:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card
        className="bg-background/80 backdrop-blur-sm border-muted/40 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg mb-1">{camera.id}</h3>
              {camera.location && <p className="text-sm text-muted-foreground mb-2">{camera.location}</p>}
              {camera.status && (
                <Badge variant={camera.status === "online" ? "default" : "secondary"}>{camera.status}</Badge>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4 pt-0">
          <Button variant="ghost" size="sm" onClick={onClick}>
            <Info className="h-4 w-4 mr-2" />
            Details
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Camera</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete camera {camera.id}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
