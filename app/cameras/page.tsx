"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CamerasPage() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Client-side redirect if not authenticated
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

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

      <Card className="bg-background/60 backdrop-blur-lg border-muted/40">
        <CardHeader>
          <CardTitle>Camera List</CardTitle>
          <CardDescription>View all connected cameras in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder for the cameras list that will be implemented in Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
