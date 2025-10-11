import { apiClient } from "./api-client"
import type { User } from "./types"

export interface RegisterData {
  email: string
  username: string
  password: string
  name: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data)
    apiClient.setToken(response.access_token)
    return response
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data)
    apiClient.setToken(response.access_token)
    return response
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/auth/me")
  },

  logout() {
    apiClient.clearToken()
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem("atlas_token")
  },
}
