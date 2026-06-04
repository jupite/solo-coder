'use client'

import { useState, useMemo } from 'react'
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

const ITEMS_PER_PAGE = 8

interface CraftableItem {
  type: string
  icon: string
  name: string
  description: string
  requirements: Partial<Record<string, number>>
  canGatherStr?: string
}

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const {
    inventory,
    craftTool,
    craftBuilding,
    hasResources,
    showMessage,
    infiniteBuild,
  } = useGameStore()

  const tools: CraftableItem[] = useMemo(() => [
    { type: 'axe', icon: ITEM_ICONS.axe, name: TOOL_NAMES.axe, description: TOOL_DESCRIPTIONS.axe, requirements: TOOL_RECIPES.axe, canGatherStr: TOOL_REQUIRED_RESOURCES.axe?.map((r) => RESOURCE_NAMES[r]).join('、') },
    { type: 'pickaxe', icon: ITEM_ICONS.pickaxe, name: TOOL_NAMES.pickaxe, description: TOOL_DESCRIPTIONS.pickaxe, requirements: TOOL_RECIPES.pickaxe, canGatherStr: TOOL_REQUIRED_RESOURCES.pickaxe?.map((r) => RESOURCE_NAMES[r]).join('、') },
    { type: 'torch', icon: ITEM_ICONS.torch, name: TOOL_NAMES.torch, description: TOOL_DESCRIPTIONS.torch, requirements: TOOL_RECIPES.torch },
  ], [])

  const buildingItems: CraftableItem[] = useMemo(() => [
    { type: 'campfire', icon: ITEM_ICONS.campfire, name: BUILDING_NAMES.campfire, description: BUILDING_DESCRIPTIONS.campfire, requirements: BUILDING_RECIPES.campfire },
    { type: 'chest', icon: ITEM_ICONS.chest, name: BUILDING_NAMES.chest, description: BUILDING_DESCRIPTIONS.chest, requirements: BUILDING_RECIPES.chest },
  ], [])

  const currentItems = activeTab === 'tools' ? tools : activeTab === 'buildings' ? buildingItems : []
  const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE)
  const pageItems = currentItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  const selected = currentItems.find((item) => item.type === selectedItem)

  const handleTabClick = (tab: SidebarTab) => {
    if (activeTab === tab) {
      setActiveTab(null)
      setSelectedItem(null)
      setCurrentPage(0)
    } else {
      setActiveTab(tab)
      setCurrentPage(0)
      const items = tab === 'tools' ? tools : buildingItems
      setSelectedItem(items[0]?.type || null)
    }
  }

  const handleCraft = () => {
    if (!selected) return
    if (activeTab === 'tools') {
      const success = craftTool(selected.type as ToolType)
      if (success) {
        showMessage(`✅ 成功制作 ${selected.name}！已放入背包`, 'success')
      } else {
        showMessage(`❌ 材料不足，无法制作 ${selected.name}`, 'error')
      }
    } else if (activeTab === 'buildings') {
      const success = craftBuilding(selected.type as BuildingType)
      if (success) {
        showMessage(`🔨 请选择${selected.name}的放置位置`, 'info')
      } else {
        showMessage(`❌ 材料不足，无法制作 ${selected.name}`, 'error')
      }
    }
  }

  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-stretch">
      {activeTab && (
        <div className="w-72 bg-gray-900/95 border border-gray-700 border-l-0 rounded-l-lg shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
            <h3 className="text-white font-bold text-sm">
              {activeTab === 'tools' ? '🪓 工具制作' : '🏠 建筑制作'}
            </h3>
          </div>

          <div className="p-2 border-b border-gray-700">
            <div className="grid grid-cols-4 gap-1.5">
              {pageItems.map((item) => {
                const owned = inventory.find((i) => i.type === item.type)?.count || 0
                const canCraft = hasResources(item.requirements)
                return (
                  <button
                    key={item.type}
                    onClick={() => setSelectedItem(item.type)}
                    className={`relative w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all border-2 ${
                      selectedItem === item.type
                        ? 'bg-yellow-900/40 border-yellow-500 scale-105'
                        : 'bg-gray-800/50 border-gray-600 hover:border-gray-400'
                    }`}
                    title={item.name}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-300 text-[10px] mt-0.5 truncate w-full text-center px-0.5">{item.name}</span>
                    {owned > 0 && (
                      <span className="absolute top-0.5 right-0.5 text-[10px] text-green-400 font-bold bg-black/60 px-1 rounded">
                        x{owned}
                      </span>
                    )}
                    {!canCraft && owned === 0 && (
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                )
              })}
              {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - pageItems.length) }, (_, i) => (
                <div key={`empty-${i}`} className="w-full aspect-square rounded-lg border-2 border-gray-700/30" />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className={`text-xs px-2 py-1 rounded ${currentPage === 0 ? 'text-gray-600' : 'text-gray-300 hover:text-white bg-gray-700'}`}
                >
                  ‹
                </button>
                <span className="text-xs text-gray-400">{currentPage + 1}/{totalPages}</span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className={`text-xs px-2 py-1 rounded ${currentPage >= totalPages - 1 ? 'text-gray-600' : 'text-gray-300 hover:text-white bg-gray-700'}`}
                >
                  ›
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-3">
            {selected ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-4xl w-14 h-14 bg-gray-800/60 rounded-lg flex items-center justify-center border border-gray-600">
                    {selected.icon}
                  </div>
                  <div>
                    <div className="text-white font-bold text-base">{selected.name}</div>
                    {selected.canGatherStr && (
                      <div className="text-xs text-green-400">可采集：{selected.canGatherStr}</div>
                    )}
                  </div>
                </div>

                <div className="text-gray-400 text-xs mb-3 leading-relaxed">{selected.description}</div>

                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">所需材料：</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(selected.requirements).map(([type, count]) => {
                      const item = inventory.find((i) => i.type === type)
                      const hasEnough = infiniteBuild || (item && item.count >= (count || 0))
                      return (
                        <div
                          key={type}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
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
                </div>

                <button
                  onClick={handleCraft}
                  disabled={!hasResources(selected.requirements)}
                  className={`w-full py-2 rounded text-sm font-bold transition-colors ${
                    hasResources(selected.requirements)
                      ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {hasResources(selected.requirements) ? '🔨 制作' : '材料不足'}
                </button>
              </>
            ) : (
              <div className="text-gray-500 text-xs text-center py-4">请选择一个项目</div>
            )}
          </div>

          {infiniteBuild && (
            <div className="px-3 py-1.5 bg-purple-900/40 border-t border-purple-700/50">
              <div className="text-xs text-purple-300 text-center">♾️ 无限建造模式</div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 p-2 bg-gray-900/80 rounded-r-lg border border-gray-700 border-l-0">
        <button
          onClick={() => handleTabClick('tools')}
          className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl transition-all border-2 ${
            activeTab === 'tools'
              ? 'bg-yellow-800/80 border-yellow-500'
              : 'bg-gray-800/60 border-gray-600 hover:border-gray-400'
          }`}
          title="工具"
        >
          🪓
        </button>
        <button
          onClick={() => handleTabClick('buildings')}
          className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl transition-all border-2 ${
            activeTab === 'buildings'
              ? 'bg-blue-800/80 border-blue-500'
              : 'bg-gray-800/60 border-gray-600 hover:border-gray-400'
          }`}
          title="建筑"
        >
          🏠
        </button>
      </div>
    </div>
  )
}
