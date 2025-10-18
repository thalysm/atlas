"use client";

import { forwardRef } from "react";
import Image from "next/image";
import {
  Clock,
  Dumbbell,
  Flame,
  Target,
  Bike,
  Zap,
} from "lucide-react";
import type { WorkoutSession, ExerciseLog, StrengthSet, CardioSet } from "@/lib/types";
import { format } from "date-fns"; // Não precisa mais de parseISO aqui
import { ptBR } from "date-fns/locale";
import { ensureUtcAndParse } from "@/lib/utils"; // <<< Importar a nova função

interface ShareSessionCardProps {
  session: WorkoutSession;
  size: "square" | "story";
  transparentBg?: boolean;
}

// Helper para verificar se é CardioSet
const isCardioSet = (set: any): set is CardioSet => 'duration_minutes' in set;

export const ShareSessionCard = forwardRef<HTMLDivElement, ShareSessionCardProps>(
  ({ session, size, transparentBg = false }, ref) => {
    const totalCalories = session.total_calories ? Math.round(session.total_calories) : 0;

    const strengthExercises = session.exercises
      .filter(e => e.type === 'strength')
      .map((e) => e.exercise_name)
      .join(" • ");

    const cardioExercises = session.exercises.filter(e => e.type === 'cardio');

    // Usar a nova função utilitária
    const dateObject = ensureUtcAndParse(session.start_time);
    const formattedDate = dateObject
      ? format(dateObject, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      : "Data inválida";


    const cardSize =
      size === "square" ? "w-[1080px] h-[1080px]" : "w-[1080px] h-[1920px]";
    const bgColor = transparentBg ? "bg-transparent" : "bg-background";
    const gridColsClass = 'grid-cols-3';

    return (
      <div
        ref={ref}
        className={`${bgColor} text-foreground p-16 flex flex-col justify-between ${cardSize}`}
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-8xl font-bold text-primary">Atlas</h1>
            <p className="text-5xl text-muted-foreground">{formattedDate}</p>
          </div>

          {/* Grid de Stats */}
          <div className={`grid ${gridColsClass} gap-12 text-center mb-16`}>
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
            <div className="flex flex-col items-center">
              <Zap className="w-16 h-16 text-primary mb-4" />
              <p className="text-4xl">Calorias</p>
              <p className="text-6xl font-bold">
                ~{totalCalories}
                <span className="text-4xl">kcal</span>
              </p>
            </div>
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
        <div className="flex justify-between items-center mt-auto">
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