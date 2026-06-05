'use client'

import { useGameStore } from '@/store/gameStore'

function StatBar({ label, value, color, icon, rate }: { label: string; value: number; color: string; icon: string; rate?: number }) {
  const formatRate = (r?: number) => {
    if (r === undefined || r === 0) return ''
    if (r > 0) return `+${r.toFixed(1)}/分`
    return `${r.toFixed(1)}/分`
  }

  const rateColor = rate && rate > 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-300 mb-1">
          <span>{label}</span>
          <div className="flex items-center gap-2">
            {rate && rate !== 0 && (
              <span className={`${rateColor} font-bold`}>
                {formatRate(rate)}
              </span>
            )}
            <span>{Math.round(value)}/100</span>
          </div>
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
  const { playerHealth, playerHunger, playerSanity, healthRate, hungerRate, sanityRate } = useGameStore()

  return (
    <div className="absolute right-4 top-56 w-60 bg-gray-900/90 rounded-lg p-4 space-y-3 border border-gray-700">
      <StatBar label="生命" value={playerHealth} color="bg-red-500" icon="❤️" rate={healthRate} />
      <StatBar label="饥饿" value={playerHunger} color="bg-yellow-500" icon="🍖" rate={hungerRate} />
      <StatBar label="理智" value={playerSanity} color="bg-purple-500" icon="🧠" rate={sanityRate} />
    </div>
  )
}
