import { useGameStore } from '../store/useGameStore'
import { GAME_CONFIG } from '../game/config'

export function ScoreBoard() {
  const { playerScore, aiScore, playerStonesThrown, aiStonesThrown, phase, winner } =
    useGameStore()

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-8 z-10">
      <div className="bg-blue-600/90 backdrop-blur-md rounded-xl px-6 py-4 shadow-lg border border-blue-400/30">
        <div className="text-blue-100 text-sm font-medium mb-1">玩家</div>
        <div className="text-white text-3xl font-bold">{playerScore}</div>
        <div className="text-blue-200 text-xs mt-1">
          冰壶: {playerStonesThrown}/{GAME_CONFIG.STONES_PER_PLAYER}
        </div>
      </div>

      <div className="bg-slate-800/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-slate-600/30 flex items-center">
        <div className="text-center">
          <div className="text-slate-400 text-xs">状态</div>
          <div className="text-white text-sm font-medium mt-1">
            {phase === 'player_turn' && '你的回合'}
            {phase === 'ai_turn' && 'AI回合'}
            {phase === 'calculating' && '计算中...'}
            {phase === 'finished' && (winner === 'player' ? '你赢了!' : winner === 'ai' ? 'AI赢了!' : '平局')}
          </div>
        </div>
      </div>

      <div className="bg-red-600/90 backdrop-blur-md rounded-xl px-6 py-4 shadow-lg border border-red-400/30">
        <div className="text-red-100 text-sm font-medium mb-1">AI对手</div>
        <div className="text-white text-3xl font-bold">{aiScore}</div>
        <div className="text-red-200 text-xs mt-1">
          冰壶: {aiStonesThrown}/{GAME_CONFIG.STONES_PER_PLAYER}
        </div>
      </div>
    </div>
  )
}
