"use client";

import { forwardRef } from "react";
import Image from "next/image";
import {
  Clock,
  Dumbbell,
  Flame, // Ícone para calorias
  Target,
  Bike, // Ícone para Cardio
  Zap, // Ícone genérico para energia/calorias
} from "lucide-react";
import type { WorkoutSession, ExerciseLog, StrengthSet, CardioSet } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ShareSessionCardProps {
  session: WorkoutSession;
  size: "square" | "story";
  transparentBg?: boolean; // Nova prop para fundo transparente
}

// Helper para verificar se é CardioSet
const isCardioSet = (set: any): set is CardioSet => 'duration_minutes' in set;

export const ShareSessionCard = forwardRef<HTMLDivElement, ShareSessionCardProps>(
  ({ session, size, transparentBg = false }, ref) => {
    // Calculado no backend agora
    const totalCalories = session.total_calories ? Math.round(session.total_calories) : 0;

    // Listar todos os exercícios de força
    const strengthExercises = session.exercises
      .filter(e => e.type === 'strength')
      .map((e) => e.exercise_name)
      .join(" • ");

    // Detalhar exercícios de cardio
    const cardioExercises = session.exercises.filter(e => e.type === 'cardio');

    const formattedDate = format(
      new Date(session.start_time),
      "dd 'de' MMMM 'de' yyyy",
      { locale: ptBR }
    );

    const cardSize =
      size === "square" ? "w-[1080px] h-[1080px]" : "w-[1080px] h-[1920px]";
    const bgColor = transparentBg ? "bg-transparent" : "bg-background"; // Define fundo
    const gridColsClass = 'grid-cols-3'; // Sempre 3 colunas agora

    return (
      <div
        ref={ref}
        // Aplicar fundo transparente ou padrão
        className={`${bgColor} text-foreground p-16 flex flex-col justify-between ${cardSize}`}
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-8xl font-bold text-primary">Atlas</h1>
            <p className="text-5xl text-muted-foreground">{formattedDate}</p>
          </div>

          {/* Grid de Stats - Ajustada para 1 linha */}
          <div className={`grid ${gridColsClass} gap-12 text-center mb-16`}> {/* Ajustado mb */}
            <div className="flex flex-col items-center">
              <Clock className="w-16 h-16 text-primary mb-4" />
              <p className="text-4xl">Duração</p>
              <p className="text-6xl font-bold">
                {session.duration_minutes || 0}
                <span className="text-4xl">min</span>
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Dumbbell className="w-16 h-16 text-primary mb-4" />
              <p className="text-4xl">Exercícios</p>
              <p className="text-6xl font-bold">{session.exercises.length}</p>
            </div>
             {/* Card de Calorias */}
            <div className="flex flex-col items-center">
              <Zap className="w-16 h-16 text-primary mb-4" />
              <p className="text-4xl">Calorias</p>
              <p className="text-6xl font-bold">
                ~{totalCalories}
                <span className="text-4xl">kcal</span>
              </p>
            </div>
            {/* Placeholders removidos */}
          </div>

          {/* Lista de Exercícios de Força */}
          {strengthExercises && (
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <Target className="w-12 h-12 text-primary" />
                <h2 className="text-5xl font-bold">Exercícios do Treino</h2>
              </div>
              <p className="text-4xl text-muted-foreground">{strengthExercises}</p>
            </div>
          )}

          {/* Detalhes do Cardio */}
          {cardioExercises.length > 0 && (
             <div className="mb-12">
               <div className="flex items-center gap-4 mb-4">
                 <Bike className="w-12 h-12 text-primary" />
                 <h2 className="text-5xl font-bold">Cardio Realizado</h2>
               </div>
               <div className="space-y-4">
                 {cardioExercises.map((exercise, index) => (
                   <div key={index}>
                     <p className="text-4xl font-semibold text-foreground mb-1">{exercise.exercise_name}</p>
                     <div className="flex flex-wrap gap-x-6 gap-y-1 text-3xl text-muted-foreground">
                       {exercise.sets.filter(isCardioSet).map((set, setIndex) => (
                         <span key={setIndex}>
                           {set.duration_minutes}min
                           {set.distance && ` / ${set.distance}km`}
                           {set.speed && ` @ ${set.speed}km/h`}
                           {set.incline && ` incl.${set.incline}%`}
                         </span>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-auto"> {/* Garantir que o footer fique embaixo */}
          <div className="flex items-center gap-4">
            <p className="text-4xl font-bold">Feito no Atlas</p>
            <Image src="/logo.svg" alt="Atlas Logo" width={40} height={40} />
          </div>
          <p className="text-3xl text-muted-foreground">
            atlas.btreedevs.com.br
          </p>
        </div>
      </div>
    );
  }
);

ShareSessionCard.displayName = "ShareSessionCard";