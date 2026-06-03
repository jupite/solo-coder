'use client'

import { useGameStore, RECIPES, ToolType } from '@/store/gameStore'

const TOOLS: { type: ToolType; icon: string; name: string }[] = [
  { type: 'axe', icon: '🪓', name: '斧头' },
  { type: 'pickaxe', icon: '⛏️', name: '稿子' },
  { type: 'torch', icon: '🔦', name: '火把' },
  { type: 'campfire', icon: '🔥', name: '火堆' },
]

export function Toolbar() {
  const { inventory, equippedTool, setEquippedTool, craftTool, hasResources } = useGameStore()

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-16 bg-gray-900/80 rounded-lg p-2 flex flex-col gap-2">
      {TOOLS.map((tool) => {
        const owned = inventory.find((i) => i.type === tool.type)
        const canCraft = hasResources(RECIPES[tool.type])
        const isEquipped = equippedTool === tool.type

        return (
          <button
            key={tool.type}
            onClick={() => owned ? setEquippedTool(isEquipped ? null : tool.type) : craftTool(tool.type)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
              isEquipped
                ? 'bg-green-600 ring-2 ring-green-400'
                : owned
                ? 'bg-gray-700 hover:bg-gray-600'
                : canCraft
                ? 'bg-yellow-700/50 hover:bg-yellow-600/50'
                : 'bg-gray-800 opacity-50'
            }`}
            title={`${tool.name}${owned ? ` (${owned.count})` : canCraft ? ' - 点击制作' : ' - 材料不足'}`}
          >
            {tool.icon}
            {owned && (
              <span className="absolute bottom-1 right-1 text-xs text-white bg-black/50 px-1 rounded">
                {owned.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
