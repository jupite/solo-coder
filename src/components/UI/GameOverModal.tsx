import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { RotateCcw, Trophy } from 'lucide-react';
import { COLORS } from '@/types/game';

export const GameOverModal: React.FC = () => {
  const { gamePhase, scores, resetGame } = useGameStore();

  if (gamePhase !== 'gameEnd') return null;

  const winner = scores.player1 > scores.player2 ? 1 : scores.player2 > scores.player1 ? 2 : 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">游戏结束!</h2>
          {winner > 0 ? (
            <p className="text-slate-400">
              <span
                className="font-bold"
                style={{ color: winner === 1 ? COLORS.player1 : COLORS.player2 }}
              >
                玩家 {winner}
              </span>{' '}
              获胜!
            </p>
          ) : (
            <p className="text-slate-400">平局!</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div
              className="w-6 h-6 rounded-full mx-auto mb-2"
              style={{ backgroundColor: COLORS.player1 }}
            />
            <div className="text-3xl font-bold text-white">{scores.player1}</div>
            <div className="text-sm text-slate-400">玩家 1</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div
              className="w-6 h-6 rounded-full mx-auto mb-2"
              style={{ backgroundColor: COLORS.player2 }}
            />
            <div className="text-3xl font-bold text-white">{scores.player2}</div>
            <div className="text-sm text-slate-400">玩家 2</div>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25"
        >
          <RotateCcw className="w-5 h-5" />
          重新开始
        </button>
      </div>
    </div>
  );
};
