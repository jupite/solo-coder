import { RotateCcw, Camera, RefreshCw } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import type { CameraMode } from '../game/types'

export function ControlPanel() {
  const { resetThrow, resetGame, setCameraMode, cameraMode, phase } = useGameStore()

  const cameraModes: { mode: CameraMode; label: string }[] = [
    { mode: 'default', label: '默认' },
    { mode: 'top', label: '俯视' },
    { mode: 'follow', label: '跟随' },
  ]

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
      <button
        onClick={resetThrow}
        disabled={phase !== 'player_turn'}
        className="flex items-center gap-2 bg-orange-500/90 hover:bg-orange-600 disabled:bg-gray-500/50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl backdrop-blur-md shadow-lg border border-orange-400/30 transition-all hover:scale-105 active:scale-95"
      >
        <RotateCcw size={20} />
        <span className="font-medium">重置投掷</span>
      </button>

      <div className="flex bg-slate-800/90 backdrop-blur-md rounded-xl p-1 shadow-lg border border-slate-600/30">
        {cameraModes.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setCameraMode(mode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              cameraMode === mode
                ? 'bg-blue-500 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Camera size={16} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="flex items-center gap-2 bg-green-500/90 hover:bg-green-600 text-white px-5 py-3 rounded-xl backdrop-blur-md shadow-lg border border-green-400/30 transition-all hover:scale-105 active:scale-95"
      >
        <RefreshCw size={20} />
        <span className="font-medium">重新开始</span>
      </button>
    </div>
  )
}
