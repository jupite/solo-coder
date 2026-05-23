'use client';

import { Lock, Crown, Play } from 'lucide-react';

interface LevelInfo {
  id: number;
  name: string;
  bestTime?: number | null;
  bestSteps?: number | null;
}

interface LevelCardProps {
  level: LevelInfo;
  locked?: boolean;
  onClick?: (levelId: number) => void;
}

function formatTime(seconds?: number | null): string {
  if (seconds == null) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function LevelCard({ level, locked = false, onClick }: LevelCardProps) {
  const hasRecord = !!level.bestTime || !!level.bestSteps;

  const handleClick = () => {
    if (locked) return;
    if (onClick) {
      onClick(level.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={locked}
      className={`group relative glass-card gradient-border p-6 text-left transition-all duration-300 w-full
        ${
          locked
            ? 'opacity-70 cursor-not-allowed'
            : 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20'
        }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold font-[var(--font-orbitron)]
            ${
              locked
                ? 'bg-slate-700/60 text-slate-400'
                : 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30'
            }`}
        >
          {level.id}
        </div>

        {locked ? (
          <Lock className="w-5 h-5 text-slate-500" />
        ) : hasRecord ? (
          <Crown className="w-5 h-5 text-yellow-400" />
        ) : (
          <Play className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        )}
      </div>

      <h3
        className={`text-lg font-semibold mb-3 ${
          locked ? 'text-slate-500' : 'text-white'
        }`}
      >
        {level.name}
      </h3>

      <div className="flex items-center gap-4 text-sm">
        <div
          className={`flex flex-col ${
            hasRecord ? 'text-indigo-300' : 'text-slate-500'
          }`}
        >
          <span className="text-xs text-slate-400">最佳时间</span>
          <span className="font-mono font-semibold">
            {formatTime(level.bestTime)}
          </span>
        </div>

        {level.bestSteps ? (
          <div className="flex flex-col text-cyan-300">
            <span className="text-xs text-slate-400">最少步数</span>
            <span className="font-mono font-semibold">{level.bestSteps}</span>
          </div>
        ) : (
          <div className="flex flex-col text-slate-500">
            <span className="text-xs text-slate-400">最少步数</span>
            <span className="font-mono font-semibold">--</span>
          </div>
        )}
      </div>
    </button>
  );
}
