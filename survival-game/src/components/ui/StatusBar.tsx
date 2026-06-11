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
  const { playerHealth, playerHunger, playerSanity, healthRate, hungerRate, sanityRate, isDead, spawnPoint, playerPosition } = useGameStore()

  const distToSpawn = Math.sqrt(
    Math.pow(playerPosition[0] - spawnPoint[0], 2) +
    Math.pow(playerPosition[2] - spawnPoint[2], 2)
  )
  const nearSpawn = distToSpawn <= 3

  return (
    <div className="absolute right-4 top-56 w-60 bg-gray-900/90 rounded-lg p-4 space-y-3 border border-gray-700">
      {isDead ? (
        <div className="text-center">
          <div className="text-3xl mb-2">👻</div>
          <div className="text-cyan-400 font-bold text-lg mb-2">魂魄状态</div>
          <div className="text-gray-300 text-sm mb-2">
            你已死亡，只能移动
          </div>
          <div className={`text-sm ${nearSpawn ? 'text-green-400' : 'text-yellow-400'}`}>
            {nearSpawn ? '✅ 按空格复活' : '📍 回到出生点大门按空格复活'}
          </div>
        </div>
      ) : (
        <>
          <StatBar label="生命" value={playerHealth} color="bg-red-500" icon="❤️" rate={healthRate} />
          <StatBar label="饥饿" value={playerHunger} color="bg-yellow-500" icon="🍖" rate={hungerRate} />
          <StatBar label="理智" value={playerSanity} color="bg-purple-500" icon="🧠" rate={sanityRate} />
        </>
      )}
    </div>
  )
}
