import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { COLORS } from '@/types/game';

export const ScorePanel: React.FC = () => {
  const { currentPlayer, currentRound, totalRounds, scores } = useGameStore();

  return (
    <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-slate-700">
      <div className="text-white text-sm font-medium mb-3">
        第 {currentRound} / {totalRounds} 轮
      </div>

      <div className="space-y-2">
        <div
          className={`flex items-center justify-between gap-8 px-3 py-2 rounded-lg transition-all ${
            currentPlayer === 1
              ? 'bg-red-500/20 border border-red-500/50'
              : 'bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full shadow-inner"
              style={{ backgroundColor: COLORS.player1 }}
            />
            <span className="text-white font-medium">玩家 1</span>
          </div>
          <span className="text-white text-xl font-bold">{scores.player1}</span>
        </div>

        <div
          className={`flex items-center justify-between gap-8 px-3 py-2 rounded-lg transition-all ${
            currentPlayer === 2
              ? 'bg-blue-500/20 border border-blue-500/50'
              : 'bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full shadow-inner"
              style={{ backgroundColor: COLORS.player2 }}
            />
            <span className="text-white font-medium">玩家 2</span>
          </div>
          <span className="text-white text-xl font-bold">{scores.player2}</span>
        </div>
      </div>
    </div>
  );
};
