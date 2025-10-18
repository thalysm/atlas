"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { WorkoutSession, Exercise, ExerciseLog, StrengthSet, CardioSet } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StrengthSetInput } from "@/components/workout/strength-set-input"
import { CardioSetInput } from "@/components/workout/cardio-set-input"
import { 
  Plus, Save, Trash2, ArrowLeft, Search, X,
  Calendar, Clock, Flame, Dumbbell, CheckCircle, Target, Bike // Ícones para o resumo
} from "lucide-react"
import { format } from "date-fns" // Para o resumo
import { ptBR } from "date-fns/locale" // Para o resumo
import { ensureUtcAndParse } from "@/lib/utils" // Para o resumo
import { AlertModal } from "@/components/ui/alert-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExerciseCard } from "@/components/exercises/exercise-card"

// Helper para type guard (usado no resumo)
const isStrengthSet = (set: any): set is StrengthSet => 'weight' in set && 'reps' in set;
const isCardioSet = (set: any): set is CardioSet => 'duration_minutes' in set;

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
      // Clona os exercícios para o estado de edição
      setExercises(JSON.parse(JSON.stringify(session.exercises)))
    }
  }, [session]) // Depende apenas da sessão original

  // --- Lógica de Resumo (baseada no 'session' original) ---
  const summaryData = useMemo(() => {
    if (!session) return null;

    const startDate = ensureUtcAndParse(session.start_time);
    const endDate = session.end_time ? ensureUtcAndParse(session.end_time) : null;

    const formattedStartDate = startDate
      ? format(startDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
      : "Data inválida";
      
    const formattedEndDate = endDate
      ? format(endDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
      : (session.is_completed ? "Data inválida" : "Não finalizado");

    const totalVolume = session.exercises
      .filter(ex => ex.type === 'strength')
      .flatMap(ex => ex.sets)
      .filter(isStrengthSet)
      .reduce((acc, set) => acc + (set.weight * set.reps), 0);

    return {
      formattedStartDate,
      formattedEndDate,
      totalVolume,
      duration: session.duration_minutes || 0,
      exerciseCount: session.exercise_count || 0,
      calories: session.total_calories ? Math.round(session.total_calories) : 0
    };
  }, [session]);
  // --- Fim da Lógica de Resumo ---


  // --- Lógica de Edição (baseada no estado 'exercises') ---
  const handleUpdateSet = (exerciseIndex: number, setIndex: number, data: any) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex] = {
      ...newExercises[exerciseIndex].sets[setIndex],
      ...data,
    }
    setExercises(newExercises)
  }
  
  // << ADICIONADO: handleToggleComplete >>
  const handleToggleComplete = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    const set = newExercises[exerciseIndex].sets[setIndex];
    set.completed = !set.completed;
    setExercises(newExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    const exercise = newExercises[exerciseIndex]
    const setNumber = exercise.sets.length + 1

    const newSet = exercise.type === "strength"
      ? { set_number: setNumber, weight: 0, reps: 0, completed: true } // Assume 'completed' ao editar
      : { duration_minutes: 0, distance: undefined, incline: undefined, speed: undefined, completed: true }

    exercise.sets.push(newSet as StrengthSet | CardioSet)
    setExercises(newExercises)
  }
  
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.splice(setIndex, 1)
    // Renumera séries de força
    newExercises[exerciseIndex].sets.forEach((set, index) => {
      if ('set_number' in set) {
        (set as StrengthSet).set_number = index + 1;
      }
    });
    setExercises(newExercises)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      // Envia apenas os exercícios editados
      await apiClient.put(`/sessions/${sessionId}`, { exercises })
      mutate() // Revalida a sessão (atualiza o resumo)
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
          router.push("/dashboard/sessions") // Volta para a lista
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
  // --- Fim da Lógica de Edição ---


  if (!session || !summaryData) { // Espera a sessão e o resumo
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando detalhes do treino...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabeçalho de Edição */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()} // Volta para a pág anterior
              className="text-foreground"
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
              Deletar
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? "Salvando..." : <><Save className="h-4 w-4 mr-2"/> Salvar</>}
            </Button>
          </div>
        </div>

        {/* Card de Resumo (Visualização) */}
        <Card className="border-border">
            <CardHeader>
                <CardTitle className="text-xl">Resumo do Treino (Original)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-muted-foreground">Início</p>
                            <p className="font-semibold text-foreground">{summaryData.formattedStartDate}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-muted-foreground">Término</p>
                            <p className="font-semibold text-foreground">{summaryData.formattedEndDate}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-muted-foreground">Duração Total</p>
                            <p className="font-semibold text-foreground">{summaryData.duration} min</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-muted-foreground">Exercícios</p>
                            <p className="font-semibold text-foreground">{summaryData.exerciseCount}</p>
                        </div>
                    </div>
                    {summaryData.calories > 0 && (
                         <div className="flex items-center gap-3">
                            <Flame className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-muted-foreground">Calorias (Aprox.)</p>
                                <p className="font-semibold text-foreground">~{summaryData.calories} kcal</p>
                            </div>
                        </div>
                    )}
                    {summaryData.totalVolume > 0 && (
                         <div className="flex items-center gap-3">
                            <Target className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-muted-foreground">Volume Total (Força)</p>
                                <p className="font-semibold text-foreground">{summaryData.totalVolume.toLocaleString('pt-BR')} kg</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Lista de Exercícios (Edição) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Editar Exercícios</h2>
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
                            // Passa a função de toggle correta
                            onToggleComplete={() => handleToggleComplete(exerciseIndex, setIndex)}
                          />
                        ) : (
                          <CardioSetInput
                            durationMinutes={set.duration_minutes}
                            distance={set.distance}
                            incline={set.incline}
                            speed={set.speed}
                            completed={set.completed}
                            onChange={(data) => handleUpdateSet(exerciseIndex, setIndex, data)}
                            // Passa a função de toggle correta
                            onToggleComplete={() => handleToggleComplete(exerciseIndex, setIndex)}
                          />
                        )}
                      </div>
                      <Button size="icon-sm" variant="destructive" onClick={() => handleRemoveSet(exerciseIndex, setIndex)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {exercise.sets.length === 0 && (
                     <p className="text-sm text-muted-foreground text-center py-2">Nenhuma série. Adicione uma.</p>
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
              <div key={exercise.id} onClick={() => handleAddExercise(exercise)} className="cursor-pointer">
                <ExerciseCard exercise={exercise} />
              </div>
            ))}
            {filteredExercisesForModal?.length === 0 && (
                <p className="text-center text-muted-foreground py-8 col-span-1 md:col-span-2">
                Nenhum exercício encontrado.
                </p>
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
        // Ajusta o texto do botão de cancelamento
        cancelText={alertModal.onConfirm ? "Cancelar" : "OK"}
        // Ajusta o texto do botão de confirmação
        confirmText={alertModal.onConfirm ? "Confirmar" : ""}
      />
    </div>
  )
}