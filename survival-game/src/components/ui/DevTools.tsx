'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'

const TIME_PRESETS = [
  { label: '☀️ 白天', value: 4 },
  { label: '🌅 黄昏', value: 10 },
  { label: '🌙 夜晚', value: 14 },
]

const SPEED_PRESETS = [
  { label: '⏸️ 暂停', value: 0 },
  { label: '🐢 0.5x', value: 0.5 },
  { label: '▶️ 1x', value: 1 },
  { label: '🚀 2x', value: 2 },
  { label: '⚡ 5x', value: 5 },
  { label: '🔥 10x', value: 10 },
]

export function DevTools() {
  const {
    showDevTools,
    toggleDevTools,
    gameTime,
    timeSpeed,
    setGameTime,
    setTimeSpeed,
    infiniteBuild,
    toggleInfiniteBuild,
    day,
    playerHunger,
    playerHealth,
    playerStamina,
    updatePlayerStats,
  } = useGameStore()

  const [sliderValue, setSliderValue] = useState(gameTime)

  const handleSliderChange = (value: number) => {
    setSliderValue(value)
    setGameTime(value)
  }

  if (!showDevTools) {
    return (
      <button
        onClick={toggleDevTools}
        className="absolute top-4 left-4 z-30 w-12 h-12 bg-gray-900/80 hover:bg-gray-800/90 rounded-lg border border-gray-600 flex items-center justify-center text-2xl transition-all hover:scale-105"
        title="开发者工具"
      >
        🔧
      </button>
    )
  }

  return (
    <div className="absolute top-4 left-4 z-30 w-80 bg-gray-900/95 rounded-lg border border-gray-600 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔧</span>
          <span className="text-white font-bold">开发者工具</span>
        </div>
        <button
          onClick={toggleDevTools}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-yellow-400 font-semibold mb-2 text-sm">📊 游戏状态</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-400">天数:</div>
            <div className="text-white font-mono">第 {day} 天</div>
            <div className="text-gray-400">时间:</div>
            <div className="text-white font-mono">{gameTime.toFixed(2)} / 16</div>
            <div className="text-gray-400">流速:</div>
            <div className="text-white font-mono">{timeSpeed}x</div>
            <div className="text-gray-400">饥饿:</div>
            <div className="text-white font-mono">{playerHunger.toFixed(1)}%</div>
            <div className="text-gray-400">生命:</div>
            <div className="text-white font-mono">{playerHealth.toFixed(1)}%</div>
            <div className="text-gray-400">体力:</div>
            <div className="text-white font-mono">{playerStamina.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-blue-400 font-semibold mb-3 text-sm">⏰ 时间控制</div>

          <div className="mb-3">
            <label className="text-gray-300 text-xs mb-1 block">时间滑块</label>
            <input
              type="range"
              min="0"
              max="16"
              step="0.1"
              value={sliderValue}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>0</span>
              <span>8</span>
              <span>16</span>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-gray-300 text-xs mb-2 block">时间预设</label>
            <div className="grid grid-cols-3 gap-1">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setSliderValue(preset.value)
                    setGameTime(preset.value)
                  }}
                  className={`px-1.5 py-1.5 text-[10px] rounded transition-colors ${
                    Math.abs(gameTime - preset.value) < 0.5
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-xs mb-2 block">时间流速</label>
            <div className="grid grid-cols-3 gap-1">
              {SPEED_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setTimeSpeed(preset.value)}
                  className={`px-2 py-1.5 text-[10px] rounded transition-colors ${
                    timeSpeed === preset.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-purple-400 font-semibold mb-3 text-sm">🎮 游戏功能</div>

          <button
            onClick={toggleInfiniteBuild}
            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
              infiniteBuild
                ? 'bg-purple-700 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span>♾️ 无限建造</span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              infiniteBuild ? 'bg-purple-500' : 'bg-gray-600'
            }`}>
              {infiniteBuild ? '已开启' : '已关闭'}
            </span>
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-red-400 font-semibold mb-3 text-sm">❤️ 快捷恢复</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => updatePlayerStats(undefined, 100, undefined)}
              className="py-2 px-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded text-xs transition-colors"
            >
              🍖 饱食
            </button>
            <button
              onClick={() => updatePlayerStats(100, undefined, undefined)}
              className="py-2 px-2 bg-red-700 hover:bg-red-600 text-white rounded text-xs transition-colors"
            >
              ❤️ 满血
            </button>
            <button
              onClick={() => updatePlayerStats(undefined, undefined, 100)}
              className="py-2 px-2 bg-green-700 hover:bg-green-600 text-white rounded text-xs transition-colors"
            >
              ⚡ 满体力
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
