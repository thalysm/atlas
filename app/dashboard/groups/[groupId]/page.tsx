"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertModal } from "@/components/ui/alert-modal"
import { Trophy, Copy, LogOut, Trash2, Crown, ArrowLeft } from "lucide-react"

export default function GroupDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const groupId = params.groupId as string

  const { data: group, mutate } = useSWR(groupId ? `/groups/${groupId}` : null, () =>
    apiClient.get(`/groups/${groupId}`),
  )

  const [copied, setCopied] = useState(false)
  const [alertModal, setAlertModal] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm?: () => void
    variant?: "default" | "destructive"
  }>({
    open: false,
    title: "",
    description: "",
  })

  const handleCopyInviteCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLeaveGroup = async () => {
    setAlertModal({
      open: true,
      title: "Sair do Grupo",
      description: "Tem certeza que deseja sair do grupo?",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await apiClient.post(`/groups/${groupId}/leave`)
          router.push("/dashboard/groups")
        } catch (error) {
          setAlertModal({
            open: true,
            title: "Erro",
            description: "Erro ao sair do grupo",
          })
        }
      },
    })
  }

  const handleDeleteGroup = async () => {
    setAlertModal({
      open: true,
      title: "Deletar Grupo",
      description: "Tem certeza que deseja deletar o grupo? Esta ação não pode ser desfeita.",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/groups/${groupId}`)
          router.push("/dashboard/groups")
        } catch (error) {
          setAlertModal({
            open: true,
            title: "Erro",
            description: "Erro ao deletar grupo",
          })
        }
      },
    })
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando grupo...</p>
      </div>
    )
  }

  const isOwner = user?.id === group.owner_id

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/groups")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
            {group.description && <p className="text-muted-foreground mt-2">{group.description}</p>}
          </div>

          <div className="flex gap-2">
            {isOwner ? (
              <Button variant="destructive" onClick={handleDeleteGroup}>
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            ) : (
              <Button variant="outline" onClick={handleLeaveGroup} className="border-border bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            )}
          </div>
        </div>

        <Card className="p-6 border-border">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Código de Convite</h3>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-surface rounded-lg border border-border text-primary font-mono">
                {group.invite_code}
              </code>
              <Button onClick={handleCopyInviteCode} variant="outline" className="border-border bg-transparent">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Compartilhe este código para convidar pessoas</p>
          </div>
        </Card>

        <Card className="p-6 border-border">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Ranking</h2>
          </div>

          <div className="space-y-3">
            {group.members.map((member: any, index: number) => (
              <div
                key={member.user_id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  index === 0 ? "border-primary bg-primary/5" : "border-border bg-surface"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    index === 0
                      ? "bg-primary text-white"
                      : index === 1
                        ? "bg-muted-foreground text-white"
                        : index === 2
                          ? "bg-warning text-white"
                          : "bg-surface-elevated text-foreground"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{member.username}</p>
                    {member.user_id === group.owner_id && <Crown className="h-4 w-4 text-warning" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.workout_count} treinos completados</p>
                </div>

                {index === 0 && <Trophy className="h-6 w-6 text-primary" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <AlertModal
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal({ ...alertModal, open })}
        title={alertModal.title}
        description={alertModal.description}
        onConfirm={alertModal.onConfirm}
        variant={alertModal.variant}
        cancelText={alertModal.onConfirm ? "Cancelar" : undefined}
        confirmText={alertModal.onConfirm ? "Confirmar" : "OK"}
      />
    </div>
  )
}
