import { GameCanvas } from './components/GameCanvas'
import { ScoreBoard } from './components/ScoreBoard'
import { ControlPanel } from './components/ControlPanel'
import { PowerBar } from './components/PowerBar'
import { Message } from './components/Message'

export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
      <GameCanvas />
      <ScoreBoard />
      <Message />
      <PowerBar />
      <ControlPanel />

      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          🥌 冰壶游戏
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          鼠标向后拖动控制力度和方向
        </p>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-lg p-3 text-xs text-slate-300">
          <div className="font-medium text-white mb-1">操作说明</div>
          <div>• 点击冰道并向后拖动</div>
          <div>• 拖动距离控制力度</div>
          <div>• 拖动方向控制角度</div>
          <div>• 释放鼠标投掷</div>
        </div>
      </div>
    </div>
  )
}
