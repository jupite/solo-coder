'use client'

import { useState } from 'react'

export function ControlsHint() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="absolute top-4 left-20 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-gray-900/80 rounded-full flex items-center justify-center text-2xl hover:bg-gray-800/80 transition-colors border-2 border-gray-600 hover:border-gray-500 shadow-lg"
        title="操作说明"
      >
        ❓
      </button>

      {isOpen && (
        <div className="mt-2 w-72 bg-gray-900/95 rounded-lg p-4 text-white text-sm border border-gray-700 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-yellow-400">🎮 操作说明</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="space-y-1.5 text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono bg-gray-800 px-2 py-0.5 rounded min-w-[50px] text-center">WASD</span>
              <span>移动角色</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono bg-gray-800 px-2 py-0.5 rounded min-w-[50px] text-center">F</span>
              <span>攻击（消耗体力）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono bg-gray-800 px-2 py-0.5 rounded min-w-[50px] text-center">空格</span>
              <span>采集资源</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono bg-gray-800 px-2 py-0.5 rounded min-w-[50px] text-center">E</span>
              <span>与建筑交互（开箱子等）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono bg-gray-800 px-2 py-0.5 rounded min-w-[50px] text-center">M</span>
              <span>打开/关闭地图</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <h4 className="font-semibold text-blue-400 mb-2">🔨 建造操作</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>• 在侧边栏选择建筑后进入放置模式</div>
              <div>• <span className="text-green-400">鼠标</span> 移动定位建筑位置</div>
              <div>• <span className="text-green-400">R</span> 旋转建筑</div>
              <div>• <span className="text-green-400">G</span> 切换网格吸附</div>
              <div>• <span className="text-green-400">点击</span> 确认放置</div>
              <div>• <span className="text-green-400">ESC</span> 取消放置</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <h4 className="font-semibold text-orange-400 mb-2">📋 采集规则</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>• 燧石 🔥、树枝 🌿、草 🌱 → 可直接徒手采集</div>
              <div>• 木材 🪵 → 需要装备 🪓 斧头</div>
              <div>• 石头 🪨 → 需要装备 ⛏️ 稿子</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <h4 className="font-semibold text-cyan-400 mb-2">📦 物品存储</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>• 靠近箱子按 <span className="text-green-400">E</span> 打开</div>
              <div>• 拖动物品到箱子中存放</div>
              <div>• 从箱子拖回背包取出</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <h4 className="font-semibold text-purple-400 mb-2">♾️ 无限建造</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>• 点击侧边栏 ♾️ 按钮开启</div>
              <div>• 开启后制作和建造不消耗材料</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
