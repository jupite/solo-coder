'use client'

import { useState, useRef } from 'react'
import { useGameStore, ResourceType, ToolType, ITEM_ICONS, RESOURCE_NAMES } from '@/store/gameStore'

export function InventoryBar() {
  const { inventory, equippedTool, setEquippedTool } = useGameStore()

  const slots = Array.from({ length: 8 }, (_, i) => inventory[i] || null)

  const isTool = (type: string) => ['axe', 'pickaxe', 'torch'].includes(type)

  const handleDragStart = (e: React.DragEvent, type: string, count: number) => {
    e.dataTransfer.setData('itemType', type)
    e.dataTransfer.setData('itemCount', count.toString())
    e.dataTransfer.setData('source', 'inventory')
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      {slots.map((slot, index) => (
        <div
          key={index}
          className={`w-16 h-16 bg-gray-900/80 rounded-lg flex items-center justify-center relative border-2 transition-all ${
            slot && equippedTool === slot.type
              ? 'border-green-500 bg-green-900/30'
              : 'border-gray-700 hover:border-gray-500'
          }`}
        >
          {slot && (
            <>
              <button
                onClick={() => {
                  if (isTool(slot.type)) {
                    setEquippedTool(equippedTool === slot.type ? null : slot.type as ToolType)
                  }
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, slot.type, slot.count)}
                className="text-3xl hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"
                title={isTool(slot.type) ? '点击装备/卸下 · 可拖动到箱子' : '可拖动到箱子'}
              >
                {ITEM_ICONS[slot.type] || '📦'}
              </button>
              <span className="absolute bottom-1 right-1 text-xs text-white bg-black/70 px-1.5 py-0.5 rounded font-bold">
                {slot.count}
              </span>
            </>
          )}
          <span className="absolute top-0.5 left-1.5 text-xs text-gray-500 font-mono">
            {index + 1}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ContainerPanel() {
  const { openedContainerId, buildings, openContainer, moveItemToContainer, moveItemFromContainer, inventory } = useGameStore()
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  if (!openedContainerId) return null

  const building = buildings.find((b) => b.id === openedContainerId)
  if (!building) return null

  const containerSlots = Array.from({ length: 8 }, (_, i) => building.inventory[i] || null)

  const handleContainerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleContainerDragLeave = () => {
    setDragOverSlot(null)
  }

  const handleContainerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverSlot(null)

    const itemType = e.dataTransfer.getData('itemType')
    const source = e.dataTransfer.getData('source')

    if (!itemType) return

    if (source === 'inventory') {
      moveItemToContainer(openedContainerId, itemType as ResourceType | ToolType, 1)
    }
  }

  const handleInventoryDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleInventoryDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    const itemType = e.dataTransfer.getData('itemType')
    const source = e.dataTransfer.getData('source')

    if (!itemType || source !== 'container') return

    moveItemFromContainer(openedContainerId, itemType as ResourceType | ToolType, 1)
  }

  const handleContainerItemDragStart = (e: React.DragEvent, type: string, count: number) => {
    e.dataTransfer.setData('itemType', type)
    e.dataTransfer.setData('itemCount', count.toString())
    e.dataTransfer.setData('source', 'container')
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => openContainer(null)}>
      <div
        ref={panelRef}
        className="bg-gray-900/95 rounded-xl p-4 border border-gray-700 shadow-2xl w-[520px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">📦 箱子</h3>
          <button
            onClick={() => openContainer(null)}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-2">箱子内容</div>
          <div
            className="grid grid-cols-8 gap-2 min-h-[72px] bg-gray-800/50 p-3 rounded-lg border border-dashed border-gray-600"
            onDragOver={handleContainerDragOver}
            onDragLeave={handleContainerDragLeave}
            onDrop={handleContainerDrop}
          >
            {containerSlots.map((slot, index) => (
              <div
                key={index}
                className={`w-14 h-14 bg-gray-700/50 rounded-lg flex items-center justify-center relative border-2 transition-all ${
                  dragOverSlot === index
                    ? 'border-blue-400 bg-blue-900/30'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
              >
                {slot && (
                  <>
                    <div
                      draggable
                      onDragStart={(e) => handleContainerItemDragStart(e, slot.type, slot.count)}
                      className="text-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                      title={`${RESOURCE_NAMES[slot.type as keyof typeof RESOURCE_NAMES] || slot.type} - 拖回背包`}
                    >
                      {ITEM_ICONS[slot.type] || '📦'}
                    </div>
                    <span className="absolute bottom-0 right-0.5 text-xs text-white bg-black/70 px-1 py-0.5 rounded font-bold">
                      {slot.count}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center my-2">
          <div className="text-gray-500 text-xs">⇅ 拖动物品在背包和箱子之间移动 ⇅</div>
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-2">你的背包</div>
          <div
            className="grid grid-cols-8 gap-2 bg-gray-800/50 p-3 rounded-lg border border-dashed border-gray-600"
            onDragOver={handleInventoryDragOver}
            onDrop={handleInventoryDrop}
          >
            {Array.from({ length: 8 }, (_, i) => inventory[i] || null).map((slot, index) => (
              <div
                key={index}
                className="w-14 h-14 bg-gray-700/50 rounded-lg flex items-center justify-center relative border-2 border-gray-600"
              >
                {slot && (
                  <>
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('itemType', slot.type)
                        e.dataTransfer.setData('itemCount', slot.count.toString())
                        e.dataTransfer.setData('source', 'inventory')
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      className="text-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                      title={`${RESOURCE_NAMES[slot.type as keyof typeof RESOURCE_NAMES] || slot.type} - 拖到箱子`}
                    >
                      {ITEM_ICONS[slot.type] || '📦'}
                    </div>
                    <span className="absolute bottom-0 right-0.5 text-xs text-white bg-black/70 px-1 py-0.5 rounded font-bold">
                      {slot.count}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 text-center">
          提示：从背包拖动物品到箱子放入，从箱子拖回背包取出
        </div>
      </div>
    </div>
  )
}
