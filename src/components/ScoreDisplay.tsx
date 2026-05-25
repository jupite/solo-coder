import { useGameStore } from '../store/gameStore'

export function ScoreDisplay() {
  const score = useGameStore((state) => state.score)

  return (
    <div className="fixed top-4 left-4 z-40 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        <span className="text-white text-xl font-bold">分数: {score}</span>
      </div>
    </div>
  )
}
