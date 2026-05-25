import { useGameStore } from '../store/gameStore'

export function ChargeBar() {
  const isCharging = useGameStore((state) => state.isCharging)
  const chargeProgress = useGameStore((state) => state.chargeProgress)

  if (!isCharging) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
      <div className="w-64 h-4 bg-black/50 rounded-full overflow-hidden border-2 border-white/30">
        <div
          className="h-full rounded-full transition-all duration-75"
          style={{
            width: `${chargeProgress * 100}%`,
            background: `linear-gradient(90deg, #4CAF50, #FFC107, #FF5722, #F44336)`,
          }}
        />
      </div>
      <p className="text-center text-white text-sm mt-1 drop-shadow-lg">
        蓄力中... 松开鼠标发射
      </p>
    </div>
  )
}
