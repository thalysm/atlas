"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    email_or_username: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData)
      router.push("/dashboard")
    } catch (err) {
      // Error is handled by useAuth hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email_or_username">Email ou Username</Label>
        <Input
          id="email_or_username"
          type="text"
          placeholder="seu@email.com ou username"
          value={formData.email_or_username}
          onChange={(e) => setFormData({ ...formData, email_or_username: e.target.value })}
          required
          className="bg-surface border-border text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="bg-surface border-border text-foreground"
        />
      </div>

      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

      <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-hover text-white">
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  )
}
