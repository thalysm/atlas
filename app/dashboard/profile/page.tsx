"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { AlertModal } from "@/components/ui/alert-modal"

export default function ProfilePage() {
  const router = useRouter()
  const { user, mutate } = useAuth()
  
  const [detailsForm, setDetailsForm] = useState({ name: '', email: '', username: '' })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })

  const [isSavingDetails, setIsSavingDetails] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; description: string }>({
    open: false,
    title: "",
    description: "",
  })

  useEffect(() => {
    if (user) {
      setDetailsForm({
        name: user.name,
        email: user.email,
        username: user.username,
      })
    }
  }, [user])

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingDetails(true)
    try {
      await apiClient.put("/auth/me", detailsForm)
      mutate() // Re-fetch user data
      setAlertModal({ open: true, title: "Sucesso", description: "Seus dados foram atualizados." })
    } catch (error: any) {
      setAlertModal({ open: true, title: "Erro", description: error.message || "Não foi possível atualizar seus dados." })
    } finally {
      setIsSavingDetails(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setAlertModal({ open: true, title: "Erro", description: "As novas senhas não correspondem." })
      return
    }
    if (passwordForm.new_password.length < 6) {
        setAlertModal({ open: true, title: "Erro", description: "A nova senha deve ter no mínimo 6 caracteres." });
        return;
    }
    setIsSavingPassword(true)
    try {
      await apiClient.post("/auth/me/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      setAlertModal({ open: true, title: "Sucesso", description: "Sua senha foi alterada." })
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' }) // Clear fields
    } catch (error: any) {
      setAlertModal({ open: true, title: "Erro", description: error.message || "Não foi possível alterar a senha." })
    } finally {
      setIsSavingPassword(false)
    }
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie seus dados e sua senha</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleDetailsSubmit}>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Atualize seu nome, e-mail e nome de usuário.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={detailsForm.name} onChange={e => setDetailsForm({...detailsForm, name: e.target.value})} className="bg-surface border-border"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input id="username" value={detailsForm.username} onChange={e => setDetailsForm({...detailsForm, username: e.target.value})} className="bg-surface border-border"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={detailsForm.email} onChange={e => setDetailsForm({...detailsForm, email: e.target.value})} className="bg-surface border-border"/>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSavingDetails}>{isSavingDetails ? "Salvando..." : "Salvar Alterações"}</Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <form onSubmit={handlePasswordSubmit}>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Para sua segurança, informe sua senha atual para realizar a alteração.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Senha Atual</Label>
                <Input id="current_password" type="password" value={passwordForm.current_password} onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})} required className="bg-surface border-border"/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">Nova Senha</Label>
                  <Input id="new_password" type="password" value={passwordForm.new_password} onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})} required className="bg-surface border-border"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                  <Input id="confirm_password" type="password" value={passwordForm.confirm_password} onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})} required className="bg-surface border-border"/>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSavingPassword}>{isSavingPassword ? "Alterando..." : "Alterar Senha"}</Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <AlertModal
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal({ ...alertModal, open })}
        title={alertModal.title}
        description={alertModal.description}
      />
    </div>
  )
}