"use client"

// This file re-exports the useAuth hook from the context for convenience
// We're using AuthContext as the main implementation

import { useAuth as useAuthFromContext } from "@/context/AuthContext"

export const useAuth = useAuthFromContext
