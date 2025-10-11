"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Calendar, Clock, TrendingUp, Dumbbell, ArrowLeft } from "lucide-react"

export default function AnalyticsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("30")

  const { data: stats } = useSWR(`/analytics/stats?days=${timeRange}`, () =>
    apiClient.get<{
      total_workouts: number
      total_duration_minutes: number
      average_duration_minutes: number
      workouts_by_day: Record<string, number>
    }>(`/analytics/stats?days=${timeRange}`),
  )

  const workoutsByDayData = stats?.workouts_by_day
    ? Object.entries(stats.workouts_by_day).map(([date, count]) => ({
        date,
        workouts: count,
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
            className="text-foreground hover:text-primary"
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

          <Card className="p-6 border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Total</p>
                <p className="text-3xl font-bold text-foreground">
                  {Math.floor((stats?.total_duration_minutes || 0) / 60)}h
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duração Média</p>
                <p className="text-3xl font-bold text-foreground">{stats?.average_duration_minutes || 0} min</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dias Ativos</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.workouts_by_day ? Object.keys(stats.workouts_by_day).length : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Treinos por Dia</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutsByDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="date" stroke="#b0b0b0" tick={{ fill: "#b0b0b0" }} />
                <YAxis stroke="#b0b0b0" tick={{ fill: "#b0b0b0" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2a2a2a",
                    border: "1px solid #404040",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="workouts" fill="#ff6b00" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Progressão de Exercícios</h2>
          <p className="text-sm text-muted-foreground">
            Selecione um exercício específico para ver sua progressão de carga ao longo do tempo
          </p>
        </Card>
      </div>
    </div>
  )
}
