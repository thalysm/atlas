"use client"

import type { Exercise } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ExerciseCardProps {
  exercise: Exercise
  onSelect?: (exercise: Exercise) => void
  selected?: boolean
}

export function ExerciseCard({ exercise, onSelect, selected }: ExerciseCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:border-primary ${
        selected ? "border-primary bg-primary/5" : "border-border"
      }`}
      onClick={() => onSelect?.(exercise)}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{exercise.name}</h3>
          <Badge variant={exercise.type === "strength" ? "default" : "secondary"} className="shrink-0">
            {exercise.type === "strength" ? "Força" : "Cardio"}
          </Badge>
        </div>

        {exercise.description && <p className="text-sm text-muted-foreground">{exercise.description}</p>}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {exercise.category}
          </Badge>
          {exercise.equipment && (
            <Badge variant="outline" className="text-xs">
              {exercise.equipment}
            </Badge>
          )}
        </div>

        {exercise.muscle_groups.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {exercise.muscle_groups.map((muscle) => (
              <span key={muscle} className="text-xs text-muted-foreground">
                {muscle}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
