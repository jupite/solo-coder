'use client'

import { useGameStore } from '@/store/gameStore'

function StatBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-300 mb-1">
          <span>{label}</span>
          <span>{Math.round(value)}</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-300`}
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function StatusBar() {
  const { playerHealth, playerHunger, playerStamina, equippedTool } = useGameStore()

  return (
    <div className="absolute right-4 top-4 w-48 bg-gray-900/80 rounded-lg p-4 space-y-3">
      <StatBar label="生命" value={playerHealth} color="bg-red-500" icon="❤️" />
      <StatBar label="饥饿" value={playerHunger} color="bg-yellow-500" icon="🍖" />
      <StatBar label="体力" value={playerStamina} color="bg-green-500" icon="⚡" />
      
      <div className="pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-1">装备</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {equippedTool === 'axe' ? '🪓' : equippedTool === 'pickaxe' ? '⛏️' : equippedTool === 'torch' ? '🔦' : equippedTool === 'campfire' ? '🔥' : '✋'}
          </span>
          <span className="text-sm text-white">
            {equippedTool === 'axe' ? '斧头' : equippedTool === 'pickaxe' ? '稿子' : equippedTool === 'torch' ? '火把' : equippedTool === 'campfire' ? '火堆' : '空手'}
          </span>
        </div>
      </div>
    </div>
  )
}
