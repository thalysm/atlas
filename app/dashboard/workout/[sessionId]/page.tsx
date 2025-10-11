"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { WorkoutSession } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StrengthSetInput } from "@/components/workout/strength-set-input"
import { CardioSetInput } from "@/components/workout/cardio-set-input"
import { Plus, Check, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function WorkoutSessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const { data: session, mutate } = useSWR<WorkoutSession>(sessionId ? `/sessions/${sessionId}` : null, () =>
    apiClient.get(`/sessions/${sessionId}`),
  )

  const [exercises, setExercises] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

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
    setIsSaving(true)
    try {
      await apiClient.put(`/sessions/${sessionId}`, { exercises: exercisesData })
    } catch (error) {
      console.error("Error saving session:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompleteWorkout = async () => {
    if (!confirm("Finalizar treino? Você não poderá mais editá-lo.")) return

    try {
      await apiClient.post(`/sessions/${sessionId}/complete`)
      mutate()
      router.push("/dashboard")
    } catch (error) {
      alert("Erro ao finalizar treino")
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando treino...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
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

          {!session.is_completed && (
            <Button onClick={handleCompleteWorkout} className="bg-success hover:bg-success/90">
              <Check className="h-4 w-4 mr-2" />
              Finalizar Treino
            </Button>
          )}
        </div>

        {isSaving && <div className="text-sm text-primary">Salvando...</div>}

        <div className="space-y-6">
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exerciseIndex} className="p-6 border-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">{exercise.exercise_name}</h3>
                  {!session.is_completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddSet(exerciseIndex)}
                      className="border-border"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Série
                    </Button>
                  )}
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
                          setNumber={set.set_number}
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
      </div>
    </div>
  )
}
