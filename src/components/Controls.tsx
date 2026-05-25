import React from 'react';

export const Controls: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 pointer-events-none">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-3 text-white text-sm">
        <h3 className="font-bold text-lg mb-2 text-yellow-400">操作说明</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <span className="text-gray-300">W/↑</span>
          <span>向前移动</span>
          <span className="text-gray-300">S/↓</span>
          <span>向后移动</span>
          <span className="text-gray-300">A/←</span>
          <span>向左移动</span>
          <span className="text-gray-300">D/→</span>
          <span>向右移动</span>
          <span className="text-gray-300">Shift</span>
          <span>加速</span>
          <span className="text-gray-300">空格</span>
          <span>传球/射门</span>
          <span className="text-gray-300">Tab</span>
          <span>切换球员</span>
          <span className="text-gray-300">ESC</span>
          <span>暂停游戏</span>
        </div>
      </div>
    </div>
  );
};
