'use client'

import { useGameStore, RECIPES, ToolType, TOOL_NAMES, RESOURCE_NAMES, ITEM_ICONS, TOOL_REQUIRED_RESOURCES } from '@/store/gameStore'

const TOOLS: { type: ToolType; icon: string; name: string; description: string }[] = [
  { type: 'axe', icon: '🪓', name: '斧头', description: '用于砍伐树木获取木材' },
  { type: 'pickaxe', icon: '⛏️', name: '稿子', description: '用于挖掘岩石获取石头' },
  { type: 'torch', icon: '🔦', name: '火把', description: '照明工具' },
  { type: 'campfire', icon: '🔥', name: '火堆', description: '提供温暖和烹饪' },
]

export function Toolbar() {
  const { inventory, equippedTool, setEquippedTool, craftTool, hasResources, showMessage } = useGameStore()

  const handleCraft = (tool: ToolType) => {
    const success = craftTool(tool)
    if (success) {
      showMessage(`✅ 成功制作 ${TOOL_NAMES[tool]}！已放入背包`, 'success')
    } else {
      showMessage(`❌ 材料不足，无法制作 ${TOOL_NAMES[tool]}`, 'error')
    }
  }

  const handleEquip = (tool: ToolType) => {
    const isEquipped = equippedTool === tool
    setEquippedTool(isEquipped ? null : tool)
    showMessage(isEquipped ? `已卸下 ${TOOL_NAMES[tool]}` : `已装备 ${TOOL_NAMES[tool]}`, 'info')
  }

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-72 bg-gray-900/90 rounded-lg p-3 border border-gray-700">
      <h3 className="text-white font-bold mb-3 text-center text-yellow-400">🔨 工具栏</h3>
      
      <div className="space-y-2">
        {TOOLS.map((tool) => {
          const owned = inventory.find((i) => i.type === tool.type)
          const requirements = RECIPES[tool.type]
          const canCraft = hasResources(requirements)
          const isEquipped = equippedTool === tool.type
          const canGather = TOOL_REQUIRED_RESOURCES[tool.type]?.join('、') || '无'
          const isBasic = tool.type === 'torch' || tool.type === 'campfire'

          return (
            <div
              key={tool.type}
              className={`p-3 rounded-lg border transition-all ${
                isEquipped
                  ? 'bg-green-900/50 border-green-500'
                  : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{tool.icon}</div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{tool.name}</div>
                  <div className="text-gray-400 text-xs">{tool.description}</div>
                </div>
                <div className="text-right">
                  {owned ? (
                    <div className="text-green-400 font-bold">x{owned.count}</div>
                  ) : (
                    <div className="text-yellow-500 text-xs">未制作</div>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">
                  {isBasic ? '可采集资源：' : '可采集：'}
                  <span className="text-green-400">
                    {canGather ? canGather.split('、').map(r => RESOURCE_NAMES[r as keyof typeof RESOURCE_NAMES] || r).join('、') : '无'}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">所需材料：</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(requirements).map(([type, count]) => {
                    const item = inventory.find((i) => i.type === type)
                    const hasEnough = item && item.count >= (count || 0)
                    return (
                      <div
                        key={type}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          hasEnough ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        <span>{ITEM_ICONS[type]}</span>
                        <span>{RESOURCE_NAMES[type as keyof typeof RESOURCE_NAMES]}</span>
                        <span className="font-mono">
                          {item?.count || 0}/{count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                {owned ? (
                  <button
                    onClick={() => handleEquip(tool.type)}
                    className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${
                      isEquipped
                        ? 'bg-red-600 hover:bg-red-500 text-white'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {isEquipped ? '卸下' : '装备'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleCraft(tool.type)}
                    disabled={!canCraft}
                    className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${
                      canCraft
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canCraft ? '🔨 制作' : '材料不足'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 p-2 bg-blue-900/30 rounded border border-blue-700/50">
        <div className="text-xs text-blue-300">
          <div className="font-semibold mb-1">💡 采集指南：</div>
          <div>• 燧石、树枝、草 → 徒手采集</div>
          <div>• 木材 → 装备斧头</div>
          <div>• 石头 → 装备稿子</div>
        </div>
      </div>
    </div>
  )
}
