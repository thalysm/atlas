"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BellRing, Plus, ArrowLeft, Trash2, Edit, CalendarDays, CalendarClock, Repeat } from "lucide-react" // Importar Edit e ícones de frequência
import { CreateReminderModal } from "@/components/reminders/create-reminder-modal"
import { AlertModal } from "@/components/ui/alert-modal"
import type { Reminder } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

const weekdaysMap: { [key: number]: string } = {
  0: "Seg", 1: "Ter", 2: "Qua", 3: "Qui", 4: "Sex", 5: "Sáb", 6: "Dom",
}

const formatFrequency = (reminder: Reminder): string => {
  if (reminder.frequency === 'daily') {
    return `Diário`
  }
  if (reminder.frequency === 'weekly' && Array.isArray(reminder.frequency_details)) {
    const days = reminder.frequency_details.map(d => weekdaysMap[d]).join(', ')
    return `Semanal (${days})`
  }
  if (reminder.frequency === 'monthly' && typeof reminder.frequency_details === 'number') {
    return `Mensal (dia ${reminder.frequency_details})`
  }
  return reminder.frequency // Fallback
}

const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
        case 'daily': return <Repeat className="h-4 w-4" />;
        case 'weekly': return <CalendarClock className="h-4 w-4" />;
        case 'monthly': return <CalendarDays className="h-4 w-4" />;
        default: return <BellRing className="h-4 w-4" />;
    }
}


export default function RemindersPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; description: string; onConfirm?: () => void }>({ open: false, title: "", description: "" })

  const { data: reminders, isLoading, mutate } = useSWR<Reminder[]>("/reminders", () => apiClient.get("/reminders"))

  const handleOpenCreateModal = () => {
    setEditingReminder(null) // Garante que não está editando
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setIsModalOpen(true)
  }

  const handleDeleteReminder = (reminderId: string, reminderTitle: string) => {
    setAlertModal({
      open: true,
      title: "Excluir Lembrete",
      description: `Tem certeza que deseja excluir o lembrete "${reminderTitle}"?`,
      onConfirm: async () => {
        try {
          await apiClient.delete(`/reminders/${reminderId}`)
          mutate((currentData) => currentData?.filter(r => r.id !== reminderId), false) // Otimisticamente remove
        } catch (error) {
          console.error("Failed to delete reminder", error)
          mutate() // Revalida em caso de erro
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <CreateReminderModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onReminderCreated={mutate}
        initialData={editingReminder} // Passa os dados para edição
      />
      <AlertModal
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal({ ...alertModal, open })}
        title={alertModal.title}
        description={alertModal.description}
        onConfirm={alertModal.onConfirm}
        variant="destructive"
        confirmText="Confirmar"
        cancelText="Cancelar"
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Lembretes de Suplementação</h1>
              <p className="text-muted-foreground">Gerencie seus horários e suplementos.</p>
            </div>
          </div>
          <Button onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lembrete
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando lembretes...</p>
        ) : reminders && reminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map(reminder => (
              <Card key={reminder.id} className="p-4 border-border flex flex-col justify-between">
                 <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <BellRing className="h-5 w-5 text-primary" />
                            </div>
                            <p className="font-semibold text-lg text-foreground">{reminder.title}</p>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                            {getFrequencyIcon(reminder.frequency)}
                            {formatFrequency(reminder)}
                        </Badge>
                    </div>
                    <p className="text-4xl font-bold text-primary text-center mb-4">{reminder.time}</p>
                 </div>
                <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEditModal(reminder)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeleteReminder(reminder.id, reminder.title)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                    </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-dashed border-2 border-border rounded-lg">
            <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum lembrete cadastrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie seu primeiro lembrete para não esquecer de tomar seus suplementos.
            </p>
            <Button className="mt-6" onClick={handleOpenCreateModal}>
              <Plus className="mr-2 h-4 w-4" /> Criar Lembrete
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}