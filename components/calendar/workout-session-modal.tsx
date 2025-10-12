"use client"

import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { WorkoutSession, ExerciseLog, StrengthSet, CardioSet } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, Dumbbell, Zap } from "lucide-react"

interface WorkoutSessionModalProps {
  sessionId: string | null
  onOpenChange: (isOpen: boolean) => void
}

const isStrengthSet = (set: any): set is StrengthSet => 'weight' in set && 'reps' in set

export function WorkoutSessionModal({ sessionId, onOpenChange }: WorkoutSessionModalProps) {
  const { data: session, isLoading } = useSWR<WorkoutSession>(
    sessionId ? `/sessions/${sessionId}` : null,
    (url) => apiClient.get(url)
  )

  return (
    <Dialog open={!!sessionId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col bg-card border-border">
        {isLoading || !session ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Carregando detalhes do treino...</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground">{session.package_name}</DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{session.duration_minutes || 0} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  <span>{session.exercises.length} exercícios</span>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto mt-4 pr-4">
              <div className="space-y-4">
                {session.exercises.map((exercise: ExerciseLog, index: number) => (
                  <div key={index} className="p-4 rounded-lg bg-surface border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{exercise.exercise_name}</h4>
                      <Badge variant={exercise.type === 'strength' ? 'default' : 'secondary'}>
                        {exercise.type === 'strength' ? 'Força' : 'Cardio'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex justify-between items-center text-sm p-2 bg-background rounded-md">
                          <span className="font-medium text-muted-foreground">Série {setIndex + 1}</span>
                          {isStrengthSet(set) ? (
                            <div className="flex gap-4">
                              <span>Peso: <span className="font-semibold text-primary">{set.weight} kg</span></span>
                              <span>Reps: <span className="font-semibold text-primary">{set.reps}</span></span>
                            </div>
                          ) : (
                            <div className="flex gap-4">
                              <span>Duração: <span className="font-semibold text-primary">{(set as CardioSet).duration_minutes} min</span></span>
                              {(set as CardioSet).distance && <span>Distância: <span className="font-semibold text-primary">{(set as CardioSet).distance} km</span></span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}