"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface CardioSetInputProps {
  durationMinutes: number
  distance?: number
  incline?: number
  speed?: number
  completed: boolean
  onChange: (data: { duration_minutes: number; distance?: number; incline?: number; speed?: number }) => void
  onToggleComplete: () => void
}

export function CardioSetInput({
  durationMinutes,
  distance,
  incline,
  speed,
  completed,
  onChange,
  onToggleComplete,
}: CardioSetInputProps) {
  return (
    <div
      className={`p-4 rounded-lg border space-y-3 ${completed ? "bg-success/10 border-success" : "bg-surface border-border"}`}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Duração (min)</label>
          <Input
            type="number"
            value={durationMinutes || ""}
            onChange={(e) =>
              onChange({
                duration_minutes: Number.parseFloat(e.target.value) || 0,
                distance,
                incline,
                speed,
              })
            }
            className="bg-background border-border text-foreground"
            step="0.5"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Distância (km)</label>
          <Input
            type="number"
            value={distance || ""}
            onChange={(e) =>
              onChange({
                duration_minutes: durationMinutes,
                distance: Number.parseFloat(e.target.value) || undefined,
                incline,
                speed,
              })
            }
            className="bg-background border-border text-foreground"
            step="0.1"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Inclinação (%)</label>
          <Input
            type="number"
            value={incline || ""}
            onChange={(e) =>
              onChange({
                duration_minutes: durationMinutes,
                distance,
                incline: Number.parseFloat(e.target.value) || undefined,
                speed,
              })
            }
            className="bg-background border-border text-foreground"
            step="0.5"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Velocidade (km/h)</label>
          <Input
            type="number"
            value={speed || ""}
            onChange={(e) =>
              onChange({
                duration_minutes: durationMinutes,
                distance,
                incline,
                speed: Number.parseFloat(e.target.value) || undefined,
              })
            }
            className="bg-background border-border text-foreground"
            step="0.1"
          />
        </div>
      </div>

      <Button
        size="sm"
        variant={completed ? "default" : "outline"}
        onClick={onToggleComplete}
        className={`w-full ${completed ? "bg-success hover:bg-success/90" : ""}`}
      >
        <Check className="h-4 w-4 mr-2" />
        {completed ? "Concluído" : "Marcar como Concluído"}
      </Button>
    </div>
  )
}