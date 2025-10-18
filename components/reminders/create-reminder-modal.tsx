"use client"

import React, { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Reminder } from "@/lib/types"

interface CreateReminderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReminderCreated: () => void // Renomeado para indicar criação ou atualização
  initialData?: Reminder | null // Para modo de edição
}

const weekdays = [
  { value: "0", label: "Seg" }, { value: "1", label: "Ter" }, { value: "2", label: "Qua" },
  { value: "3", label: "Qui" }, { value: "4", label: "Sex" }, { value: "5", label: "Sáb" },
  { value: "6", label: "Dom" },
]

export function CreateReminderModal({ open, onOpenChange, onReminderCreated, initialData }: CreateReminderModalProps) {
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily")
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([])
  const [selectedMonthDay, setSelectedMonthDay] = useState<number | string>(1)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setTime(initialData.time)
      setFrequency(initialData.frequency)
      if (initialData.frequency === 'weekly' && Array.isArray(initialData.frequency_details)) {
        setSelectedWeekdays(initialData.frequency_details.map(String))
      } else {
        setSelectedWeekdays([])
      }
      if (initialData.frequency === 'monthly' && typeof initialData.frequency_details === 'number') {
        setSelectedMonthDay(initialData.frequency_details)
      } else {
        setSelectedMonthDay(1)
      }
    } else {
      // Resetar ao abrir para criar
      setTitle("")
      setTime("")
      setFrequency("daily")
      setSelectedWeekdays([])
      setSelectedMonthDay(1)
      setError(null)
    }
  }, [initialData, open]) // Resetar ou preencher quando o modal abre ou initialData muda

  const getFrequencyDetails = () => {
    if (frequency === 'weekly') {
      return selectedWeekdays.map(Number).sort();
    }
    if (frequency === 'monthly') {
      return Number(selectedMonthDay);
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (frequency === 'weekly' && selectedWeekdays.length === 0) {
      setError("Selecione pelo menos um dia da semana.")
      return
    }
    if (frequency === 'monthly' && (!selectedMonthDay || Number(selectedMonthDay) < 1 || Number(selectedMonthDay) > 31)) {
       setError("Selecione um dia do mês válido (1-31).")
       return
    }

    setIsSaving(true)
    const payload = {
      title,
      time,
      frequency,
      frequency_details: getFrequencyDetails(),
    }

    try {
      if (isEditing) {
        await apiClient.put(`/reminders/${initialData.id}`, payload)
      } else {
        await apiClient.post("/reminders", payload)
      }
      onReminderCreated()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to save reminder:", err)
      setError(err.message || `Erro ao ${isEditing ? 'atualizar' : 'salvar'} lembrete.`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Lembrete" : "Novo Lembrete"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nome do Suplemento</Label>
              <Input id="title" placeholder="Ex: Creatina" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  value={selectedWeekdays}
                  onValueChange={(value) => setSelectedWeekdays(value)}
                  className="flex flex-wrap justify-start gap-1"
                >
                  {weekdays.map(day => (
                    <ToggleGroupItem key={day.value} value={day.value} aria-label={`Toggle ${day.label}`} className="w-10 h-10">
                      {day.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}

            {frequency === 'monthly' && (
              <div className="space-y-2">
                <Label htmlFor="monthDay">Dia do Mês</Label>
                <Input
                    id="monthDay"
                    type="number"
                    min="1"
                    max="31"
                    value={selectedMonthDay}
                    onChange={e => setSelectedMonthDay(e.target.value)}
                    placeholder="1-31"
                    required
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Criar Lembrete")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}