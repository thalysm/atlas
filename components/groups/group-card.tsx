"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Crown } from "lucide-react"
import Link from "next/link"

interface GroupCardProps {
  group: {
    id: string
    name: string
    description?: string
    owner_id: string
    member_count: number
    invite_code: string
  }
  currentUserId?: string
}

export function GroupCard({ group, currentUserId }: GroupCardProps) {
  const isOwner = currentUserId === group.owner_id

  return (
    <Card className="p-6 border-border hover:border-primary transition-colors">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg text-foreground">{group.name}</h3>
              {isOwner && <Crown className="h-4 w-4 text-warning" />}
            </div>
            {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{group.member_count} membros</Badge>
          {isOwner && <Badge className="bg-warning text-white">Dono</Badge>}
        </div>

        <div className="flex gap-2">
          <Button asChild className="flex-1 bg-primary hover:bg-primary-hover">
            <Link href={`/dashboard/groups/${group.id}`}>Ver Grupo</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
