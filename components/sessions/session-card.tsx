"use client"

import type { WorkoutSession } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Dumbbell, Calendar, PlayCircle, Eye, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface SessionCardProps {
  session: WorkoutSession
  onView: (sessionId: string) => void
  onContinue: (sessionId: string) => void
  onDelete: (sessionId: string) => void
}

export function SessionCard({ session, onView, onContinue, onDelete }: SessionCardProps) {
  const formattedDate = format(new Date(session.start_time), "PPP", { locale: ptBR })
  const formattedTime = format(new Date(session.start_time), "p", { locale: ptBR })

  return (
    <Card className="p-4 border-border transition-all hover:border-primary">
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-foreground leading-tight">{session.package_name}</h3>
            {session.is_completed ? (
              <Badge variant="secondary">Concluído</Badge>
            ) : (
              <Badge className="bg-success text-white">Em Andamento</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate} às {formattedTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{session.duration_minutes || 0} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4" />
              <span>{session.exercise_count} exercícios</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {session.is_completed ? (
            <Button onClick={() => onView(session.id)} variant="outline" className="w-full border-border">
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          ) : (
            <Button onClick={() => onContinue(session.id)} className="w-full bg-primary hover:bg-primary-hover">
              <PlayCircle className="h-4 w-4 mr-2" />
              Continuar Treino
            </Button>
          )}
          <Button variant="destructive" size="icon" onClick={() => onDelete(session.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}