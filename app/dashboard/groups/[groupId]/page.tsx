"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertModal } from "@/components/ui/alert-modal"
import { Trophy, Copy, LogOut, Trash2, Crown, ArrowLeft, Clock, Dumbbell } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { GroupCalendar } from "@/components/groups/group-calendar"
import { WorkoutSessionModal } from "@/components/calendar/workout-session-modal"

// Helper to generate distinct colors
const generateColor = (index: number) => {
  const colors = [
    "#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6",
    "#1abc9c", "#e67e22", "#34495e", "#16a085", "#c0392b"
  ];
  return colors[index % colors.length];
};


export default function GroupDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const groupId = params.groupId as string

  const [timeRange, setTimeRange] = useState("all")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const groupDetailsUrl = groupId ? `/groups/${groupId}${timeRange !== 'all' ? `?days=${timeRange}` : ''}` : null
  const { data: group, mutate } = useSWR(groupDetailsUrl, (url) => apiClient.get(url))

  const { data: calendarData } = useSWR(
    groupId ? `/groups/${groupId}/calendar?year=${currentMonth.getFullYear()}&month=${currentMonth.getMonth() + 1}` : null,
    (url) => apiClient.get(url)
  )

  const [copied, setCopied] = useState(false)
  const [alertModal, setAlertModal] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm?: () => void
    variant?: "default" | "destructive"
  }>({
    open: false,
    title: "",
    description: "",
  })
  
  const memberColors = useMemo(() => {
    if (!group?.members) return {}
    // Ensure consistent color mapping regardless of ranking changes
    const sortedMembers = [...group.members].sort((a,b) => a.username.localeCompare(b.username));
    return sortedMembers.reduce((acc, member, index) => {
      acc[member.user_id] = generateColor(index)
      return acc
    }, {} as Record<string, string>)
  }, [group?.members])

  const selectedWorkouts = selectedDate && calendarData
    ? calendarData[format(selectedDate, "yyyy-MM-dd")] || []
    : []


  const handleCopyInviteCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLeaveGroup = async () => {
    setAlertModal({
      open: true,
      title: "Sair do Grupo",
      description: "Tem certeza que deseja sair do grupo?",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await apiClient.post(`/groups/${groupId}/leave`)
          router.push("/dashboard/groups")
        } catch (error) {
          setAlertModal({
            open: true,
            title: "Erro",
            description: "Erro ao sair do grupo",
          })
        }
      },
    })
  }

  const handleDeleteGroup = async () => {
    setAlertModal({
      open: true,
      title: "Deletar Grupo",
      description: "Tem certeza que deseja deletar o grupo? Esta ação não pode ser desfeita.",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/groups/${groupId}`)
          router.push("/dashboard/groups")
        } catch (error) {
          setAlertModal({
            open: true,
            title: "Erro",
            description: "Erro ao deletar grupo",
          })
        }
      },
    })
  }

  const handleDateClick = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    setSelectedDate(new Date(year, month - 1, day));
  };


  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando grupo...</p>
      </div>
    )
  }

  const isOwner = user?.id === group.owner_id

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/groups")}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
            {group.description && <p className="text-muted-foreground mt-2">{group.description}</p>}
          </div>

          <div className="flex gap-2">
            {isOwner ? (
              <Button variant="destructive" onClick={handleDeleteGroup}>
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            ) : (
              <Button variant="outline" onClick={handleLeaveGroup} className="border-border bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-border">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold text-foreground">Ranking</h2>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-full sm:w-48 bg-surface border-border">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">Desde o início</SelectItem>
                        <SelectItem value="7">Últimos 7 dias</SelectItem>
                        <SelectItem value="30">Últimos 30 dias</SelectItem>
                        <SelectItem value="90">Últimos 90 dias</SelectItem>
                        <SelectItem value="365">Último ano</SelectItem>
                        </SelectContent>
                    </Select>
                </div>


                <div className="space-y-3">
                    {group.members.map((member: any, index: number) => (
                    <div
                        key={member.user_id}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                        index === 0 ? "border-primary bg-primary/5" : "border-border bg-surface"
                        }`}
                    >
                        <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white`}
                        style={{ backgroundColor: memberColors[member.user_id] }}
                        >
                        {index + 1}
                        </div>

                        <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{member.username}</p>
                            {member.user_id === group.owner_id && <Crown className="h-4 w-4 text-warning" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.workout_count} treinos completados</p>
                        </div>

                        {index === 0 && <Trophy className="h-6 w-6 text-primary" />}
                    </div>
                    ))}
                </div>
            </Card>
          </div>
          <div className="space-y-6">
             <Card className="p-6 border-border">
                <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Código de Convite</h3>
                    <div className="flex gap-2">
                    <code className="flex-1 p-3 bg-surface rounded-lg border border-border text-primary font-mono">
                        {group.invite_code}
                    </code>
                    <Button onClick={handleCopyInviteCode} variant="outline" className="border-border bg-transparent">
                        <Copy className="h-4 w-4 mr-2" />
                        {copied ? "Copiado!" : "Copiar"}
                    </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Compartilhe este código para convidar pessoas</p>
                </div>
            </Card>
             <Card className="p-4 border-border">
                <h3 className="font-semibold text-foreground mb-4 px-2">Legenda do Calendário</h3>
                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div key={member.user_id} className="flex items-center gap-2 px-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: memberColors[member.user_id] }} />
                      <span className="text-sm text-muted-foreground">{member.username}</span>
                    </div>
                  ))}
                </div>
              </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                 <GroupCalendar
                    workoutsByDate={calendarData || {}}
                    members={group.members}
                    memberColors={memberColors}
                    onDateClick={handleDateClick}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                />
            </div>
             <Card className="p-6 border-border h-fit">
              <h3 className="font-bold text-lg text-foreground mb-4">
                {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: ptBR }) : "Selecione um dia"}
              </h3>

              {selectedWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {selectedWorkouts.map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => setSelectedSessionId(workout.id)}
                      className="w-full text-left p-4 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${memberColors[workout.user_id]}1A`}}>
                          <Dumbbell className="h-4 w-4" style={{ color: memberColors[workout.user_id]}} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold" style={{ color: memberColors[workout.user_id]}}>{workout.username}</p>
                          <h4 className="font-semibold text-foreground">{workout.package_name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{workout.duration_minutes} min</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : selectedDate ? (
                <p className="text-sm text-muted-foreground">Nenhum treino neste dia.</p>
              ) : (
                <p className="text-sm text-muted-foreground">Clique em um dia no calendário para ver os treinos.</p>
              )}
            </Card>
        </div>


      </div>

      <AlertModal
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal({ ...alertModal, open })}
        title={alertModal.title}
        description={alertModal.description}
        onConfirm={alertModal.onConfirm}
        variant={alertModal.variant}
        cancelText={alertModal.onConfirm ? "Cancelar" : undefined}
        confirmText={alertModal.onConfirm ? "Confirmar" : "OK"}
      />

      <WorkoutSessionModal
        sessionId={selectedSessionId}
        onOpenChange={(isOpen) => !isOpen && setSelectedSessionId(null)}
       />
    </div>
  )
}