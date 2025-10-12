"use client"

import type React from "react"
import { useState, useMemo } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Search } from "lucide-react"

export default function NewPackagePage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_public: false,
  })

  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "strength" | "cardio">("all")
  
  const [alertModal, setAlertModal] = useState<{
    open: boolean
    title: string
    description: string
  }>({ open: false, title: "", description: "" })

  const { data: exercises } = useSWR<Exercise[]>(
    "/exercises",
    () => apiClient.get("/exercises")
  )

  const { categories, muscleGroups } = useMemo(() => {
    const categories = new Set<string>()
    const muscleGroups = new Set<string>()
    exercises?.forEach(ex => {
      categories.add(ex.category)
      ex.muscle_groups.forEach(mg => muscleGroups.add(mg))
    })
    return { 
      categories: Array.from(categories).sort(), 
      muscleGroups: Array.from(muscleGroups).sort() 
    }
  }, [exercises])

  const filteredExercises = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return exercises?.filter((exercise) => {
        const matchesSearch = lowercasedQuery === '' ||
            exercise.name.toLowerCase().includes(lowercasedQuery) ||
            (exercise.description && exercise.description.toLowerCase().includes(lowercasedQuery)) ||
            exercise.category.toLowerCase().includes(lowercasedQuery) ||
            exercise.type.toLowerCase().includes(lowercasedQuery) ||
            exercise.muscle_groups.some((group) => group.toLowerCase().includes(lowercasedQuery));

        const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
        const matchesMuscleGroup = muscleGroupFilter === "all" || exercise.muscle_groups.includes(muscleGroupFilter);
        const matchesType = typeFilter === "all" || exercise.type === typeFilter;

        return matchesSearch && matchesCategory && matchesMuscleGroup && matchesType;
    });
  }, [exercises, searchQuery, categoryFilter, muscleGroupFilter, typeFilter]);


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
              <h3 className="text-lg font-semibold text-foreground">
                Selecionar Exercícios ({selectedExercises.length})
              </h3>
              
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Buscar por nome, músculo, categoria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-surface border-border"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px] bg-surface border-border">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas Categorias</SelectItem>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                    <SelectTrigger className="w-full md:w-[180px] bg-surface border-border">
                        <SelectValue placeholder="Grupo Muscular" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos Músculos</SelectItem>
                        {muscleGroups.map(mg => <SelectItem key={mg} value={mg}>{mg}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Tabs value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)} className="w-full md:w-auto">
                    <TabsList className="grid w-full grid-cols-3 bg-surface">
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="strength">Força</TabsTrigger>
                        <TabsTrigger value="cardio">Cardio</TabsTrigger>
                    </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
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
                  Nenhum exercício encontrado com os filtros selecionados.
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