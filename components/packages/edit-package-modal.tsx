"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { Exercise, WorkoutPackage } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExerciseCard } from "@/components/exercises/exercise-card"
import { X, Save, Search } from "lucide-react"

interface EditPackageModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  pkg: WorkoutPackage | null
  mutate: () => void
}

export function EditPackageModal({ isOpen, onOpenChange, pkg, mutate }: EditPackageModalProps) {
  const [formData, setFormData] = useState({ name: "", description: "", is_public: false })
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "strength" | "cardio">("all")

  const { data: exercises } = useSWR<Exercise[]>("/exercises", () => apiClient.get("/exercises"))

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        description: pkg.description || "",
        is_public: pkg.is_public,
      })
      setSelectedExercises(pkg.exercises.map((ex) => ex.exercise_id))
    }
  }, [pkg])

  const categories = useMemo(() => Array.from(new Set(exercises?.map((ex) => ex.category) || [])), [exercises])

  const filteredExercises = useMemo(() => {
    return exercises?.filter((exercise) => {
      const matchesSearch =
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscle_groups.some((group) => group.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter
      const matchesType = typeFilter === "all" || exercise.type === typeFilter
      return matchesSearch && matchesCategory && matchesType
    })
  }, [exercises, searchQuery, categoryFilter, typeFilter])

  if (!pkg) return null

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId]
    )
  }

  const handleSaveChanges = async () => {
    try {
      const exercisesArray = selectedExercises.map((exerciseId, index) => ({
        exercise_id: exerciseId,
        order: index + 1,
        notes: pkg.exercises.find(ex => ex.exercise_id === exerciseId)?.notes || null,
      }))

      await apiClient.put(`/packages/${pkg.id}`, {
        name: formData.name,
        description: formData.description || null,
        exercises: exercisesArray,
        is_public: formData.is_public,
      })
      mutate()
      onOpenChange(false)
    } catch (error) {
      // Handle error appropriately
      console.error("Failed to save package:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Pacote: {formData.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
          <TabsList className="bg-surface w-full sm:w-auto">
            <TabsTrigger value="details">Detalhes do Pacote</TabsTrigger>
            <TabsTrigger value="add">Adicionar Exercícios</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="flex-1 overflow-y-auto mt-4 pr-4 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Pacote</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-surface border-border"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-surface border-border"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked as boolean })}
                />
                <Label htmlFor="is_public">Tornar público</Label>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Exercícios no Pacote ({selectedExercises.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2 border rounded-md p-2 border-border">
                {selectedExercises.length > 0 ? (
                  selectedExercises.map((exerciseId) => {
                    const exercise = exercises?.find((e) => e.id === exerciseId)
                    if (!exercise) return null
                    return (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between p-2 rounded-md bg-surface"
                      >
                        <span className="text-sm font-medium text-foreground">{exercise.name}</span>
                        <Button size="icon-sm" variant="ghost" onClick={() => toggleExercise(exercise.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum exercício selecionado.</p>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="add" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar exercícios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-surface border-border"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-surface border-border">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Tabs defaultValue="all" onValueChange={(value) => setTypeFilter(value as any)} className="w-full sm:w-auto">
                <TabsList className="bg-surface grid grid-cols-3 w-full">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="strength">Força</TabsTrigger>
                  <TabsTrigger value="cardio">Cardio</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredExercises?.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onSelect={() => toggleExercise(exercise.id)}
                  selected={selectedExercises.includes(exercise.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 pt-4 border-t border-border">
          <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary-hover">
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}