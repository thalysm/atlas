"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import { WorkoutCalendar } from "@/components/calendar/workout-calendar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Clock, Dumbbell, ArrowLeft } from "lucide-react"
import { WorkoutSessionModal } from "@/components/calendar/workout-session-modal"

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const { data: calendarData } = useSWR(
    `/analytics/calendar?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`,
    () =>
      apiClient.get<{ calendar_data: Record<string, any[]> }>(
        `/analytics/calendar?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`
      )
  )

  const workoutsByDate = calendarData?.calendar_data || {}
  
  const selectedWorkouts = selectedDate 
    ? workoutsByDate[format(selectedDate, "yyyy-MM-dd")] || [] 
    : []

  const handleDateClick = (dateStr: string) => {
    // Parse the date string as UTC to avoid timezone shifts
    const [year, month, day] = dateStr.split('-').map(Number)
    setSelectedDate(new Date(year, month - 1, day))
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendário de Treinos</h1>
            <p className="text-muted-foreground">Visualize seu histórico de treinos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WorkoutCalendar workoutsByDate={workoutsByDate} onDateClick={handleDateClick} />
          </div>

          <div className="space-y-4">
            <Card className="p-6 border-border">
              <h3 className="font-bold text-lg text-foreground mb-4">
                {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: ptBR }) : "Selecione um dia"}
              </h3>

              {selectedWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {selectedWorkouts.map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => setSelectedSessionId(workout.id)}
                      className="w-full text-left p-4 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Dumbbell className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{workout.package_name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{workout.duration_minutes} min</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : selectedDate ? (
                <p className="text-sm text-muted-foreground">Nenhum treino neste dia</p>
              ) : (
                <p className="text-sm text-muted-foreground">Clique em um dia para ver os treinos</p>
              )}
            </Card>
          </div>
        </div>
      </div>
      <WorkoutSessionModal
        sessionId={selectedSessionId}
        onOpenChange={(isOpen) => !isOpen && setSelectedSessionId(null)}
      />
    </div>
  )
}