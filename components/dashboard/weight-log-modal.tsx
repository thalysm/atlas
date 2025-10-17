"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Weight } from "lucide-react"

interface WeightLogModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWeightLogged: () => void
}

export function WeightLogModal({ open, onOpenChange, onWeightLogged }: WeightLogModalProps) {
  const { user } = useAuth()
  const [weight, setWeight] = useState<number | string>(user?.weight || "")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user?.weight) {
      setWeight(user.weight)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (Number(weight) <= 0) return
    setIsSaving(true)
    try {
      await apiClient.post("/weight", { weight: Number(weight) })
      onWeightLogged()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to log weight:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Atualizar Peso</DialogTitle>
            <DialogDescription>
              Registre seu peso atual para acompanhar sua evolução.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Weight className="h-5 w-5 text-muted-foreground" />
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="Seu peso em kg"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="col-span-3"
              />
               <span className="text-muted-foreground">kg</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving || Number(weight) <= 0}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}