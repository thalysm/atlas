"use client"

import { useState } from "react"
import useSWR from "swr"
import { authService, type RegisterData, type LoginData } from "@/lib/auth"
import type { User } from "@/lib/types"

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    data: user,
    mutate,
    error: swrError,
  } = useSWR<User>(authService.isAuthenticated() ? "/auth/me" : null, () => authService.getCurrentUser(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.register(data)
      mutate(response.user)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (data: LoginData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.login(data)
      mutate(response.user)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    mutate(undefined)
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    mutate, 
  }
}