'use client'

import { useGameStore, BUILDING_NAMES } from '@/store/gameStore'

export function PlacementHint() {
  const { placement, cancelPlacement, confirmPlacement } = useGameStore()

  if (!placement.isActive) return null

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-gray-900/95 rounded-lg p-3 border border-yellow-500/50 shadow-lg">
        <div className="text-yellow-400 font-bold text-sm mb-2 text-center">
          🔨 放置 {placement.buildingType && BUILDING_NAMES[placement.buildingType]}
        </div>
        <div className="flex gap-3 text-xs text-gray-300">
          <div className="flex items-center gap-1">
            <span className="bg-gray-700 px-1.5 py-0.5 rounded font-mono text-green-400">鼠标</span>
            <span>定位</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-gray-700 px-1.5 py-0.5 rounded font-mono text-green-400">R</span>
            <span>旋转</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-gray-700 px-1.5 py-0.5 rounded font-mono text-green-400">G</span>
            <span>{placement.snapToGrid ? '网格吸附:开' : '网格吸附:关'}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => confirmPlacement()}
            disabled={!placement.isValid || !placement.position}
            className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${
              placement.isValid && placement.position
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {placement.isValid ? '✅ 确认放置 (点击)' : '❌ 位置无效'}
          </button>
          <button
            onClick={cancelPlacement}
            className="flex-1 py-1.5 rounded text-xs font-semibold bg-red-600 hover:bg-red-500 text-white"
          >
            ❌ 取消 (ESC)
          </button>
        </div>
        {placement.position && (
          <div className="text-xs text-gray-500 mt-1 text-center">
            坐标: ({placement.position[0].toFixed(1)}, {placement.position[2].toFixed(1)}) 旋转: {Math.round(placement.rotation * 180 / Math.PI)}°
          </div>
        )}
      </div>
    </div>
  )
}
