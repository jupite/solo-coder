import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useNavigate } from 'react-router-dom'

export function Timer() {
  const timeLeft = useGameStore((state) => state.timeLeft)
  const setTimeLeft = useGameStore((state) => state.setTimeLeft)
  const isPlaying = useGameStore((state) => state.isPlaying)
  const isGameOver = useGameStore((state) => state.isGameOver)
  const setIsGameOver = useGameStore((state) => state.setIsGameOver)
  const score = useGameStore((state) => state.score)
  const saveScore = useGameStore((state) => state.saveScore)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isPlaying || isGameOver) return

    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, timeLeft - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, isGameOver, timeLeft, setTimeLeft])

  useEffect(() => {
    if (timeLeft <= 0 && isPlaying && !isGameOver) {
      setIsGameOver(true)
      saveScore(score)
      navigate('/result')
    }
  }, [timeLeft, isPlaying, isGameOver, score, saveScore, setIsGameOver, navigate])

  return (
    <div
      className={`fixed top-4 right-4 z-40 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border transition-all ${
        timeLeft <= 5 ? 'border-red-500 animate-pulse' : 'border-white/20'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">⏱️</span>
        <span
          className={`text-xl font-bold ${
            timeLeft <= 5 ? 'text-red-500' : 'text-white'
          }`}
        >
          {timeLeft}s
        </span>
      </div>
    </div>
  )
}
