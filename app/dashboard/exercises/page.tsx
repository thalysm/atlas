"use client"

import { useState } from "react"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { Exercise } from "@/lib/types"
import { ExerciseCard } from "@/components/exercises/exercise-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const { data: exercises, isLoading } = useSWR<Exercise[]>("/exercises", () => apiClient.get("/exercises"))

  const filteredExercises = exercises?.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(exercises?.map((ex) => ex.category) || []))

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exercícios</h1>
          <p className="text-muted-foreground">Explore todos os exercícios disponíveis</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exercícios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-surface border-border"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-surface border-border">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando exercícios...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises?.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}

        {!isLoading && filteredExercises?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Nenhum exercício encontrado</div>
        )}
      </div>
    </div>
  )
}
