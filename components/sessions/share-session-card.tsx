"use client";

import { forwardRef } from "react";
import Image from "next/image";
import {
  Clock,
  Dumbbell,
  Repeat,
  Weight,
  Flame,
  TrendingUp,
  Target,
} from "lucide-react";
import type { WorkoutSession, ExerciseLog, StrengthSet } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ShareSessionCardProps {
  session: WorkoutSession;
  size: "square" | "story";
}

export const ShareSessionCard = forwardRef<HTMLDivElement, ShareSessionCardProps>(
  ({ session, size }, ref) => {
    const totalWeight = session.exercises.reduce((acc, exercise) => {
      if (exercise.type === "strength") {
        return (
          acc +
          (exercise.sets as StrengthSet[]).reduce(
            (setAcc, set) => setAcc + (set.weight || 0) * (set.reps || 0),
            0
          )
        );
      }
      return acc;
    }, 0);

    const totalReps = session.exercises.reduce((acc, exercise) => {
      if (exercise.type === "strength") {
        return (
          acc +
          (exercise.sets as StrengthSet[]).reduce(
            (setAcc, set) => setAcc + (set.reps || 0),
            0
          )
        );
      }
      return acc;
    }, 0);
    
    const totalSets = session.exercises.reduce(
        (acc, exercise) => acc + exercise.sets.length,
        0
      );

    const mainExercises = session.exercises
      .slice(0, 5)
      .map((e) => e.exercise_name)
      .join(" • ");

    const formattedDate = format(
      new Date(session.start_time),
      "dd 'de' MMMM 'de' yyyy",
      { locale: ptBR }
    );

    const cardSize =
      size === "square" ? "w-[1080px] h-[1080px]" : "w-[1080px] h-[1920px]";

    return (
      <div
        ref={ref}
        className={`bg-background text-foreground p-16 flex flex-col justify-between ${cardSize}`}
      >
        <div>
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-8xl font-bold text-primary">Atlas</h1>
            <p className="text-5xl text-muted-foreground">{formattedDate}</p>
          </div>
          <div className="grid grid-cols-3 gap-12 text-center mb-12">
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
              <Weight className="w-16 h-16 text-primary mb-4" />
              <p className="text-4xl">Peso Total</p>
              <p className="text-6xl font-bold">
                {totalWeight}
                <span className="text-4xl">kg</span>
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Repeat className="w-16 h-16 text-primary mb-4" />
              <p className="text-4xl">Repetições</p>
              <p className="text-6xl font-bold">{totalReps}</p>
            </div>
             <div className="flex flex-col items-center">
                <TrendingUp className="w-16 h-16 text-primary mb-4" />
                <p className="text-4xl">Total de Séries</p>
                <p className="text-6xl font-bold">{totalSets}</p>
            </div>
            <div className="flex flex-col items-center">
              <Flame className="w-16 h-16 text-primary mb-4" />
              <p className="text-4xl">Cardio</p>
               <p className="text-6xl font-bold">
                {session.exercises.filter(e => e.type === 'cardio').length}
                <span className="text-4xl"> ex.</span>
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Target className="w-12 h-12 text-primary" />
              <h2 className="text-5xl font-bold">Principais Exercícios</h2>
            </div>
            <p className="text-4xl text-muted-foreground">{mainExercises}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
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