import React from 'react';
import { useGameStore } from '@/store/useGameStore';

export const PowerIndicator: React.FC = () => {
  const { throwParams, isDragging } = useGameStore();

  if (!isDragging) return null;

  const powerPercent = Math.min(throwParams.power, 100);
  const directionDegrees = (throwParams.direction * 180) / Math.PI;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-slate-700">
      <div className="text-white text-sm font-medium mb-3 text-center">
        力度 & 方向
      </div>

      <div className="w-48 h-4 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-75"
          style={{
            width: `${powerPercent}%`,
            background: `linear-gradient(to right, #22c55e, #eab308, #ef4444)`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400">
        <span>弱</span>
        <span className="text-white font-medium">{Math.round(powerPercent)}%</span>
        <span>强</span>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-slate-400">方向:</span>
          <span className="text-white font-medium">
            {directionDegrees > 0 ? '右' : directionDegrees < 0 ? '左' : '正'}
            {Math.abs(directionDegrees) > 1 ? ` ${Math.abs(directionDegrees).toFixed(1)}°` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
