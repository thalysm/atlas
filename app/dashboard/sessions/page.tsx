"use client";

import { useState, useEffect, useMemo, useRef } from "react"; // <<< Adicionado useRef, useEffect
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
// <<< Importações atualizadas >>>
import type {
  WorkoutSession,
  WorkoutSession as FullWorkoutSession, // Renomeado para clareza
  ExerciseLog,
  StrengthSet,
  CardioSet
} from "@/lib/types";
// import { toast } from "sonner"; // <<< REMOVIDO toast para usar Tooltip
import { ensureUtcAndParse } from "@/lib/utils";
// ---
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SessionCard } from "@/components/sessions/session-card";
import { AlertModal } from "@/components/ui/alert-modal";
import { ShareSessionModal } from "@/components/sessions/share-session-modal";
import { Toaster } from "@/components/ui/sonner"; // <<< Manter se usar toast para erros

// Helpers de Type Guard
const isStrengthSet = (set: any): set is StrengthSet => 'weight' in set && 'reps' in set;
const isCardioSet = (set: any): set is CardioSet => 'duration_minutes' in set;

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
  const [isCopyingId, setIsCopyingId] = useState<string | null>(null); // Estado de loading da cópia
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null); // <<< Novo estado para Tooltip
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null); // <<< Ref para o timeout do Tooltip

  // Limpa o timeout ao desmontar o componente
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const groupedSessions = useMemo(() => {
    // ... (lógica inalterada)
    if (!sessions) return {};
    return sessions.reduce((acc, session) => {
      const date = ensureUtcAndParse(session.start_time);
      if (!date) return acc;
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const key = format(weekStart, "yyyy-MM-dd");
      if (!acc[key]) acc[key] = [];
      acc[key].push(session);
      return acc;
    }, {} as Record<string, WorkoutSession[]>);
  }, [sessions]);

  const sortedGroupKeys = Object.keys(groupedSessions).sort((a, b) =>
    b.localeCompare(a)
  );

  // Funções handle* (inalteradas, exceto handleCopyToClipboard)
  const handleViewDetails = (sessionId: string) => { router.push(`/dashboard/sessions/${sessionId}`); };
  const handleContinueWorkout = (sessionId: string) => { router.push(`/dashboard/workout/${sessionId}`); };
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
          setAlertModal({ open: true, title: "Erro", description: "Não foi possível deletar a sessão." });
        }
      },
    });
  };
  const handleShare = (sessionId: string) => { setSharingSessionId(sessionId); };


  // <<< FUNÇÃO PARA COPIAR ATUALIZADA (com Tooltip) >>>
  const handleCopyToClipboard = async (sessionId: string) => {
    setIsCopyingId(sessionId);
    setCopiedSessionId(null); // Limpa o estado anterior
    if (copyTimeoutRef.current) { // Limpa timeout anterior se houver
        clearTimeout(copyTimeoutRef.current);
    }

    try {
      const session = await apiClient.get<FullWorkoutSession>(`/sessions/${sessionId}`);
      const textLines: string[] = [];

      // Formatar Cabeçalho e Datas
      textLines.push(`📋 Resumo do Treino: ${session.package_name}`);
      textLines.push("---");
      const startDate = ensureUtcAndParse(session.start_time);
      const endDate = session.end_time ? ensureUtcAndParse(session.end_time) : null;
      if (startDate) textLines.push(`▶️ Início: ${format(startDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
      if (endDate) textLines.push(`⏹️ Fim: ${format(endDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
      textLines.push(`⏱️ Duração: ${session.duration_minutes || 0} minutos`);
      textLines.push(`🔥 Calorias: ~${Math.round(session.total_calories ?? 0)} kcal`);
      textLines.push("---");

      // Formatar Exercícios e Séries
      session.exercises.forEach((ex: ExerciseLog) => {
        textLines.push(`\n🏋️ ${ex.exercise_name}`);
        ex.sets.forEach((set: StrengthSet | CardioSet, setIndex: number) => {
          if (isStrengthSet(set)) { textLines.push(`  • Série ${setIndex + 1}: ${set.weight}kg x ${set.reps} reps ${set.completed ? '✅' : '❌'}`); }
          else if (isCardioSet(set)) {
            let cardioDetails = `  • Série ${setIndex + 1}: ${set.duration_minutes} min`;
            if (set.distance) cardioDetails += ` / ${set.distance}km`;
            if (set.speed) cardioDetails += ` @ ${set.speed}km/h`;
            if (set.incline) cardioDetails += ` ${set.incline}% incl.`;
            cardioDetails += ` ${set.completed ? '✅' : '❌'}`;
            textLines.push(cardioDetails);
          }
        });
      });

      // Formatar Rodapé
      textLines.push("\n\n---");
      textLines.push("Feito no Atlas");
      textLines.push("https://atlas.btreedevs.com.br/");

      const formattedText = textLines.join('\n');

      await navigator.clipboard.writeText(formattedText);

      // <<< Define o ID copiado e agenda a limpeza para o Tooltip >>>
      setCopiedSessionId(sessionId);
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedSessionId(null);
        copyTimeoutRef.current = null;
      }, 2000); // Tooltip some após 2 segundos

    } catch (error) {
      console.error("Failed to copy session details:", error);
      // Mantém o alerta para erros
       setAlertModal({ open: true, title:"Erro", description: "Não foi possível copiar os detalhes."});
    } finally {
      setIsCopyingId(null);
    }
  };
  // <<< FIM DA FUNÇÃO DE COPIAR ATUALIZADA >>>

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Adicione o Toaster se precisar para outros feedbacks */}
      <Toaster richColors position="top-center" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ... (Cabeçalho da página) ... */}
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
            <p className="text-muted-foreground text-center py-12">Carregando...</p>
          ) : sortedGroupKeys.length > 0 ? (
            sortedGroupKeys.map((groupKey) => {
              const weekStartDate = parseISO(groupKey);
              const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
              const weekLabel = `Semana de ${format(weekStartDate,"dd/MM", { locale: ptBR })} a ${format(weekEndDate, "dd/MM/yyyy", { locale: ptBR })}`;
              const sessionsInGroup = groupedSessions[groupKey];
              return (
                <div key={groupKey}>
                  <h2 className="text-xl font-semibold text-foreground mb-4">{weekLabel}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sessionsInGroup.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onView={handleViewDetails}
                        onContinue={handleContinueWorkout}
                        onDelete={handleDeleteSession}
                        onShare={handleShare}
                        onCopy={handleCopyToClipboard} // Passa a função de cópia
                        isCopying={isCopyingId === session.id} // Passa o estado de loading
                        showCopySuccess={copiedSessionId === session.id} // <<< Passa o estado de sucesso para o Tooltip
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
             // ... (Mensagem de "Nenhum treino encontrado") ...
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

       {/* ... (Modais Alert e Share) ... */}
       <AlertModal
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal({ ...alertModal, open })}
        title={alertModal.title}
        description={alertModal.description}
        onConfirm={alertModal.onConfirm}
        variant={alertModal.variant}
        cancelText={alertModal.onConfirm ? "Cancelar" : "OK"}
        confirmText={alertModal.onConfirm ? "Confirmar" : ""}
      />
      <ShareSessionModal
        sessionId={sharingSessionId}
        open={!!sharingSessionId}
        onOpenChange={(isOpen) => !isOpen && setSharingSessionId(null)}
      />
    </div>
  );
}