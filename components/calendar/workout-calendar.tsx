"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"

interface WorkoutCalendarProps {
  workoutsByDate: Record<string, any[]>
  onDateClick?: (date: string) => void
}

export function WorkoutCalendar({ workoutsByDate, onDateClick }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array(firstDayOfWeek).fill(null)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <Card className="p-6 border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={previousMonth} className="border-border bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={nextMonth} className="border-border bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {daysInMonth.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const workouts = workoutsByDate[dateStr] || []
            const hasWorkouts = workouts.length > 0

            return (
              <button
                key={dateStr}
                onClick={() => onDateClick?.(dateStr)}
                className={`aspect-square p-2 rounded-lg border transition-all ${
                  isToday(day)
                    ? "border-primary bg-primary/10"
                    : hasWorkouts
                      ? "border-success bg-success/10 hover:bg-success/20"
                      : "border-border hover:border-primary/50"
                } ${!isSameMonth(day, currentDate) ? "opacity-50" : ""}`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-sm font-medium ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                    {format(day, "d")}
                  </span>
                  {hasWorkouts && (
                    <div className="flex gap-1 mt-1">
                      {workouts.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-success" />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
