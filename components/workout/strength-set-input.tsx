"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface StrengthSetInputProps {
  setNumber: number
  weight: number
  reps: number
  completed: boolean
  onChange: (data: { weight: number; reps: number }) => void
  onToggleComplete: () => void
}

export function StrengthSetInput({
  setNumber,
  weight,
  reps,
  completed,
  onChange,
  onToggleComplete,
}: StrengthSetInputProps) {
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border ${completed ? "bg-success/10 border-success" : "bg-surface border-border"}`}
    >
      <span className="text-sm font-medium text-foreground w-16">Série {setNumber}</span>

      <div className="flex-1 flex gap-2">
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Peso (kg)"
            value={weight || ""}
            onChange={(e) => onChange({ weight: Number.parseFloat(e.target.value) || 0, reps })}
            className="bg-background border-border text-foreground"
            step="0.5"
          />
        </div>

        <div className="flex-1">
          <Input
            type="number"
            placeholder="Reps"
            value={reps || ""}
            onChange={(e) => onChange({ weight, reps: Number.parseInt(e.target.value) || 0 })}
            className="bg-background border-border text-foreground"
          />
        </div>
      </div>

      <Button
        size="sm"
        variant={completed ? "default" : "outline"}
        onClick={onToggleComplete}
        className={completed ? "bg-success hover:bg-success/90" : ""}
      >
        <Check className="h-4 w-4" />
      </Button>
    </div>
  )
}