'use client'

export function ControlsHint() {
  return (
    <div className="absolute top-4 left-4 bg-gray-900/80 rounded-lg p-4 text-white text-sm">
      <h3 className="font-bold mb-2 text-yellow-400">🎮 操作说明</h3>
      <div className="space-y-1 text-gray-300">
        <div><span className="text-green-400">WASD</span> - 移动</div>
        <div><span className="text-green-400">F</span> - 攻击</div>
        <div><span className="text-green-400">空格</span> - 采集</div>
        <div><span className="text-green-400">M</span> - 地图</div>
        <div><span className="text-green-400">点击工具栏</span> - 制作/装备工具</div>
      </div>
    </div>
  )
}
