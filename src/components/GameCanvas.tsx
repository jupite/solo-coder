import { useEffect, useRef } from 'react'
import { Game } from '../game/Game'
import { useGameStore } from '../store/useGameStore'

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const setGameRef = useGameStore((state) => state.setGameRef)
  const updateState = useGameStore((state) => state.updateState)

  useEffect(() => {
    if (!canvasRef.current) return

    const game = new Game(canvasRef.current)
    gameRef.current = game
    setGameRef(game)

    game.setStateChangeListener((state) => {
      updateState(state)
    })

    game.start()

    return () => {
      game.dispose()
    }
  }, [setGameRef, updateState])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  )
}
