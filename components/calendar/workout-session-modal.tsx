"use client"

import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { WorkoutSession, ExerciseLog, StrengthSet, CardioSet } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog" // Added DialogDescription
import { Badge } from "@/components/ui/badge"
import { Clock, Dumbbell, Zap, Flame } from "lucide-react"

interface WorkoutSessionModalProps {
  sessionId: string | null
  onOpenChange: (isOpen: boolean) => void
}

const isStrengthSet = (set: any): set is StrengthSet => 'weight' in set && 'reps' in set

export function WorkoutSessionModal({ sessionId, onOpenChange }: WorkoutSessionModalProps) {
  const { data: session, isLoading } = useSWR<WorkoutSession>(
    sessionId ? `/sessions/${sessionId}` : null,
    (url) => apiClient.get(url),
    { revalidateOnFocus: false } // Prevent re-fetching just on focus, maybe helps stability
  )

  const handleOpenChange = (isOpen: boolean) => {
    // Ensure sessionId is cleared when modal is explicitly closed
    if (!isOpen) {
      onOpenChange(false);
    } else {
        onOpenChange(true); // Propagate open state if needed, though usually handled by parent
    }
  }


  return (
    <Dialog open={!!sessionId} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col bg-card border-border">
        {isLoading || !session ? (
          <div className="flex items-center justify-center h-full">
            {/* Optional: Add a placeholder title while loading */}
            <DialogHeader className="sr-only">
                <DialogTitle>Carregando Treino</DialogTitle>
                <DialogDescription>Aguarde enquanto os detalhes do treino são carregados.</DialogDescription>
            </DialogHeader>
            <p className="text-muted-foreground">Carregando detalhes do treino...</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              {/* Conditionally render title only when session exists */}
              {session && <DialogTitle className="text-foreground">{session.package_name}</DialogTitle>}
              {/* Adding an optional DialogDescription for better accessibility */}
              <DialogDescription className="sr-only">Detalhes da sessão de treino {session.package_name}.</DialogDescription>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{session.duration_minutes || 0} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  <span>{session.exercises.length} exercícios</span>
                </div>
                {session.total_calories !== undefined && session.total_calories !== null && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>~{Math.round(session.total_calories)} kcal</span>
                  </div>
                )}
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
                      {exercise.sets.length > 0 ? exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex justify-between items-center text-sm p-2 bg-background rounded-md">
                          <span className="font-medium text-muted-foreground">Série {setIndex + 1}</span>
                          {isStrengthSet(set) ? (
                            <div className="flex gap-4">
                              <span>Peso: <span className="font-semibold text-primary">{set.weight} kg</span></span>
                              <span>Reps: <span className="font-semibold text-primary">{set.reps}</span></span>
                            </div>
                          ) : (
                            <div className="flex gap-4 flex-wrap justify-end">
                              <span>Duração: <span className="font-semibold text-primary">{(set as CardioSet).duration_minutes} min</span></span>
                              {(set as CardioSet).distance && <span>Dist.: <span className="font-semibold text-primary">{(set as CardioSet).distance} km</span></span>}
                               {(set as CardioSet).speed && <span>Vel.: <span className="font-semibold text-primary">{(set as CardioSet).speed} km/h</span></span>}
                                {(set as CardioSet).incline && <span>Incl.: <span className="font-semibold text-primary">{(set as CardioSet).incline}%</span></span>}
                            </div>
                          )}
                        </div>
                      )) : <p className="text-xs text-muted-foreground text-center italic">Nenhuma série registrada para este exercício.</p>}
                    </div>
                    {exercise.notes && <p className="text-xs italic text-muted-foreground mt-2">Nota: {exercise.notes}</p>}
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