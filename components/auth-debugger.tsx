"use client"

import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthDebugger() {
  const { token, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 opacity-50 hover:opacity-100"
        onClick={() => setIsOpen(true)}
      >
        Debug Auth
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-background/90 backdrop-blur-md z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between">
          Auth Debugger
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>isAuthenticated:</strong> {isAuthenticated ? "true" : "false"}
        </div>
        <div>
          <strong>Token exists:</strong> {token ? "yes" : "no"}
        </div>
        <div>
          <strong>Token in localStorage:</strong>{" "}
          {typeof window !== "undefined" && localStorage.getItem("auth-token") ? "yes" : "no"}
        </div>
        <div>
          <strong>Token in cookies:</strong>{" "}
          {typeof document !== "undefined" && document.cookie.includes("auth-token=") ? "yes" : "no"}
        </div>
        <div className="pt-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              if (typeof window !== "undefined") {
                console.log({
                  token,
                  isAuthenticated,
                  localStorageToken: localStorage.getItem("auth-token"),
                  cookies: document.cookie,
                })
              }
            }}
          >
            Log Details to Console
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
