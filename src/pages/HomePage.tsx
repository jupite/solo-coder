import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { Trophy, Target, Timer as TimerIcon } from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const loadHistory = useGameStore((state) => state.loadHistory)
  const history = useGameStore((state) => state.history)
  const resetGame = useGameStore((state) => state.resetGame)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleStart = () => {
    resetGame()
    navigate('/game')
  }

  const highScore = history.length > 0 ? Math.max(...history.map((h) => h.score)) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-500 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          🏹 骑马射箭
        </h1>
        <p className="text-xl text-white/90 drop-shadow">
          策马奔腾，箭无虚发！
        </p>
      </div>

      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white/30 shadow-2xl">
        <button
          onClick={handleStart}
          className="w-full py-4 px-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-bold rounded-2xl hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl mb-6"
        >
          🎮 开始游戏
        </button>

        <div className="bg-black/20 rounded-xl p-4 mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            历史最佳
          </h3>
          <div className="text-4xl font-bold text-yellow-400 text-center">
            {highScore}
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-4">
          <h3 className="text-white font-bold mb-3">🎯 游戏说明</h3>
          <ul className="text-white/90 text-sm space-y-2">
            <li className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              鼠标移动瞄准靶子
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">🔫</span>
              长按左键蓄力，松开发射
            </li>
            <li className="flex items-center gap-2">
              <TimerIcon className="w-4 h-4 text-yellow-400" />
              30秒内尽可能多得分
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              射中靶心得10分
            </li>
          </ul>
        </div>

        {history.length > 0 && (
          <div className="mt-6 bg-black/20 rounded-xl p-4">
            <h3 className="text-white font-bold mb-3">📊 最近成绩</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between text-white/90 text-sm"
                >
                  <span>{record.date}</span>
                  <span className="font-bold text-yellow-400">
                    {record.score}分
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
