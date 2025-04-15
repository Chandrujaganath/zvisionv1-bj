"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient, setAuthToken } from "@/lib/apiClient"
import { useRouter } from "next/navigation"

interface AuthContextType {
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Initialize auth state from localStorage if available
  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null
    if (storedToken) {
      setToken(storedToken)
      setAuthToken(storedToken)
    }
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.post("/auth/login", { username, password })

      if (response.data.success) {
        const newToken = response.data.data.token
        setToken(newToken)
        setAuthToken(newToken)

        // Store token in localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("auth-token", newToken)
        }

        // Force a redirect to cameras page with replace to avoid history issues
        console.log("Login successful, redirecting to /cameras")
        router.replace("/cameras")
        return
      }

      setError("Authentication failed")
    } catch (err: any) {
      console.error("Login error:", err)

      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid username or password")
        } else if (err.response.status === 400) {
          setError("Please check your input and try again")
        } else {
          setError("An error occurred during login")
        }
      } else {
        setError("Network error. Please try again later")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setAuthToken("")

    // Remove from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token")
    }

    // Redirect to login page
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
