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

// Placeholder for adding auth token to requests
// Will be implemented in Phase 1
const setAuthToken = (token: string) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common["Authorization"]
  }
}

export { apiClient, setAuthToken }
