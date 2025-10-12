"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { WorkoutSession, Exercise, ExerciseLog, StrengthSet, CardioSet } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { StrengthSetInput } from "@/components/workout/strength-set-input"
import { CardioSetInput } from "@/components/workout/cardio-set-input"
import { Plus, Save, Trash2, ArrowLeft, Search, X } from "lucide-react"
import { AlertModal } from "@/components/ui/alert-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExerciseCard } from "@/components/exercises/exercise-card"

export default function SessionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const { data: session, mutate } = useSWR<WorkoutSession>(sessionId ? `/sessions/${sessionId}` : null, () =>
    apiClient.get(`/sessions/${sessionId}`)
  )

  const { data: allExercises } = useSWR<Exercise[]>("/exercises", () => apiClient.get("/exercises"))

  const [exercises, setExercises] = useState<ExerciseLog[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; description: string; onConfirm?: () => void, variant?: 'default' | 'destructive' }>({ open: false, title: "", description: "" })

  useEffect(() => {
    if (session) {
      setExercises(JSON.parse(JSON.stringify(session.exercises)))
    }
  }, [session])

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, data: any) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex] = {
      ...newExercises[exerciseIndex].sets[setIndex],
      ...data,
    }
    setExercises(newExercises)
  }

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    const exercise = newExercises[exerciseIndex]
    const setNumber = exercise.sets.length + 1

    const newSet = exercise.type === "strength"
      ? { set_number: setNumber, weight: 0, reps: 0, completed: true }
      : { duration_minutes: 0, distance: undefined, incline: undefined, speed: undefined, completed: true }

    exercise.sets.push(newSet as StrengthSet | CardioSet)
    setExercises(newExercises)
  }
  
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.splice(setIndex, 1)
    setExercises(newExercises)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await apiClient.put(`/sessions/${sessionId}`, { exercises })
      mutate()
      setAlertModal({ open: true, title: "Sucesso", description: "Treino atualizado com sucesso!"})
    } catch (error) {
      console.error("Failed to save session:", error)
      setAlertModal({ open: true, title: "Erro", description: "Não foi possível salvar as alterações."})
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSession = () => {
    setAlertModal({
      open: true,
      title: "Confirmar Exclusão",
      description: `Tem certeza que deseja deletar o treino "${session?.package_name}"? Esta ação não pode ser desfeita.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/sessions/${sessionId}`)
          router.push("/dashboard/sessions")
        } catch (error) {
          setAlertModal({
            open: true,
            title: "Erro",
            description: "Não foi possível deletar a sessão.",
          })
        }
      },
    })
  }
  
  const handleAddExercise = (exercise: Exercise) => {
    const newExerciseLog = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      type: exercise.type,
      sets: [],
      notes: null,
    };
    const newExercises = [...exercises, newExerciseLog];
    setExercises(newExercises);
    setIsAddExerciseOpen(false);
    setSearchQuery("");
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    const newExercises = exercises.filter((_, index) => index !== exerciseIndex);
    setExercises(newExercises);
  };
  
  const filteredExercisesForModal = useMemo(() =>
    allExercises
      ?.filter(ex => !exercises.some(e => e.exercise_id === ex.id))
      .filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
  , [allExercises, exercises, searchQuery]);


  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando detalhes do treino...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/sessions")}
              className="text-foreground hover:text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Editar Treino</h1>
              <p className="text-muted-foreground">{session.package_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleDeleteSession}>
                <Trash2 className="h-4 w-4 mr-2"/>
                Deletar Sessão
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Salvando..." : <><Save className="h-4 w-4 mr-2"/> Salvar</>}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exercise.exercise_id || exerciseIndex} className="p-6 border-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">{exercise.exercise_name}</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddSet(exerciseIndex)}
                      className="border-border"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Série
                    </Button>
                    <Button size="icon-sm" variant="destructive" onClick={() => handleRemoveExercise(exerciseIndex)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {exercise.sets.map((set: any, setIndex: number) => (
                    <div key={setIndex} className="flex items-center gap-2">
                      <div className="flex-1">
                        {exercise.type === "strength" ? (
                          <StrengthSetInput
                            setNumber={setIndex + 1}
                            weight={set.weight}
                            reps={set.reps}
                            completed={set.completed}
                            onChange={(data) => handleUpdateSet(exerciseIndex, setIndex, data)}
                            onToggleComplete={() => {}}
                          />
                        ) : (
                          <CardioSetInput
                            durationMinutes={set.duration_minutes}
                            distance={set.distance}
                            incline={set.incline}
                            speed={set.speed}
                            completed={set.completed}
                            onChange={(data) => handleUpdateSet(exerciseIndex, setIndex, data)}
                            onToggleComplete={() => {}}
                          />
                        )}
                      </div>
                      <Button size="icon-sm" variant="destructive" onClick={() => handleRemoveSet(exerciseIndex, setIndex)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Button onClick={() => setIsAddExerciseOpen(true)} variant="outline" className="w-full border-border">
          <Plus className="h-4 w-4 mr-2"/>
          Adicionar Exercício
        </Button>
      </div>

      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Adicionar Exercício ao Treino</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exercício..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface border-border"
            />
          </div>
          <div className="flex-1 overflow-y-auto mt-4 pr-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredExercisesForModal?.map(exercise => (
              <div key={exercise.id} onClick={() => handleAddExercise(exercise)}>
                <ExerciseCard exercise={exercise} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertModal
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal({ ...alertModal, open })}
        title={alertModal.title}
        description={alertModal.description}
        onConfirm={alertModal.onConfirm}
        variant={alertModal.variant}
        cancelText={alertModal.onConfirm ? "Cancelar" : "OK"}
        confirmText="Confirmar"
      />
    </div>
  )
}