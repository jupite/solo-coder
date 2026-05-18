import { useGameStore } from '../store/useGameStore'
import { GAME_CONFIG } from '../game/config'

export function PowerBar() {
  const { throwPower, isDragging } = useGameStore()
  const powerPercent = Math.min((throwPower / GAME_CONFIG.MAX_POWER) * 100, 100)

  const getColor = () => {
    if (powerPercent < 30) return 'bg-green-500'
    if (powerPercent < 60) return 'bg-yellow-500'
    if (powerPercent < 85) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (!isDragging && throwPower === 0) return null

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 z-10">
      <div className="bg-slate-800/80 backdrop-blur-md rounded-full h-4 overflow-hidden border border-slate-600/50">
        <div
          className={`h-full ${getColor()} transition-all duration-75 ease-out`}
          style={{ width: `${powerPercent}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 px-2">
        <span className="text-xs text-slate-400">力度</span>
        <span className="text-xs text-white font-medium">
          {Math.round(powerPercent)}%
        </span>
      </div>
    </div>
  )
}
