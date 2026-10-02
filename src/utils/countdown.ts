import { useState, useEffect } from 'react';

export interface DailyCountdownInfo {
  hours: number;
  minutes: number;
  seconds: number;
  totalSecondsRemaining: number;
  formattedClock: string; // "14:23:09"
  formattedVerbose: string; // "14h 23m 09s"
  progressPercent: number; // 0-100% of 24h passed
  targetDateUtc: string;
}

export function calculateDailyTimeRemaining(): DailyCountdownInfo {
  const now = new Date();
  
  // Calculate next midnight UTC
  const nextUtcMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));

  const diffMs = Math.max(0, nextUtcMidnight.getTime() - now.getTime());
  const totalSecondsRemaining = Math.floor(diffMs / 1000);
  
  const hours = Math.floor(totalSecondsRemaining / 3600);
  const minutes = Math.floor((totalSecondsRemaining % 3600) / 60);
  const seconds = totalSecondsRemaining % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedClock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  const formattedVerbose = `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;

  // 86,400 seconds in a day
  const secondsPassedToday = 86400 - totalSecondsRemaining;
  const progressPercent = Math.min(100, Math.max(0, (secondsPassedToday / 86400) * 100));

  const targetDateUtc = nextUtcMidnight.toISOString().slice(0, 10);

  return {
    hours,
    minutes,
    seconds,
    totalSecondsRemaining,
    formattedClock,
    formattedVerbose,
    progressPercent,
    targetDateUtc
  };
}

export function useDailyCountdown(): DailyCountdownInfo {
  const [countdown, setCountdown] = useState<DailyCountdownInfo>(calculateDailyTimeRemaining);

  useEffect(() => {
    // Initial sync
    setCountdown(calculateDailyTimeRemaining());

    const timer = window.setInterval(() => {
      setCountdown(calculateDailyTimeRemaining());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return countdown;
}
