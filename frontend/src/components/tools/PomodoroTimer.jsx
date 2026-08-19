import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  const timerRef = useRef(null);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };
  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      // Play sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play();
      } catch (e) {
        console.error("Audio play failed", e);
      }
      alert(mode === 'work' ? 'Time for a break!' : 'Break is over. Back to work!');
      switchMode(mode === 'work' ? 'break' : 'work');
    }
    
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, mode]);

  // Format MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = mode === 'work' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12 flex flex-col items-center justify-center min-h-[500px]">
      <div className="max-w-sm w-full space-y-8">
        
        <div className="flex p-1 bg-muted rounded-full">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${mode === 'work' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => switchMode('work')}
          >
            Work (25m)
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${mode === 'break' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => switchMode('break')}
          >
            Break (5m)
          </button>
        </div>

        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle 
              cx="128" cy="128" r="120" 
              className="stroke-muted fill-transparent" strokeWidth="8"
            />
            <circle 
              cx="128" cy="128" r="120" 
              className={`fill-transparent transition-all duration-1000 ${mode === 'work' ? 'stroke-primary' : 'stroke-emerald-500'}`} 
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center z-10 flex flex-col items-center">
            <h2 className="text-6xl font-bold font-mono tracking-tighter">{formatTime(timeLeft)}</h2>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">
              {mode === 'work' ? 'Focus' : 'Relax'}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {!isActive ? (
            <Button size="lg" className="w-32 rounded-full shadow-md" onClick={startTimer}>
              <Icons.Play className="w-5 h-5 mr-2" /> Start
            </Button>
          ) : (
            <Button size="lg" variant="secondary" className="w-32 rounded-full shadow-md" onClick={pauseTimer}>
              <Icons.Pause className="w-5 h-5 mr-2" /> Pause
            </Button>
          )}
          <Button size="lg" variant="outline" size="icon" className="w-11 h-11 rounded-full" onClick={resetTimer} title="Reset">
            <Icons.RotateCcw className="w-5 h-5" />
          </Button>
        </div>

      </div>
    </div>
  );
}