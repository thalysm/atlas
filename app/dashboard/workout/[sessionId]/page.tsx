"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { WorkoutSession, Exercise } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { StrengthSetInput } from "@/components/workout/strength-set-input"
import { CardioSetInput } from "@/components/workout/cardio-set-input"
import { Plus, Check, Clock, Trash2, X, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertModal } from "@/components/ui/alert-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExerciseCard } from "@/components/exercises/exercise-card"
import { RestTimer } from "@/components/workout/rest-timer"


export default function WorkoutSessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const { data: session, mutate } = useSWR<WorkoutSession>(sessionId ? `/sessions/${sessionId}` : null, () =>
    apiClient.get(`/sessions/${sessionId}`),
  )

  const { data: allExercises } = useSWR<Exercise[]>("/exercises", () => apiClient.get("/exercises"))

  const [exercises, setExercises] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; description: string; onConfirm?: () => void, variant?: 'default' | 'destructive' }>({ open: false, title: "", description: "" })

  useEffect(() => {
    if (session) {
      setExercises(session.exercises)
    }
  }, [session])

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    const exercise = newExercises[exerciseIndex]
    const setNumber = exercise.sets.length + 1

    if (exercise.type === "strength") {
      exercise.sets.push({
        set_number: setNumber,
        weight: 0,
        reps: 0,
        completed: false,
      })
    } else {
      exercise.sets.push({
        duration_minutes: 0,
        distance: undefined,
        incline: undefined,
        speed: undefined,
        completed: false,
      })
    }

    setExercises(newExercises)
    saveSession(newExercises)
  }

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, data: any) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex] = {
      ...newExercises[exerciseIndex].sets[setIndex],
      ...data,
    }
    setExercises(newExercises)
    saveSession(newExercises)
  }

  const handleToggleComplete = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex].completed = !newExercises[exerciseIndex].sets[setIndex].completed
    setExercises(newExercises)
    saveSession(newExercises)
  }

  const saveSession = async (exercisesData: any[]) => {
    if (session?.is_completed) return
    setIsSaving(true)
    try {
      await apiClient.put(`/sessions/${sessionId}`, { exercises: exercisesData })
      mutate()
    } catch (error) {
      console.error("Error saving session:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompleteWorkout = async () => {
    setAlertModal({
      open: true,
      title: "Finalizar Treino",
      description: "Tem certeza que deseja finalizar o treino? Você não poderá mais editá-lo.",
      onConfirm: async () => {
        try {
          await apiClient.post(`/sessions/${sessionId}/complete`)
          mutate()
          router.push("/dashboard")
        } catch (error) {
          alert("Erro ao finalizar treino")
        }
      }
    })
  }
  
  const handleCancelWorkout = () => {
    setAlertModal({
        open: true,
        title: "Cancelar Treino",
        description: "Tem certeza que deseja cancelar este treino? Esta ação não pode ser desfeita e todo o progresso será perdido.",
        variant: "destructive",
        onConfirm: async () => {
            try {
                await apiClient.delete(`/sessions/${sessionId}`);
                router.push("/dashboard"); 
            } catch (error) {
                setAlertModal({
                    open: true,
                    title: "Erro",
                    description: "Não foi possível cancelar o treino. Se ele já foi finalizado, não pode ser cancelado.",
                });
            }
        },
    });
  };

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
    saveSession(newExercises);
    setIsAddExerciseOpen(false);
    setSearchQuery("")
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    const exerciseName = exercises[exerciseIndex].exercise_name;
    setAlertModal({
        open: true,
        title: "Remover Exercício",
        description: `Tem certeza que deseja remover "${exerciseName}" deste treino?`,
        variant: "destructive",
        onConfirm: () => {
            const newExercises = exercises.filter((_, index) => index !== exerciseIndex);
            setExercises(newExercises);
            saveSession(newExercises);
            setAlertModal({ open: false, title: "", description: "" });
        },
    });
  };

  const filteredExercisesForModal = useMemo(() => 
    allExercises
      ?.filter(ex => !exercises.some(e => e.exercise_id === ex.id))
      .filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
  , [allExercises, exercises, searchQuery])


  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando treino...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{session.package_name}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Iniciado {formatDistanceToNow(new Date(session.start_time), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {!session.is_completed && (
              <>
                <Button variant="destructive" onClick={handleCancelWorkout}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleCompleteWorkout} className="bg-success hover:bg-success/90">
                  <Check className="h-4 w-4 mr-2" />
                  Finalizar Treino
                </Button>
              </>
            )}
          </div>
        </div>

        {isSaving && <div className="text-sm text-primary text-center">Salvando alterações...</div>}

        <div className="space-y-6">
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exercise.exercise_id || exerciseIndex} className="p-6 border-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">{exercise.exercise_name}</h3>
                  <div className="flex gap-2">
                    {!session.is_completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddSet(exerciseIndex)}
                        className="border-border"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Série
                      </Button>
                    )}
                    {!session.is_completed && (
                        <Button size="icon-sm" variant="destructive" onClick={() => handleRemoveExercise(exerciseIndex)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                  </div>
                </div>

                {exercise.notes && <p className="text-sm text-muted-foreground">{exercise.notes}</p>}

                <div className="space-y-2">
                  {exercise.sets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma série adicionada</p>
                  ) : (
                    exercise.sets.map((set: any, setIndex: number) =>
                      exercise.type === "strength" ? (
                        <StrengthSetInput
                          key={setIndex}
                          setNumber={setIndex + 1}
                          weight={set.weight}
                          reps={set.reps}
                          completed={set.completed}
                          onChange={(data) => handleUpdateSet(exerciseIndex, setIndex, data)}
                          onToggleComplete={() => handleToggleComplete(exerciseIndex, setIndex)}
                        />
                      ) : (
                        <CardioSetInput
                          key={setIndex}
                          durationMinutes={set.duration_minutes}
                          distance={set.distance}
                          incline={set.incline}
                          speed={set.speed}
                          completed={set.completed}
                          onChange={(data) => handleUpdateSet(exerciseIndex, setIndex, data)}
                          onToggleComplete={() => handleToggleComplete(exerciseIndex, setIndex)}
                        />
                      ),
                    )
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        {!session.is_completed && (
            <Button onClick={() => setIsAddExerciseOpen(true)} variant="outline" className="w-full border-border">
                <Plus className="h-4 w-4 mr-2"/>
                Adicionar Exercício Livre
            </Button>
        )}
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
                        <ExerciseCard 
                            exercise={exercise}
                        />
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
        cancelText={alertModal.onConfirm ? "Cancelar" : undefined}
        confirmText={alertModal.onConfirm ? "Confirmar" : "OK"}
      />

      {!session.is_completed && <RestTimer />}
    </div>
  )
}