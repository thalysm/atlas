"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Calendar, Clock, TrendingUp, Dumbbell, ArrowLeft, Weight, Repeat, BarChart3, Droplet } from "lucide-react"
import type { Exercise } from "@/lib/types"

interface WorkoutStats {
  total_workouts: number
  total_duration_minutes: number
  average_duration_minutes: number
  workouts_by_day: Record<string, number>
  total_volume: number
  weekly_frequency: number
  most_frequent_exercise: { name: string; count: number } | null
}

interface ProgressionData {
  date: string
  weight: number
  reps: number
  volume: number
}

interface WaterStats {
  [date: string]: number;
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("30")
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  const { data: stats } = useSWR<WorkoutStats>(`/analytics/stats?days=${timeRange}`, () =>
    apiClient.get(`/analytics/stats?days=${timeRange}`)
  )

  const { data: exercises } = useSWR<Exercise[]>("/exercises", () => apiClient.get("/exercises"))

  const { data: progressionData } = useSWR<ProgressionData[]>(
    selectedExerciseId ? `/analytics/progression/${selectedExerciseId}?days=${timeRange}` : null,
    (url) => apiClient.get(url)
  )

  const { data: waterStats } = useSWR<WaterStats>(`/analytics/water/stats?days=${timeRange}`, () =>
    apiClient.get(`/analytics/water/stats?days=${timeRange}`)
  )

  const strengthExercises = useMemo(() => exercises?.filter(ex => ex.type === 'strength') || [], [exercises])

  const workoutsByDayData = stats?.workouts_by_day
    ? Object.entries(stats.workouts_by_day).map(([date, count]) => ({
        date,
        workouts: count,
      }))
    : []

  const formattedProgressionData = useMemo(() => {
    if (!progressionData) return []
    // Aggregate data by date, taking the max volume and max weight for that day
    const aggregated = progressionData.reduce((acc, curr) => {
      const date = new Date(curr.date).toLocaleDateString('pt-BR')
      if (!acc[date]) {
        acc[date] = { date, maxWeight: 0, totalVolume: 0 }
      }
      acc[date].maxWeight = Math.max(acc[date].maxWeight, curr.weight)
      acc[date].totalVolume += curr.volume
      return acc
    }, {} as Record<string, { date: string; maxWeight: number; totalVolume: number }>)

    return Object.values(aggregated).sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime())
  }, [progressionData])

  const waterByDayData = waterStats
    ? Object.entries(waterStats).map(([date, amount]) => ({
        date,
        liters: parseFloat((amount / 1000).toFixed(2)),
      }))
    : []


  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="text-foreground "
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Análises</h1>
            <p className="text-muted-foreground">Acompanhe seu progresso</p>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 bg-surface border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Treinos */}
          <Card className="p-6 border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Treinos</p>
                <p className="text-3xl font-bold text-foreground">{stats?.total_workouts || 0}</p>
              </div>
            </div>
          </Card>

          {/* Volume Total */}
          <Card className="p-6 border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Weight className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume Total</p>
                <p className="text-3xl font-bold text-foreground">{(stats?.total_volume || 0).toLocaleString()} kg</p>
              </div>
            </div>
          </Card>

          {/* Duração Média */}
          <Card className="p-6 border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duração Média</p>
                <p className="text-3xl font-bold text-foreground">{stats?.average_duration_minutes || 0} min</p>
              </div>
            </div>
          </Card>

          {/* Frequência Semanal */}
          <Card className="p-6 border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frequência Semanal</p>
                <p className="text-3xl font-bold text-foreground">{(stats?.weekly_frequency || 0).toFixed(1)}x</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Exercício mais treinado */}
        {stats?.most_frequent_exercise &&
            <Card className="p-6 border-border">
                <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <Repeat className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Exercício Mais Treinado</p>
                    <p className="text-2xl font-bold text-foreground">{stats.most_frequent_exercise.name} <span className="text-lg font-medium text-muted-foreground">({stats.most_frequent_exercise.count}x)</span></p>
                </div>
                </div>
            </Card>
        }

        <Card className="p-6 border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Consumo de Água (Litros)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterByDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="date" stroke="#b0b0b0" tick={{ fill: "#b0b0b0" }} fontSize={12} />
                <YAxis stroke="#b0b0b0" tick={{ fill: "#b0b0b0" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2a2a2a",
                    border: "1px solid #404040",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="liters" name="Litros" fill="#3498db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Treinos por Dia</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutsByDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="date" stroke="#b0b0b0" tick={{ fill: "#b0b0b0" }} fontSize={12} />
                <YAxis stroke="#b0b0b0" tick={{ fill: "#b0b0b0" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2a2a2a",
                    border: "1px solid #404040",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="workouts" name="Treinos" fill="#ff6b00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-foreground">Progressão de Exercícios</h2>
            <Select onValueChange={setSelectedExerciseId}>
              <SelectTrigger className="w-full sm:w-64 bg-surface border-border">
                <SelectValue placeholder="Selecione um exercício" />
              </SelectTrigger>
              <SelectContent>
                {strengthExercises.map(exercise => (
                  <SelectItem key={exercise.id} value={exercise.id}>{exercise.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-80">
            {selectedExerciseId && formattedProgressionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedProgressionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="date" stroke="#b0b0b0" tick={{ fill: "#b0b0b0" }} fontSize={12} />
                  <YAxis yAxisId="left" stroke="#ff6b00" tick={{ fill: "#ff6b00" }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fill: "#82ca9d" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2a2a2a",
                      border: "1px solid #404040",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="totalVolume" name="Volume Total (kg)" stroke="#ff6b00" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="maxWeight" name="Carga Máxima (kg)" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  {selectedExerciseId ? "Nenhum dado de progressão para este exercício no período selecionado." : "Selecione um exercício de força para ver sua progressão."}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}