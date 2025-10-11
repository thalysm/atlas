const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    console.log("API_BASE_URL CARREGADA:", API_BASE_URL)
    this.baseUrl = API_BASE_URL

    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("atlas_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("atlas_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("atlas_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
