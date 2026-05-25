import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { Trophy, Home, RotateCcw } from 'lucide-react'

export function ResultPage() {
  const navigate = useNavigate()
  const score = useGameStore((state) => state.score)
  const loadHistory = useGameStore((state) => state.loadHistory)
  const history = useGameStore((state) => state.history)
  const resetGame = useGameStore((state) => state.resetGame)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const highScore = history.length > 0 ? Math.max(...history.map((h) => h.score)) : 0
  const isNewRecord = score >= highScore && score > 0

  const handleRestart = () => {
    resetGame()
    navigate('/game')
  }

  const handleHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-500 flex flex-col items-center justify-center p-8">
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white/30 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            🏆 游戏结束
          </h1>
          {isNewRecord && (
            <p className="text-yellow-400 text-xl font-bold animate-pulse">
              🎉 新纪录！
            </p>
          )}
        </div>

        <div className="bg-black/30 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <p className="text-white/80 text-lg mb-2">本次得分</p>
            <p className="text-6xl font-bold text-yellow-400 drop-shadow-lg">
              {score}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="bg-black/20 rounded-xl px-6 py-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-white font-bold">最高: {highScore}</span>
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="bg-black/20 rounded-xl p-4 mb-6">
            <h3 className="text-white font-bold mb-3">📊 历史成绩</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between text-white/90 text-sm py-1 border-b border-white/10 last:border-0"
                >
                  <span>{record.date}</span>
                  <span
                    className={`font-bold ${
                      record.score === highScore ? 'text-yellow-400' : 'text-white'
                    }`}
                  >
                    {record.score}分
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleRestart}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            再来一局
          </button>
          <button
            onClick={handleHome}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            返回主页
          </button>
        </div>
      </div>
    </div>
  )
}
