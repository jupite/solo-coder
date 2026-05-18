import { useGameStore } from '../store/useGameStore'

export function Message() {
  const { message, phase, winner } = useGameStore()

  const getBgColor = () => {
    if (phase === 'finished') {
      if (winner === 'player') return 'bg-green-500/90 border-green-400/30'
      if (winner === 'ai') return 'bg-red-500/90 border-red-400/30'
      return 'bg-yellow-500/90 border-yellow-400/30'
    }
    return 'bg-slate-800/90 border-slate-600/30'
  }

  return (
    <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10">
      <div
        className={`${getBgColor()} backdrop-blur-md rounded-lg px-6 py-2 shadow-lg border animate-pulse`}
      >
        <span className="text-white font-medium">{message}</span>
      </div>
    </div>
  )
}
