"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertModal } from "@/components/ui/alert-modal"

interface HealthDataModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HealthDataModal({ open, onOpenChange }: HealthDataModalProps) {
  const { user, mutate } = useAuth()
  const [formData, setFormData] = useState({
    height: user?.height || 0,
    weight: user?.weight || 0,
    gender: user?.gender || '',
    birth_date: user?.birth_date || ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; description: string }>({
    open: false,
    title: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await apiClient.put("/auth/me", {
        ...user,
        ...formData,
        height: Number(formData.height) || null,
        weight: Number(formData.weight) || null,
        birth_date: formData.birth_date || null
      });
      mutate()
      onOpenChange(false)
    } catch (error: any) {
      setAlertModal({ open: true, title: "Erro", description: error.message || "Não foi possível salvar os dados." })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Complete seu Perfil</DialogTitle>
              <DialogDescription>
                Para uma melhor experiência e cálculos mais precisos, por favor, preencha seus dados de saúde.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="height" className="text-right">
                  Altura (cm)
                </Label>
                <Input id="height" type="number" value={formData.height || ''} onChange={e => setFormData({ ...formData, height: Number(e.target.value) })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="weight" className="text-right">
                  Peso (kg)
                </Label>
                <Input id="weight" type="number" value={formData.weight || ''} onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })} step="0.1" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birth_date" className="text-right">
                  Nascimento
                </Label>
                <Input id="birth_date" type="date" value={formData.birth_date} onChange={e => setFormData({ ...formData, birth_date: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-right">
                  Sexo
                </Label>
                <Select value={formData.gender} onValueChange={value => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefiro não dizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertModal
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal({ ...alertModal, open })}
        title={alertModal.title}
        description={alertModal.description}
      />
    </>
  )
}