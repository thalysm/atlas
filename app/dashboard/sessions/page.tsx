"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import type { WorkoutSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns"; // parseISO ainda é usado para a chave do grupo
import { ptBR } from "date-fns/locale";
import { SessionCard } from "@/components/sessions/session-card";
import { AlertModal } from "@/components/ui/alert-modal";
import { ShareSessionModal } from "@/components/sessions/share-session-modal";
import { ensureUtcAndParse } from "@/lib/utils"; // <<< Importar a nova função

export default function SessionsPage() {
  const router = useRouter();
  const { data: sessions, mutate } = useSWR<WorkoutSession[]>(
    "/sessions/all",
    () => apiClient.get("/sessions/all")
  );

  const [alertModal, setAlertModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm?: () => void;
    variant?: "default" | "destructive";
  }>({ open: false, title: "", description: "" });

  const [sharingSessionId, setSharingSessionId] = useState<string | null>(null);

  const groupedSessions = useMemo(() => {
    if (!sessions) return {};
    return sessions.reduce((acc, session) => {
      // Usar a nova função para obter o objeto Date
      const date = ensureUtcAndParse(session.start_time);
      if (!date) return acc; // Pular se a data for inválida

      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const key = format(weekStart, "yyyy-MM-dd");

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(session);
      return acc;
    }, {} as Record<string, WorkoutSession[]>);
  }, [sessions]);

  const sortedGroupKeys = Object.keys(groupedSessions).sort((a, b) =>
    b.localeCompare(a)
  );

  const handleViewDetails = (sessionId: string) => {
    router.push(`/dashboard/sessions/${sessionId}`);
  };

  const handleContinueWorkout = (sessionId: string) => {
    router.push(`/dashboard/workout/${sessionId}`);
  };

  const handleDeleteSession = (sessionId: string) => {
    const session = sessions?.find((s) => s.id === sessionId);
    setAlertModal({
      open: true,
      title: "Confirmar Exclusão",
      description: `Tem certeza que deseja deletar o treino "${session?.package_name}"? Esta ação não pode ser desfeita.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/sessions/${sessionId}`);
          mutate();
          setAlertModal({ open: false, title: "", description: "" });
        } catch (error) {
          setAlertModal({
            open: true,
            title: "Erro",
            description: "Não foi possível deletar a sessão.",
          });
        }
      },
    });
  };

  const handleShare = (sessionId: string) => {
    setSharingSessionId(sessionId);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Histórico de Treinos
            </h1>
            <p className="text-muted-foreground">
              Veja e gerencie todas as suas sessões
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {sessions === undefined ? (
            <p className="text-muted-foreground text-center py-12">
              Carregando seu histórico...
            </p>
          ) : sortedGroupKeys.length > 0 ? (
            sortedGroupKeys.map((groupKey) => {
              // Parse a chave (que é yyyy-MM-dd) para Date antes de formatar
              // parseISO funciona bem aqui pois a chave está em formato canônico
              const weekStartDate = parseISO(groupKey);
              const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
              const weekLabel = `Semana de ${format(
                weekStartDate,
                "dd/MM", { locale: ptBR }
              )} a ${format(weekEndDate, "dd/MM/yyyy", { locale: ptBR })}`;

              const sessionsInGroup = groupedSessions[groupKey];
              return (
                <div key={groupKey}>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    {weekLabel}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sessionsInGroup.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onView={handleViewDetails}
                        onContinue={handleContinueWorkout}
                        onDelete={handleDeleteSession}
                        onShare={handleShare}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <h3 className="text-lg font-semibold text-foreground">
                Nenhum treino encontrado
              </h3>
              <p className="text-muted-foreground mt-2">
                Parece que você ainda não registrou nenhum treino.
              </p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="mt-6 bg-primary hover:bg-primary-hover"
              >
                Começar a Treinar
              </Button>
            </div>
          )}
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

      <ShareSessionModal
        sessionId={sharingSessionId}
        open={!!sharingSessionId}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSharingSessionId(null);
          }
        }}
      />
    </div>
  );
}