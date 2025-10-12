"use client"

import { useState, useEffect, useCallback, useRef } from 'react';

export function useRestTimer(initialTime = 60) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(initialTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // We need to create the audio element on the client side
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3'); 
    }
  }, []);

  const playSound = () => {
    audioRef.current?.play().catch(err => console.error("Audio play failed:", err));
  };

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      stopTimer();
      playSound();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, stopTimer]);

  const startTimer = useCallback((newDuration?: number) => {
    stopTimer();
    const d = newDuration || duration;
    setDuration(d);
    setTimeLeft(d);
    setIsActive(true);
  }, [duration, stopTimer]);

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resumeTimer = () => {
    if (timeLeft > 0) {
      setIsActive(true);
    }
  };

  const resetTimer = useCallback((newDuration?: number) => {
    stopTimer();
    const d = newDuration || duration;
    setDuration(d);
    setTimeLeft(d);
  }, [duration, stopTimer]);

  return {
    timeLeft,
    isActive,
    duration,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };
}