'use client'

import { useGameStore, TimeOfDay } from '@/store/gameStore'

const TIME_LABELS: Record<TimeOfDay, string> = {
  day: '☀️ 白天',
  dusk: '🌅 黄昏',
  night: '🌙 夜晚',
}

const TIME_COLORS: Record<TimeOfDay, string> = {
  day: 'from-yellow-400 to-orange-400',
  dusk: 'from-orange-500 to-purple-500',
  night: 'from-blue-800 to-purple-900',
}

export function GameClock() {
  const { gameTime, timeOfDay, day } = useGameStore()

  const hours = Math.floor(gameTime)
  const minutes = Math.floor((gameTime % 1) * 60)

  const formatTime = (h: number, m: number) => {
    const displayHour = h.toString().padStart(2, '0')
    const displayMin = m.toString().padStart(2, '0')
    return `${displayHour}:${displayMin}`
  }

  const clockProgress = gameTime / 24

  const getSegmentColor = (hour: number) => {
    if (hour >= 6 && hour < 17) return '#fbbf24'
    if (hour >= 17 && hour < 19) return '#f97316'
    return '#4338ca'
  }

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-gray-900/90 rounded-lg p-4 border border-gray-700 shadow-xl">
        <div className="text-center mb-3">
          <div className="text-xs text-gray-400 mb-1">第 {day} 天</div>
          <div className={`text-lg font-bold bg-gradient-to-r ${TIME_COLORS[timeOfDay]} bg-clip-text text-transparent`}>
            {TIME_LABELS[timeOfDay]}
          </div>
        </div>

        <div className="relative w-28 h-28 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#374151"
              strokeWidth="4"
            />

            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i / 24) * Math.PI * 2 - Math.PI / 2
              const x1 = 50 + 35 * Math.cos(angle)
              const y1 = 50 + 35 * Math.sin(angle)
              const x2 = 50 + 42 * Math.cos(angle)
              const y2 = 50 + 42 * Math.sin(angle)
              const isActive = i <= hours
              const color = getSegmentColor(i)

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? color : '#4b5563'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )
            })}

            <circle cx="50" cy="50" r="30" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />

            <text
              x="50"
              y="46"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="14"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {formatTime(hours, minutes)}
            </text>
            <text
              x="50"
              y="60"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#9ca3af"
              fontSize="10"
            >
              24小时制
            </text>

            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="none"
              strokeWidth="0"
            />
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray={`${clockProgress * Math.PI * 2 * 28} ${Math.PI * 2 * 28}`}
              transform="rotate(-90 50 50)"
              opacity="0.5"
            />
          </svg>
        </div>

        <div className="mt-3 flex justify-center gap-1 text-[10px] flex-wrap">
          <span className="px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-400">6-17点 白天</span>
          <span className="px-2 py-0.5 rounded bg-orange-900/50 text-orange-400">17-19点 黄昏</span>
          <span className="px-2 py-0.5 rounded bg-blue-900/50 text-blue-400">19-6点 夜晚</span>
        </div>
      </div>
    </div>
  )
}
