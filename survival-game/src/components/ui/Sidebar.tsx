'use client'

import { useState } from 'react'
import {
  useGameStore,
  ToolType,
  BuildingType,
  TOOL_NAMES,
  BUILDING_NAMES,
  TOOL_DESCRIPTIONS,
  BUILDING_DESCRIPTIONS,
  TOOL_RECIPES,
  BUILDING_RECIPES,
  RESOURCE_NAMES,
  ITEM_ICONS,
  TOOL_REQUIRED_RESOURCES,
} from '@/store/gameStore'

type SidebarTab = 'tools' | 'buildings'

interface ItemCardProps {
  icon: string
  name: string
  description: string
  requirements: Partial<Record<string, number>>
  canCraft: boolean
  owned: number
  isEquipped?: boolean
  isPlaced?: boolean
  infiniteBuild: boolean
  onCraft: () => void
  onEquip?: () => void
}

function ItemCard({
  icon,
  name,
  description,
  requirements,
  canCraft,
  owned,
  isEquipped,
  isPlaced,
  infiniteBuild,
  onCraft,
  onEquip,
}: ItemCardProps) {
  return (
    <div
      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
        isEquipped
          ? 'bg-green-900/40 border-green-500'
          : isPlaced
          ? 'bg-blue-900/30 border-blue-500'
          : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm">{name}</div>
          {owned > 0 && (
            <div className="text-green-400 text-xs font-bold">拥有 x{owned}</div>
          )}
        </div>
      </div>
      <div className="text-gray-400 text-xs mb-1.5 leading-relaxed">{description}</div>
      <div className="flex flex-wrap gap-1 mb-2">
        {Object.entries(requirements).map(([type, count]) => {
          const inventory = useGameStore.getState().inventory
          const item = inventory.find((i) => i.type === type)
          const hasEnough = infiniteBuild || (item && item.count >= (count || 0))
          return (
            <div
              key={type}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${
                hasEnough ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
              }`}
            >
              <span>{ITEM_ICONS[type]}</span>
              <span>{RESOURCE_NAMES[type as keyof typeof RESOURCE_NAMES]}</span>
              <span className="font-mono">{item?.count || 0}/{count}</span>
            </div>
          )
        })}
      </div>
      {owned > 0 && onEquip ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEquip()
          }}
          className={`w-full py-1.5 rounded text-xs font-semibold transition-colors ${
            isEquipped
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-green-600 hover:bg-green-500 text-white'
          }`}
        >
          {isEquipped ? '卸下' : '装备'}
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCraft()
          }}
          disabled={!canCraft}
          className={`w-full py-1.5 rounded text-xs font-semibold transition-colors ${
            canCraft
              ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canCraft ? '🔨 制作' : '材料不足'}
        </button>
      )}
    </div>
  )
}

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab | null>(null)
  const {
    inventory,
    equippedTool,
    setEquippedTool,
    craftTool,
    craftBuilding,
    hasResources,
    showMessage,
    infiniteBuild,
    toggleInfiniteBuild,
    buildings,
  } = useGameStore()

  const handleCraftTool = (tool: ToolType) => {
    const success = craftTool(tool)
    if (success) {
      showMessage(`✅ 成功制作 ${TOOL_NAMES[tool]}！已放入背包`, 'success')
    } else {
      showMessage(`❌ 材料不足，无法制作 ${TOOL_NAMES[tool]}`, 'error')
    }
  }

  const handleCraftBuilding = (building: BuildingType) => {
    const success = craftBuilding(building)
    if (success) {
      showMessage(`🔨 请选择${BUILDING_NAMES[building]}的放置位置`, 'info')
    } else {
      showMessage(`❌ 材料不足，无法制作 ${BUILDING_NAMES[building]}`, 'error')
    }
  }

  const handleEquip = (tool: ToolType) => {
    const isEquipped = equippedTool === tool
    setEquippedTool(isEquipped ? null : tool)
    showMessage(isEquipped ? `已卸下 ${TOOL_NAMES[tool]}` : `已装备 ${TOOL_NAMES[tool]}`, 'info')
  }

  const tools: ToolType[] = ['axe', 'pickaxe', 'torch']
  const buildingTypes: BuildingType[] = ['campfire', 'chest']

  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-start">
      <div className="flex flex-col gap-2 p-2">
        <button
          onClick={() => setActiveTab(activeTab === 'tools' ? null : 'tools')}
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all border-2 ${
            activeTab === 'tools'
              ? 'bg-yellow-800/80 border-yellow-500 scale-110'
              : 'bg-gray-900/80 border-gray-600 hover:border-gray-400'
          }`}
          title="工具"
        >
          🪓
        </button>
        <button
          onClick={() => setActiveTab(activeTab === 'buildings' ? null : 'buildings')}
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all border-2 ${
            activeTab === 'buildings'
              ? 'bg-blue-800/80 border-blue-500 scale-110'
              : 'bg-gray-900/80 border-gray-600 hover:border-gray-400'
          }`}
          title="建筑"
        >
          🏠
        </button>
        <div className="w-12 h-px bg-gray-600 my-1" />
        <button
          onClick={toggleInfiniteBuild}
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg transition-all border-2 ${
            infiniteBuild
              ? 'bg-purple-800/80 border-purple-400 scale-110'
              : 'bg-gray-900/80 border-gray-600 hover:border-gray-400'
          }`}
          title={infiniteBuild ? '无限建造：已开启' : '无限建造：已关闭'}
        >
          ♾️
        </button>
      </div>

      {activeTab && (
        <div className="ml-2 w-80 max-h-[70vh] bg-gray-900/95 rounded-lg border border-gray-700 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h3 className="text-white font-bold text-yellow-400">
              {activeTab === 'tools' ? '🪓 工具' : '🏠 建筑'}
            </h3>
            <button
              onClick={() => setActiveTab(null)}
              className="text-gray-400 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeTab === 'tools' &&
              tools.map((tool) => {
                const owned = inventory.find((i) => i.type === tool)?.count || 0
                const requirements = TOOL_RECIPES[tool]
                const canCraft = hasResources(requirements)
                const isEquipped = equippedTool === tool
                const canGatherStr = TOOL_REQUIRED_RESOURCES[tool]
                  ?.map((r) => RESOURCE_NAMES[r])
                  .join('、') || '无'

                return (
                  <ItemCard
                    key={tool}
                    icon={ITEM_ICONS[tool]}
                    name={TOOL_NAMES[tool]}
                    description={`${TOOL_DESCRIPTIONS[tool]}${canGatherStr !== '无' ? `\n可采集：${canGatherStr}` : ''}`}
                    requirements={requirements}
                    canCraft={canCraft}
                    owned={owned}
                    isEquipped={isEquipped}
                    infiniteBuild={infiniteBuild}
                    onCraft={() => handleCraftTool(tool)}
                    onEquip={() => handleEquip(tool)}
                  />
                )
              })}

            {activeTab === 'buildings' &&
              buildingTypes.map((building) => {
                const owned = inventory.find((i) => i.type === building)?.count || 0
                const placedCount = buildings.filter((b) => b.type === building).length
                const requirements = BUILDING_RECIPES[building]
                const canCraft = hasResources(requirements)

                return (
                  <ItemCard
                    key={building}
                    icon={ITEM_ICONS[building]}
                    name={BUILDING_NAMES[building]}
                    description={BUILDING_DESCRIPTIONS[building]}
                    requirements={requirements}
                    canCraft={canCraft}
                    owned={owned}
                    isPlaced={placedCount > 0}
                    infiniteBuild={infiniteBuild}
                    onCraft={() => handleCraftBuilding(building)}
                  />
                )
              })}
          </div>

          {infiniteBuild && (
            <div className="p-2 bg-purple-900/40 border-t border-purple-700/50">
              <div className="text-xs text-purple-300 text-center">♾️ 无限建造模式已开启</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
