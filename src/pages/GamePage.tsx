import { Canvas } from '@react-three/fiber'
import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { GameScene } from '../components/GameScene'
import { Crosshair } from '../components/Crosshair'
import { ChargeBar } from '../components/ChargeBar'
import { ScoreDisplay } from '../components/ScoreDisplay'
import { Timer } from '../components/Timer'

export function GamePage() {
  const isPlaying = useGameStore((state) => state.isPlaying)
  const isGameOver = useGameStore((state) => state.isGameOver)
  const resetGame = useGameStore((state) => state.resetGame)

  useEffect(() => {
    if (!isPlaying && !isGameOver) {
      resetGame()
    }
  }, [isPlaying, isGameOver, resetGame])

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-sky-400">
      <Canvas
        shadows
        camera={{ position: [0, 3, 5], fov: 60 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#87CEEB']} />
        <fog attach="fog" args={['#87CEEB', 50, 200]} />
        <GameScene />
      </Canvas>

      <Crosshair />
      <ChargeBar />
      <ScoreDisplay />
      <Timer />

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
        <p className="text-white text-sm">
          🖱️ 移动鼠标瞄准 | 长按左键蓄力 | 松开发射
        </p>
      </div>
    </div>
  )
}
