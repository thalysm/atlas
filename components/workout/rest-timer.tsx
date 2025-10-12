"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRestTimer } from "@/hooks/use-rest-timer"
import { Play, Pause, RotateCcw, Timer, ChevronsUp, ChevronsDown } from "lucide-react"

export function RestTimer() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [customTime, setCustomTime] = useState(60)
  const { 
    timeLeft, 
    isActive, 
    duration, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    resetTimer 
  } = useRestTimer(60)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  const handleCustomTimeStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (customTime > 0) {
      startTimer(customTime)
    }
  }

  const progress = duration > 0 ? (timeLeft / duration) * 100 : 0

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsExpanded(true)} className="rounded-full h-16 w-16 bg-primary hover:bg-primary-hover shadow-lg">
          <div className="flex flex-col items-center">
            <Timer className="h-5 w-5" />
            <span className="text-sm font-mono font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 border-border w-80 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Descanso</h3>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setIsExpanded(false)}>
            <ChevronsDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center mb-4">
            <div
            className="relative h-24 w-24 flex items-center justify-center"
          >
            <svg className="absolute w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-surface"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                className="text-primary"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                style={{ transition: 'stroke-dasharray 0.5s linear' }}
              />
            </svg>
            <span className="text-3xl font-mono font-semibold text-foreground">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
            <Button size="sm" variant="outline" className="border-border" onClick={() => startTimer(30)}>30s</Button>
            <Button size="sm" variant="outline" className="border-border" onClick={() => startTimer(60)}>60s</Button>
            <Button size="sm" variant="outline" className="border-border" onClick={() => startTimer(90)}>90s</Button>
        </div>
        
        <form onSubmit={handleCustomTimeStart} className="flex gap-2 mb-4">
          <Input 
            type="number"
            placeholder="Segundos"
            value={customTime}
            onChange={(e) => setCustomTime(Number(e.target.value))}
            className="bg-surface border-border"
          />
          <Button type="submit" className="bg-primary hover:bg-primary-hover">Iniciar</Button>
        </form>

        <div className="flex gap-2">
          {isActive ? (
            <Button size="sm" variant="secondary" className="w-full" onClick={pauseTimer}>
              <Pause className="h-4 w-4 mr-2" /> Pausar
            </Button>
          ) : (
            <Button size="sm" className="w-full bg-primary hover:bg-primary-hover" onClick={resumeTimer} disabled={timeLeft === 0}>
              <Play className="h-4 w-4 mr-2" /> Retomar
            </Button>
          )}
          <Button size="icon-sm" variant="outline" className="border-border" onClick={() => resetTimer()}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}