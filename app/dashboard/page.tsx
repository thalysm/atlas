"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { WorkoutPackage } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dumbbell, Calendar, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const { data: packages } = useSWR<WorkoutPackage[]>("/packages", () => apiClient.get("/packages"))

  const handleStartWorkout = async (packageId: string) => {
    try {
      const response = await apiClient.post<{ id: string }>("/sessions", { package_id: packageId })
      router.push(`/dashboard/workout/${response.id}`)
    } catch (error) {
      alert("Erro ao iniciar treino")
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Bem-vindo ao Atlas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-border hover:border-primary transition-colors cursor-pointer">
            <Link href="/dashboard/packages" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meus Pacotes</p>
                  <p className="text-2xl font-bold text-foreground">{packages?.length || 0}</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 border-border hover:border-primary transition-colors cursor-pointer">
            <Link href="/dashboard/calendar" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calendário</p>
                  <p className="text-2xl font-bold text-foreground">Ver</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 border-border hover:border-primary transition-colors cursor-pointer">
            <Link href="/dashboard/analytics" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Análises</p>
                  <p className="text-2xl font-bold text-foreground">Ver</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 border-border hover:border-primary transition-colors cursor-pointer">
            <Link href="/dashboard/groups" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grupos</p>
                  <p className="text-2xl font-bold text-foreground">Ver</p>
                </div>
              </div>
            </Link>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Iniciar Treino</h2>
          {packages && packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="p-6 border-border">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{pkg.name}</h3>
                      {pkg.description && <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>}
                      <p className="text-sm text-muted-foreground mt-2">{pkg.exercises.length} exercícios</p>
                    </div>
                    <Button
                      onClick={() => handleStartWorkout(pkg.id)}
                      className="w-full bg-primary hover:bg-primary-hover"
                    >
                      Iniciar Treino
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 border-border text-center">
              <p className="text-muted-foreground mb-4">Você ainda não tem pacotes de treino</p>
              <Button asChild className="bg-primary hover:bg-primary-hover">
                <Link href="/dashboard/packages/new">Criar Primeiro Pacote</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
