"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { GroupCard } from "@/components/groups/group-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertModal } from "@/components/ui/alert-modal"
import { Plus, Users, ArrowLeft } from "lucide-react"

export default function GroupsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: "", description: "" })
  const [inviteCode, setInviteCode] = useState("")
  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; description: string }>({
    open: false,
    title: "",
    description: "",
  })

  const { data: groups, mutate } = useSWR("/groups", () => apiClient.get("/groups"))

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post("/groups", createForm)
      mutate()
      setIsCreateOpen(false)
      setCreateForm({ name: "", description: "" })
      setAlertModal({
        open: true,
        title: "Sucesso",
        description: "Grupo criado com sucesso!",
      })
    } catch (error) {
      setAlertModal({
        open: true,
        title: "Erro",
        description: "Erro ao criar grupo",
      })
    }
  }

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post("/groups/join", { invite_code: inviteCode })
      mutate()
      setIsJoinOpen(false)
      setInviteCode("")
      setAlertModal({
        open: true,
        title: "Sucesso",
        description: "Você entrou no grupo!",
      })
    } catch (error) {
      setAlertModal({
        open: true,
        title: "Erro",
        description: "Código inválido ou você já é membro",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Grupos de Competição</h1>
            <p className="text-muted-foreground">Compete com amigos e acompanhe o progresso</p>
          </div>

          <div className="flex gap-2">
            <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-border bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Entrar em um Grupo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-code">Código de Convite</Label>
                    <Input
                      id="invite-code"
                      placeholder="Digite o código"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      className="bg-surface border-border"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                    Entrar no Grupo
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Grupo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Criar Novo Grupo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Grupo</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Treino Pesado"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      required
                      className="bg-surface border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Input
                      id="description"
                      placeholder="Sobre o grupo..."
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      className="bg-surface border-border"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                    Criar Grupo
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group: any) => (
              <GroupCard key={group.id} group={group} currentUserId={user?.id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Você ainda não está em nenhum grupo</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary-hover">
                Criar Grupo
              </Button>
              <Button onClick={() => setIsJoinOpen(true)} variant="outline" className="border-border">
                Entrar em Grupo
              </Button>
            </div>
          </div>
        )}
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
