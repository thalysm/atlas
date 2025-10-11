"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { Exercise } from "@/lib/types"
import { ExerciseCard } from "@/components/exercises/exercise-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { AlertModal } from "@/components/ui/alert-modal"
import { ArrowLeft, Plus } from "lucide-react"

export default function NewPackagePage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_public: false,
  })

  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [alertModal, setAlertModal] = useState<{
    open: boolean
    title: string
    description: string
  }>({ open: false, title: "", description: "" })

  const { data: exercises } = useSWR<Exercise[]>(
    "/exercises",
    () => apiClient.get("/exercises")
  )

  const filteredExercises = exercises?.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.muscle_groups.some((group) =>
        group.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedExercises.length === 0) {
      setAlertModal({
        open: true,
        title: "Erro",
        description: "Selecione pelo menos um exercício",
      })
      return
    }

    try {
      const exercisesArray = selectedExercises.map((exerciseId, index) => ({
        exercise_id: exerciseId,
        order: index + 1,
        notes: null,
      }))

      await apiClient.post("/packages", {
        name: formData.name,
        description: formData.description || null,
        exercises: exercisesArray,
        is_public: formData.is_public,
      })

      setAlertModal({
        open: true,
        title: "Sucesso",
        description: "Pacote criado com sucesso!",
      })

      setTimeout(() => router.push("/dashboard/packages"), 1500)
    } catch (error) {
      setAlertModal({
        open: true,
        title: "Erro",
        description: "Erro ao criar pacote",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Novo Pacote de Treino
            </h1>
            <p className="text-muted-foreground">
              Crie um pacote personalizado com seus exercícios
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pacote Info */}
          <Card className="p-6 border-border">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Pacote</Label>
                <Input
                  id="name"
                  placeholder="Ex: Treino de Pernas"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-surface border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Descreva seu treino..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-surface border-border"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_public: checked as boolean })
                  }
                />
                <Label htmlFor="is_public" className="cursor-pointer">
                  Tornar público (outros usuários poderão copiar)
                </Label>
              </div>
            </div>
          </Card>

          {/* Exercícios */}
          <Card className="p-6 border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Selecionar Exercícios ({selectedExercises.length})
                </h3>
                <Input
                  placeholder="Buscar exercícios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs bg-surface border-border"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises?.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onSelect={() => toggleExercise(exercise.id)}
                    selected={selectedExercises.includes(exercise.id)}
                  />
                ))}
              </div>

              {filteredExercises?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum exercício encontrado
                </p>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-hover">
              <Plus className="h-4 w-4 mr-2" />
              Criar Pacote
            </Button>
          </div>
        </form>
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