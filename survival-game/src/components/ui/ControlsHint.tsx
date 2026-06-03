'use client'

export function ControlsHint() {
  return (
    <div className="absolute top-4 left-4 bg-gray-900/80 rounded-lg p-4 text-white text-sm border border-gray-700">
      <h3 className="font-bold mb-2 text-yellow-400">🎮 操作说明</h3>
      <div className="space-y-1 text-gray-300">
        <div><span className="text-green-400 font-mono">WASD</span> - 移动角色</div>
        <div><span className="text-green-400 font-mono">F</span> - 攻击（消耗体力）</div>
        <div><span className="text-green-400 font-mono">空格</span> - 采集资源</div>
        <div><span className="text-green-400 font-mono">M</span> - 打开/关闭地图</div>
      </div>
      <div className="mt-3 pt-2 border-t border-gray-700">
        <h4 className="font-semibold text-blue-400 mb-1">📋 采集规则</h4>
        <div className="text-xs text-gray-400 space-y-0.5">
          <div>• 燧石、树枝、草 → 可直接徒手采集</div>
          <div>• 木材 → 需要装备 🪓 斧头</div>
          <div>• 石头 → 需要装备 ⛏️ 稿子</div>
        </div>
      </div>
    </div>
  )
}
