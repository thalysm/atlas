"use client"

import type { WorkoutSession } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Dumbbell, Calendar, PlayCircle, Eye, Trash2, Share2, Flame } from "lucide-react"
import { format } from "date-fns" // Não precisa mais de parseISO aqui
import { ptBR } from "date-fns/locale"
import { ensureUtcAndParse } from "@/lib/utils" // <<< Importar a nova função

interface SessionCardProps {
  session: WorkoutSession
  onView: (sessionId: string) => void
  onContinue: (sessionId: string) => void
  onDelete: (sessionId: string) => void
  onShare: (sessionId: string) => void
}

export function SessionCard({ session, onView, onContinue, onDelete, onShare }: SessionCardProps) {
  // Usar a nova função utilitária
  const dateObject = ensureUtcAndParse(session.start_time);
  // Formatar apenas se o objeto Date for válido
  const formattedDate = dateObject
    ? format(dateObject, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : "Data inválida";

  return (
    <Card className="p-4 border-border transition-all hover:border-primary flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-foreground leading-tight">{session.package_name}</h3>
          {session.is_completed ? (
            <Badge variant="secondary">Concluído</Badge>
          ) : (
            <Badge className="bg-success text-white">Em Andamento</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span> {/* Usar a data formatada */}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{session.duration_minutes || 0} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="h-4 w-4" />
            <span>{session.exercise_count ?? 0} exercícios</span>
          </div>
          {session.total_calories !== undefined && session.total_calories !== null && (
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>~{Math.round(session.total_calories)} kcal</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {session.is_completed ? (
          <Button onClick={() => onView(session.id)} variant="outline" className="flex-1 border-border">
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
        ) : (
          <Button onClick={() => onContinue(session.id)} className="flex-1 bg-primary hover:bg-primary-hover">
            <PlayCircle className="h-4 w-4 mr-2" />
            Continuar Treino
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={() => onShare(session.id)} className="border-border">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => onDelete(session.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}