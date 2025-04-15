import axios from "axios"

/**
 * Axios instance configured for ZVision API
 * Base URL is set to the development server
 * Token will be added in Phase 1 implementation
 */
const apiClient = axios.create({
  baseURL: "http://127.0.0.1:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Set auth token for API requests and sync with cookies
const setAuthToken = (token: string) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`

    // Sync token with cookies for middleware access
    if (typeof document !== "undefined") {
      document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Strict`
    }
  } else {
    delete apiClient.defaults.headers.common["Authorization"]

    // Clear cookie when token is removed
    if (typeof document !== "undefined") {
      document.cookie = `auth-token=; path=/; max-age=0; SameSite=Strict`
    }
  }
}

// Initialize token from localStorage if available
if (typeof window !== "undefined") {
  const token = localStorage.getItem("auth-token")
  if (token) {
    setAuthToken(token)
  }
}

export { apiClient, setAuthToken }
