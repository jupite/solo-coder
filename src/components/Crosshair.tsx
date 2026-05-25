import { useGameStore } from '../store/gameStore'

export function Crosshair() {
  const aimPosition = useGameStore((state) => state.aimPosition)
  const isCharging = useGameStore((state) => state.isCharging)

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${aimPosition.x * 100}%`,
        top: `${aimPosition.y * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className={`w-8 h-8 border-2 rounded-full flex items-center justify-center transition-all duration-100 ${
          isCharging ? 'border-red-500 scale-110' : 'border-white/80'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${isCharging ? 'bg-red-500' : 'bg-white/80'}`} />
      </div>
      <div className={`absolute top-1/2 left-1/2 w-4 h-0.5 -translate-x-1/2 -translate-y-1/2 ${isCharging ? 'bg-red-500' : 'bg-white/80'}`} />
      <div className={`absolute top-1/2 left-1/2 w-0.5 h-4 -translate-x-1/2 -translate-y-1/2 ${isCharging ? 'bg-red-500' : 'bg-white/80'}`} />
    </div>
  )
}
