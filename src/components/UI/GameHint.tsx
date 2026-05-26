import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { MousePointer2 } from 'lucide-react';

export const GameHint: React.FC = () => {
  const { gamePhase, currentPlayer } = useGameStore();

  const getHintText = () => {
    switch (gamePhase) {
      case 'ready':
        return `玩家 ${currentPlayer} - 点击并向后拖动来投掷冰壶`;
      case 'aiming':
        return '释放鼠标投掷冰壶';
      case 'thrown':
        return '冰壶滑行中...';
      case 'roundEnd':
        return '准备下一轮...';
      case 'gameEnd':
        return '游戏结束!';
      default:
        return '';
    }
  };

  if (gamePhase === 'gameEnd') return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-2xl border border-slate-700">
      <div className="flex items-center gap-3">
        <MousePointer2 className="w-5 h-5 text-cyan-400" />
        <span className="text-white font-medium">{getHintText()}</span>
      </div>
    </div>
  );
};
