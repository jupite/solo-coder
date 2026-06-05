'use client'

import { useGameStore } from '@/store/gameStore'

function StatBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-300 mb-1">
          <span>{label}</span>
          <span>{Math.round(value)}/100</span>
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
  const { playerHealth, playerHunger, playerSanity } = useGameStore()

  return (
    <div className="absolute right-4 top-44 w-52 bg-gray-900/90 rounded-lg p-4 space-y-3 border border-gray-700">
      <StatBar label="生命" value={playerHealth} color="bg-red-500" icon="❤️" />
      <StatBar label="饥饿" value={playerHunger} color="bg-yellow-500" icon="🍖" />
      <StatBar label="理智" value={playerSanity} color="bg-purple-500" icon="🧠" />
    </div>
  )
}
