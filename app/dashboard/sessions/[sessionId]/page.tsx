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
import { Plus, Save, Trash2, ArrowLeft, Search, X, Clock, Dumbbell, Flame } from "lucide-react" // Importar Flame
import { AlertModal } from "@/components/ui/alert-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExerciseCard } from "@/components/exercises/exercise-card"
import { format } from "date-fns" // Importar format
import { ptBR } from "date-fns/locale" // Importar ptBR

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
      // Use JSON parse/stringify for a deep copy to avoid modifying the original SWR cache
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
    // No need to call saveSession here if we only save on button click
  }

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    const exercise = newExercises[exerciseIndex]
    const setNumber = exercise.sets.length + 1

    const newSet = exercise.type === "strength"
      ? { set_number: setNumber, weight: 0, reps: 0, completed: true } // Default completed to true when editing
      : { duration_minutes: 0, distance: undefined, incline: undefined, speed: undefined, completed: true } // Default completed to true

    exercise.sets.push(newSet as StrengthSet | CardioSet)
    setExercises(newExercises)
  }

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.splice(setIndex, 1)
    // Renumber sets if needed (optional)
    newExercises[exerciseIndex].sets.forEach((set, index) => {
        if ('set_number' in set) {
            set.set_number = index + 1;
        }
    });
    setExercises(newExercises)
  }


  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await apiClient.put(`/sessions/${sessionId}`, { exercises })
      mutate() // Re-fetch or update SWR cache
      setAlertModal({ open: true, title: "Sucesso", description: "Treino atualizado com sucesso!"})
    } catch (error: any) {
      console.error("Failed to save session:", error)
      setAlertModal({ open: true, title: "Erro", description: error.message || "Não foi possível salvar as alterações."})
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
          router.push("/dashboard/sessions") // Navigate back after deletion
        } catch (error: any) {
          setAlertModal({
            open: true,
            title: "Erro",
            description: error.message || "Não foi possível deletar a sessão.",
          })
        }
      },
    })
  }

  const handleAddExercise = (exercise: Exercise) => {
    const newExerciseLog: ExerciseLog = { // Ensure type safety
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      type: exercise.type,
      sets: [], // Start with empty sets
      notes: undefined, // Explicitly undefined or null if preferred
    };
    const newExercises = [...exercises, newExerciseLog];
    setExercises(newExercises);
    setIsAddExerciseOpen(false);
    setSearchQuery("");
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
     const exerciseName = exercises[exerciseIndex]?.exercise_name || 'este exercício';
     setAlertModal({
        open: true,
        title: "Remover Exercício",
        description: `Tem certeza que deseja remover "${exerciseName}" deste treino?`,
        variant: "destructive",
        onConfirm: () => {
            const newExercises = exercises.filter((_, index) => index !== exerciseIndex);
            setExercises(newExercises);
            setAlertModal({ open: false, title: "", description: "" }); // Close modal after confirmation
        },
    });
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

  // Format date only when session is available
  const formattedDate = format(new Date(session.start_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/sessions")}
              className="text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{session.package_name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                 <div className="flex items-center gap-1">
                     <span>{formattedDate}</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{session.duration_minutes || 0} min</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4" />
                    <span>{exercises.length} exercícios</span> {/* Use state length */}
                 </div>
                 {session.total_calories !== undefined && session.total_calories !== null && (
                   <div className="flex items-center gap-1">
                     <Flame className="h-4 w-4 text-orange-500" />
                     <span>~{Math.round(session.total_calories)} kcal</span>
                   </div>
                 )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 self-start sm:self-center">
            <Button variant="destructive" onClick={handleDeleteSession}>
                <Trash2 className="h-4 w-4 mr-2"/>
                Deletar
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Salvando..." : <><Save className="h-4 w-4 mr-2"/> Salvar</>}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exercise.exercise_id || `exercise-${exerciseIndex}`} className="p-6 border-border"> {/* Fallback key */}
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
                    <div key={setIndex} className="flex items-center gap-2"> {/* Key on the wrapper div */}
                      <div className="flex-1">
                        {exercise.type === "strength" ? (
                          <StrengthSetInput
                            setNumber={setIndex + 1}
                            weight={set.weight}
                            reps={set.reps}
                            completed={set.completed}
                            onChange={(data) => handleUpdateSet(exerciseIndex, setIndex, data)}
                            onToggleComplete={() => {}} // Not used in edit mode, maybe remove?
                          />
                        ) : (
                          <CardioSetInput
                            durationMinutes={set.duration_minutes}
                            distance={set.distance}
                            incline={set.incline}
                            speed={set.speed}
                            completed={set.completed}
                            onChange={(data) => handleUpdateSet(exerciseIndex, setIndex, data)}
                            onToggleComplete={() => {}} // Not used in edit mode, maybe remove?
                          />
                        )}
                      </div>
                      <Button size="icon-sm" variant="destructive" onClick={() => handleRemoveSet(exerciseIndex, setIndex)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                   {exercise.sets.length === 0 && (
                     <p className="text-sm text-muted-foreground text-center py-2 italic">Nenhuma série registrada.</p>
                   )}
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

       {/* Modal de Adicionar Exercício */}
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
               <div key={exercise.id} onClick={() => handleAddExercise(exercise)} className="cursor-pointer"> {/* Added cursor-pointer */}
                 <ExerciseCard exercise={exercise} />
               </div>
             ))}
             {filteredExercisesForModal?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center col-span-1 md:col-span-2 py-8">Nenhum exercício encontrado ou todos já foram adicionados.</p>
             )}
           </div>
         </DialogContent>
       </Dialog>

      {/* Modal de Alerta */}
       <AlertModal
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal({ ...alertModal, open })}
        title={alertModal.title}
        description={alertModal.description}
        onConfirm={alertModal.onConfirm}
        variant={alertModal.variant}
        cancelText={alertModal.onConfirm ? "Cancelar" : "OK"} // Show Cancel only if there's a confirm action
        confirmText={alertModal.onConfirm ? "Confirmar" : undefined} // Only show Confirm if there's an action
      />
    </div>
  )
}