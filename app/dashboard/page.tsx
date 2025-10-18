"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { WorkoutPackage, WorkoutSession, Reminder } from "@/lib/types" // Importar Reminder
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dumbbell, Calendar, TrendingUp, Users, History, Plus, Droplet, Weight, BellRing, Check } from "lucide-react" // Importar Check
import Link from "next/link"
import { UserProfileDropdown } from "@/components/dashboard/user-profile-dropdown"
import { useAuth } from "@/hooks/use-auth"
import { HealthDataModal } from "@/components/profile/health-data-modal"
import { WaterIntakeModal } from "@/components/dashboard/water-intake-modal"
import { WeightLogModal } from "@/components/dashboard/weight-log-modal"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox" // Importar Checkbox
import { Label } from "@/components/ui/label" // Importar Label

export default function DashboardPage() {
  const router = useRouter()
  const { user, mutate: mutateUser } = useAuth() // Pegar mutateUser
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false)
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false)
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false)

  const { data: packages } = useSWR<WorkoutPackage[]>("/packages", () => apiClient.get("/packages"))
  const { data: sessions, isLoading: isLoadingSessions } = useSWR<WorkoutSession[]>("/sessions/all", () => apiClient.get("/sessions/all"))

  const today = new Date().toISOString().split('T')[0]
  const { data: waterStats, mutate: mutateWaterStats } = useSWR<Record<string, number>>(`/analytics/water/stats?days=1`, () => apiClient.get(`/analytics/water/stats?days=1`))
  const { data: waterRecommendation } = useSWR<{ recommendation_ml: number }>(`/analytics/water/recommendation`, () => apiClient.get(`/analytics/water/recommendation`))

  const { data: todayRemindersData, mutate: mutateReminders } = useSWR<Reminder[]>("/reminders/today", () => apiClient.get("/reminders/today"))

  // Estado local para gerenciar a conclusão dos lembretes
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([])

  useEffect(() => {
    if (todayRemindersData) {
        setTodayReminders(todayRemindersData)
    }
  }, [todayRemindersData])

  const handleToggleReminder = async (id: string) => {
    // Atualização Otimista da UI local
    setTodayReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))

    try {
        await apiClient.post(`/reminders/${id}/toggle`);
        // Revalidar com o backend para garantir consistência (opcional, pode remover se confiar na UI)
        mutateReminders();
    } catch (error) {
        console.error("Failed to toggle reminder", error);
        // Reverter a UI em caso de erro (rebuscando os dados)
        mutateReminders();
    }
  };


  const dailyIntake = waterStats?.[today] || 0
  const dailyGoal = waterRecommendation?.recommendation_ml || 2000
  const waterProgress = dailyGoal > 0 ? (dailyIntake / dailyGoal) * 100 : 0

  const activeSessions = sessions?.filter(s => !s.is_completed)

  useEffect(() => {
    if (activeSessions && activeSessions.length > 0) {
      router.push(`/dashboard/workout/${activeSessions[0].id}`)
    }
  }, [activeSessions, router])

  useEffect(() => {
    if (user && (!user.height || !user.weight || !user.gender || !user.birth_date)) {
      setIsHealthModalOpen(true)
    }
  }, [user])

  const handleStartWorkout = async (packageId: string) => {
    try {
      const response = await apiClient.post<{ id: string }>("/sessions", { package_id: packageId })
      router.push(`/dashboard/workout/${response.id}`)
    } catch (error) {
      alert("Erro ao iniciar treino")
    }
  }

  const handleStartEmptyWorkout = async () => {
    try {
      const response = await apiClient.post<{ id: string }>("/sessions/start-empty")
      router.push(`/dashboard/workout/${response.id}`)
    } catch (error) {
      alert("Erro ao iniciar treino livre")
    }
  }

  if (isLoadingSessions || (activeSessions && activeSessions.length > 0)) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="text-muted-foreground">Carregando seu dashboard...</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <HealthDataModal open={isHealthModalOpen} onOpenChange={setIsHealthModalOpen} />
      <WaterIntakeModal open={isWaterModalOpen} onOpenChange={setIsWaterModalOpen} onWaterLogged={() => mutateWaterStats()} />
      <WeightLogModal open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen} onWeightLogged={() => mutateUser()} /> {/* Passar mutateUser */}

      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Bem-vindo de volta ao Atlas!</p>
            </div>
            <UserProfileDropdown />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 border-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Droplet className="h-6 w-6 text-primary"/>
                        <h2 className="text-xl font-bold">Consumo de Água</h2>
                    </div>
                    <Button size="sm" onClick={() => setIsWaterModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2"/>
                        Adicionar
                    </Button>
                </div>
                <div>
                    <div className="flex justify-between items-baseline mb-2">
                        <span className="text-2xl font-bold text-primary">{(dailyIntake / 1000).toFixed(2)}L</span>
                        <span className="text-sm text-muted-foreground">Meta: {(dailyGoal / 1000).toFixed(1)}L</span>
                    </div>
                    <Progress value={waterProgress} />
                </div>
            </Card>

            <Card className="p-6 border-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Weight className="h-6 w-6 text-primary"/>
                        <h2 className="text-xl font-bold">Peso Corporal</h2>
                    </div>
                    <Button size="sm" onClick={() => setIsWeightModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2"/>
                        Atualizar
                    </Button>
                </div>
                <div>
                    <p className="text-3xl font-bold text-primary">{user?.weight || "--"} kg</p>
                    <p className="text-sm text-muted-foreground mt-1">Seu peso mais recente</p>
                </div>
            </Card>
        </div>

        <Card className="p-6 border-border">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BellRing className="h-6 w-6 text-primary"/>
                    <h2 className="text-xl font-bold">Lembretes de Hoje</h2>
                </div>
                <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard/reminders">Ver todos</Link>
                </Button>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2"> {/* Limitar altura e adicionar scroll */}
                {todayReminders && todayReminders.length > 0 ? todayReminders.map(reminder => (
                    <div key={reminder.id} className="flex items-center gap-3">
                        <Checkbox
                            id={`reminder-dash-${reminder.id}`} // ID único para o dashboard
                            checked={reminder.completed}
                            onCheckedChange={() => handleToggleReminder(reminder.id)}
                        />
                        <Label htmlFor={`reminder-dash-${reminder.id}`} className={`flex-1 cursor-pointer ${reminder.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {reminder.title} às {reminder.time}
                        </Label>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum lembrete para hoje.</p>
                )}
            </div>
        </Card>


        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-6 border-border hover:border-primary transition-colors cursor-pointer">
            <Link href="/dashboard/packages" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pacotes</p>
                  <p className="text-2xl font-bold text-foreground">{packages?.length || 0}</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 border-border hover:border-primary transition-colors cursor-pointer">
            <Link href="/dashboard/sessions" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <History className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Histórico</p>
                  <p className="text-2xl font-bold text-foreground">Ver</p>
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
          <Card className="p-6 border-border hover:border-primary transition-colors cursor-pointer">
            <Link href="/dashboard/reminders" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BellRing className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lembretes</p>
                  <p className="text-2xl font-bold text-foreground">Ver</p>
                </div>
              </div>
            </Link>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Iniciar Treino</h2>
           <div className="mb-4">
             <Button onClick={handleStartEmptyWorkout} variant="outline" className="w-full border-border">
                <Plus className="h-4 w-4 mr-2"/>
                Iniciar Treino Livre
             </Button>
           </div>
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