"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface WaterIntakeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWaterLogged: () => void
}

const presetAmounts = [200, 300, 500, 750]

export function WaterIntakeModal({ open, onOpenChange, onWaterLogged }: WaterIntakeModalProps) {
  const [customAmount, setCustomAmount] = useState<number | string>("")
  const [isSaving, setIsSaving] = useState(false)

  const handleLogWater = async (amount_ml: number) => {
    if (amount_ml <= 0) return
    setIsSaving(true)
    try {
      await apiClient.post("/water", { amount_ml })
      onWaterLogged()
      onOpenChange(false)
      setCustomAmount("")
    } catch (error) {
      console.error("Failed to log water intake:", error)
      // Aqui você poderia mostrar um toast de erro
    } finally {
      setIsSaving(false)
    }
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogWater(Number(customAmount))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Água</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">Selecione uma quantidade ou insira um valor personalizado em ml.</p>
          <div className="grid grid-cols-2 gap-2">
            {presetAmounts.map(amount => (
              <Button key={amount} variant="outline" onClick={() => handleLogWater(amount)} disabled={isSaving}>
                {amount} ml
              </Button>
            ))}
          </div>
          <form onSubmit={handleCustomSubmit} className="flex gap-2 items-center">
            <Input
              id="custom-amount"
              type="number"
              placeholder="Valor personalizado (ml)"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
            />
            <Button type="submit" disabled={isSaving || Number(customAmount) <= 0}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}