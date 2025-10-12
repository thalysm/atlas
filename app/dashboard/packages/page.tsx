"use client"
import { useState } from "react"
import type React from "react"

import useSWR from "swr"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { WorkoutPackage } from "@/lib/types"
import { PackageCard } from "@/components/packages/package-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertModal } from "@/components/ui/alert-modal"
import { Plus, ArrowLeft, Package } from "lucide-react"
import { EditPackageModal } from "@/components/packages/edit-package-modal"

export default function PackagesPage() {
  const router = useRouter()
  const { data: myPackages, mutate } = useSWR<WorkoutPackage[]>("/packages", () => apiClient.get("/packages"))
  const { data: publicPackages } = useSWR<WorkoutPackage[]>("/packages/public", () => apiClient.get("/packages/public"))

  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [packageCode, setPackageCode] = useState("")
  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; description: string; onConfirm?: () => void, variant?: "default" | "destructive" }>({
    open: false,
    title: "",
    description: "",
  })

  const [editingPackage, setEditingPackage] = useState<WorkoutPackage | null>(null)

  const handleCopyPackage = async (packageId: string) => {
    try {
      await apiClient.post(`/packages/${packageId}/copy`)
      mutate()
      setAlertModal({
        open: true,
        title: "Sucesso",
        description: "Pacote copiado com sucesso!",
      })
    } catch (error) {
      setAlertModal({
        open: true,
        title: "Erro",
        description: "Erro ao copiar pacote",
      })
    }
  }

  const handleJoinPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post(`/packages/join`, { package_code: packageCode })
      mutate()
      setIsJoinOpen(false)
      setPackageCode("")
      setAlertModal({
        open: true,
        title: "Sucesso",
        description: "Pacote adicionado com sucesso!",
      })
    } catch (error) {
      setAlertModal({
        open: true,
        title: "Erro",
        description: "Código inválido ou pacote não encontrado",
      })
    }
  }

  const handleDeletePackage = (packageId: string) => {
    setAlertModal({
      open: true,
      title: "Confirmar Exclusão",
      description: "Tem certeza que deseja deletar este pacote? Esta ação não pode ser desfeita.",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/packages/${packageId}`)
          mutate()
          setAlertModal({ open: false, title: "", description: "" })
        } catch (error) {
          setAlertModal({
            open: true,
            title: "Erro",
            description: "Erro ao deletar o pacote.",
          })
        }
      },
    })
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
            <h1 className="text-3xl font-bold text-foreground">Pacotes de Treino</h1>
            <p className="text-muted-foreground">Gerencie seus treinos personalizados</p>
          </div>

          <div className="flex gap-2">
            <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-border bg-transparent">
                  <Package className="h-4 w-4 mr-2" />
                  Adicionar Pacote
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Adicionar Pacote Compartilhado</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleJoinPackage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="package-code">Código do Pacote</Label>
                    <Input
                      id="package-code"
                      placeholder="Digite o código"
                      value={packageCode}
                      onChange={(e) => setPackageCode(e.target.value)}
                      required
                      className="bg-surface border-border"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                    Adicionar Pacote
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => router.push("/dashboard/packages/new")}
              className="bg-primary hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Pacote
            </Button>
          </div>
        </div>

        <Tabs defaultValue="my-packages" className="w-full">
          <TabsList className="bg-surface">
            <TabsTrigger value="my-packages">Meus Pacotes</TabsTrigger>
            <TabsTrigger value="public">Pacotes Públicos</TabsTrigger>
          </TabsList>

          <TabsContent value="my-packages" className="space-y-4 mt-6">
            {myPackages && myPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onEdit={setEditingPackage}
                    onDelete={handleDeletePackage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Você ainda não tem pacotes de treino</p>
                <Button
                  onClick={() => router.push("/dashboard/packages/new")}
                  className="mt-4 bg-primary hover:bg-primary-hover"
                >
                  Criar Primeiro Pacote
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="public" className="space-y-4 mt-6">
            {publicPackages && publicPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onCopy={handleCopyPackage}
                    onEdit={setEditingPackage}
                    onDelete={handleDeletePackage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">Nenhum pacote público disponível</div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EditPackageModal
        isOpen={!!editingPackage}
        onOpenChange={() => setEditingPackage(null)}
        pkg={editingPackage}
        mutate={mutate}
      />

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