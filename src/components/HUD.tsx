import React from 'react';
import { useGameStore } from '../store/gameStore';

export const HUD: React.FC = () => {
  const { score, time, isPaused, isCharging, chargePower } = useGameStore();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none">
      <div className="flex justify-center items-center pt-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-8 py-3 flex items-center gap-6">
          <div className="text-blue-400 font-bold text-2xl">
            {score.home}
          </div>
          <div className="text-white text-lg font-mono">
            {formatTime(time)}
          </div>
          <div className="text-red-400 font-bold text-2xl">
            {score.away}
          </div>
        </div>
      </div>

      {isCharging && (
        <div className="flex justify-center items-center mt-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="text-yellow-400 text-sm mb-1 text-center">蓄力中</div>
            <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-100"
                style={{ width: `${chargePower * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {isPaused && (
        <div className="flex justify-center items-center mt-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-6 py-2">
            <span className="text-yellow-400 font-bold text-lg">
              游戏暂停 - 按 ESC 继续
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
