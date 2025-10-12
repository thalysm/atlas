"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"

interface GroupCalendarProps {
  workoutsByDate: Record<string, any[]>
  members: { user_id: string; username: string }[]
  memberColors: Record<string, string>
  onDateClick?: (date: string) => void
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

export function GroupCalendar({ workoutsByDate, onDateClick, memberColors, currentMonth, onMonthChange }: GroupCalendarProps) {

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array(firstDayOfWeek).fill(null)

  const previousMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <Card className="p-6 border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</h2>
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
            const usersWhoTrained = [...new Set(workouts.map(w => w.user_id))]

            return (
              <button
                key={dateStr}
                onClick={() => onDateClick?.(dateStr)}
                className={`aspect-square p-2 rounded-lg border transition-all flex flex-col items-center justify-center
                  ${isToday(day) ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}
                  ${!isSameMonth(day, currentMonth) ? "opacity-50" : ""}`}
              >
                <span className={`text-sm font-medium ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                  {format(day, "d")}
                </span>
                {usersWhoTrained.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {usersWhoTrained.slice(0, 4).map((userId) => (
                      <div
                        key={userId}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: memberColors[userId] }}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}