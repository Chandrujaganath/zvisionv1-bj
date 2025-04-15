"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If authenticated, redirect to cameras page
    if (isAuthenticated) {
      router.push("/cameras")
    }
  }, [isAuthenticated, router])

  return (
    <main className="container mx-auto max-w-4xl">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>
      <Card className="bg-background/60 backdrop-blur-lg border-muted/40">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">ZVision App</h1>
          <p className="text-muted-foreground mb-4">
            Welcome to the ZVision application. Please log in to access the system.
          </p>
          <div className="mt-4">
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
