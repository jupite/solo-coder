import React from 'react';
import { PreviewScene } from '../Game/PreviewScene';

export const PreviewWindow: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 w-56 h-56 bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      <div className="absolute top-2 left-2 text-white text-xs font-medium bg-slate-800/80 px-2 py-1 rounded z-10">
        目标区域
      </div>
      <PreviewScene />
    </div>
  );
};
