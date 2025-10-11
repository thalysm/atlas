"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

export function RegisterForm() {
  const router = useRouter()
  const { register, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    name: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(formData)
      router.push("/dashboard")
    } catch (err) {
      // Error is handled by useAuth hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          type="text"
          placeholder="Seu nome"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="bg-surface border-border text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Nome de Usuário</Label>
        <Input
          id="username"
          type="text"
          placeholder="usuario123"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          minLength={3}
          className="bg-surface border-border text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          minLength={6}
          className="bg-surface border-border text-foreground"
        />
      </div>

      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

      <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-hover text-white">
        {isLoading ? "Criando conta..." : "Criar Conta"}
      </Button>
    </form>
  )
}
