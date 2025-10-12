"use client"

import type { WorkoutPackage } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Lock, Globe, Trash2 } from "lucide-react"

interface PackageCardProps {
  package: WorkoutPackage
  onCopy?: (packageId: string) => void
  onEdit: (pkg: WorkoutPackage) => void
  onDelete: (packageId: string) => void
  showActions?: boolean
}

export function PackageCard({ pkg, onCopy, onEdit, onDelete, showActions = true }: PackageCardProps) {
  return (
    <Card className="p-6 border-border hover:border-primary transition-colors">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg text-foreground">{pkg.name}</h3>
            </div>
            {pkg.description && <p className="text-sm text-muted-foreground">{pkg.description}</p>}
          </div>

          {pkg.is_public ? (
            <Globe className="h-5 w-5 text-success" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{pkg.exercises.length} exercícios</Badge>
          {pkg.is_public && <Badge className="bg-success text-white">Público</Badge>}
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button onClick={() => onEdit(pkg)} className="flex-1 bg-primary hover:bg-primary-hover">
              Ver Detalhes
            </Button>
            {onCopy && (
              <Button variant="outline" onClick={() => onCopy(pkg.id)} className="border-border">
                Copiar
              </Button>
            )}
            <Button variant="destructive" size="icon" onClick={() => onDelete(pkg.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}