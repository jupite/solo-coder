'use client'

import { useState, useRef } from 'react'
import {
  useGameStore,
  ResourceType,
  ToolType,
  EquipmentType,
  ITEM_ICONS,
  RESOURCE_NAMES,
  TOOL_NAMES,
  EQUIPMENT_NAMES,
  EQUIPMENT_STATS,
  TOOL_STATS,
  EquipSlotType,
  InventoryItem,
} from '@/store/gameStore'

function getItemName(item: InventoryItem): string {
  const type = item.type
  if (type in RESOURCE_NAMES) return RESOURCE_NAMES[type as ResourceType]
  if (type in TOOL_NAMES) return TOOL_NAMES[type as ToolType]
  if (type in EQUIPMENT_NAMES) return EQUIPMENT_NAMES[type as EquipmentType]
  return type
}

function isEquipment(item: InventoryItem | null): item is InventoryItem & { type: EquipmentType } {
  if (!item) return false
  return ['helmet', 'armor', 'spear', 'backpack'].includes(item.type)
}

function isTool(item: InventoryItem | null): item is InventoryItem & { type: ToolType } {
  if (!item) return false
  return ['axe', 'pickaxe', 'torch'].includes(item.type)
}

function getEquipSlotForItem(item: InventoryItem): EquipSlotType | null {
  if (isEquipment(item)) {
    return EQUIPMENT_STATS[item.type].equipSlot
  }
  if (isTool(item)) {
    return TOOL_STATS[item.type].equipSlot
  }
  return null
}

export function InventoryBar() {
  const { inventory, equipment, moveInventoryItem, equipItem, unequipItem, getInventorySize, hasBackpack, setDraggedItem } = useGameStore()
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)
  const [dragOverEquipSlot, setDragOverEquipSlot] = useState<EquipSlotType | null>(null)
  const [localDraggedItem, setLocalDraggedItem] = useState<{ source: string; index?: number; slot?: EquipSlotType } | null>(null)

  const equipSlots: { slot: EquipSlotType; label: string; icon: string }[] = [
    { slot: 'head', label: '头部', icon: '👤' },
    { slot: 'body', label: '身体', icon: '🎽' },
    { slot: 'hand', label: '手持', icon: '✋' },
  ]

  const handleDragStart = (e: React.DragEvent, source: string, index?: number, slot?: EquipSlotType) => {
    e.dataTransfer.setData('source', source)
    if (index !== undefined) {
      e.dataTransfer.setData('index', index.toString())
      const item = inventory[index]
      if (item) {
        const dragData = { index, type: item.type, count: 1 }
        e.dataTransfer.setData('inventory-item', JSON.stringify(dragData))
        setDraggedItem(dragData)
      }
    }
    if (slot) e.dataTransfer.setData('slot', slot)
    e.dataTransfer.effectAllowed = 'move'
    setLocalDraggedItem({ source, index, slot })
  }

  const handleDragEnd = () => {
    setDragOverSlot(null)
    setDragOverEquipSlot(null)
    setLocalDraggedItem(null)
    setDraggedItem(null)
  }

  const handleInventoryDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverSlot(slotIndex)
  }

  const handleInventoryDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    setDragOverSlot(null)

    const source = e.dataTransfer.getData('source')
    const sourceIndexStr = e.dataTransfer.getData('index')
    const sourceSlot = e.dataTransfer.getData('slot') as EquipSlotType

    if (source === 'inventory' && sourceIndexStr) {
      const sourceIndex = parseInt(sourceIndexStr)
      if (sourceIndex !== targetIndex) {
        moveInventoryItem(sourceIndex, targetIndex)
      }
    } else if (source === 'equipment' && sourceSlot) {
      const item = equipment[sourceSlot]
      if (item && !inventory[targetIndex]) {
        unequipItem(sourceSlot)
      }
    }

    setDraggedItem(null)
  }

  const handleEquipmentDragOver = (e: React.DragEvent, slot: EquipSlotType) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverEquipSlot(slot)
  }

  const handleEquipmentDrop = (e: React.DragEvent, targetSlot: EquipSlotType) => {
    e.preventDefault()
    setDragOverEquipSlot(null)

    const source = e.dataTransfer.getData('source')
    const sourceIndexStr = e.dataTransfer.getData('index')

    if (source === 'inventory' && sourceIndexStr) {
      const sourceIndex = parseInt(sourceIndexStr)
      const item = inventory[sourceIndex]
      if (item) {
        const itemSlot = getEquipSlotForItem(item)
        if (itemSlot === targetSlot) {
          equipItem(sourceIndex, targetSlot)
        }
      }
    }

    setDraggedItem(null)
  }

  const renderDurabilityBar = (item: InventoryItem) => {
    if (!item.durability || !item.maxDurability) return null
    const percentage = (item.durability / item.maxDurability) * 100
    const color = percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
    
    return (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b">
        <div className={`h-full ${color} rounded-b`} style={{ width: `${percentage}%` }} />
      </div>
    )
  }

  const renderInventorySlot = (index: number, isBackpack: boolean = false) => {
    const item = inventory[index] || null
    return (
      <div
        key={index}
        onDragOver={(e) => handleInventoryDragOver(e, index)}
        onDragLeave={() => setDragOverSlot(null)}
        onDrop={(e) => handleInventoryDrop(e, index)}
        className={`w-12 h-12 rounded-lg flex items-center justify-center relative border-2 transition-all cursor-pointer ${
          isBackpack
            ? 'bg-indigo-900/50 border-indigo-600 hover:border-indigo-400'
            : dragOverSlot === index
            ? 'bg-blue-900/30 border-blue-400'
            : 'bg-gray-900/80 border-gray-700 hover:border-gray-500'
        }`}
        title={item ? getItemName(item) : isBackpack ? '背包扩展格' : ''}
      >
        {item && (
          <>
            <div
              draggable
              onDragStart={(e) => {
                e.stopPropagation()
                handleDragStart(e, 'inventory', index)
              }}
              onDragEnd={handleDragEnd}
              className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform relative"
            >
              <span className="text-xl">{ITEM_ICONS[item.type] || '📦'}</span>
            </div>
            {!isEquipment(item) && !isTool(item) && (
              <span className="absolute bottom-0.5 right-1 text-[10px] text-white bg-black/70 px-1 rounded font-bold">
                {item.count}
              </span>
            )}
            {renderDurabilityBar(item)}
          </>
        )}
        <span className="absolute top-0.5 left-1 text-[10px] text-gray-500 font-mono">
          {index + 1}
        </span>
      </div>
    )
  }

  const renderBaseInventory = () => {
    const rows = []
    for (let row = 0; row < 3; row++) {
      const slots = []
      for (let col = 0; col < 5; col++) {
        const index = row * 5 + col
        slots.push(renderInventorySlot(index, false))
      }
      rows.push(
        <div key={`base-row-${row}`} className="grid grid-cols-5 gap-2">
          {slots}
        </div>
      )
    }
    return rows
  }

  const renderBackpackInventory = () => {
    if (!hasBackpack) return null
    const rows = []
    for (let row = 0; row < 3; row++) {
      const slots = []
      for (let col = 0; col < 3; col++) {
        const index = 15 + row * 3 + col
        slots.push(renderInventorySlot(index, true))
      }
      rows.push(
        <div key={`backpack-row-${row}`} className="grid grid-cols-3 gap-2">
          {slots}
        </div>
      )
    }
    return rows
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-4">
      <div className="flex flex-col gap-2">
        {equipSlots.map(({ slot, label, icon }) => {
          const item = equipment[slot]
          return (
            <div
              key={slot}
              onDragOver={(e) => handleEquipmentDragOver(e, slot)}
              onDragLeave={() => setDragOverEquipSlot(null)}
              onDrop={(e) => handleEquipmentDrop(e, slot)}
              className={`w-14 h-14 bg-gray-900/80 rounded-lg flex items-center justify-center relative border-2 transition-all ${
                item
                  ? 'border-purple-500 bg-purple-900/30'
                  : dragOverEquipSlot === slot
                  ? 'border-blue-400 bg-blue-900/30'
                  : 'border-gray-700'
              }`}
              title={label}
            >
              {item ? (
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'equipment', undefined, slot)}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform relative"
                >
                  <span className="text-2xl">{ITEM_ICONS[item.type] || icon}</span>
                  {renderDurabilityBar(item)}
                </div>
              ) : (
                <span className="text-xl text-gray-600">{icon}</span>
              )}
              <span className="absolute top-0.5 left-1 text-[10px] text-gray-500">{label}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-2">
          {renderBaseInventory()}
        </div>

        {hasBackpack && (
          <div className="flex flex-col gap-2">
            {renderBackpackInventory()}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-end">
        <div className="text-center text-xs text-gray-400">
          拖拽装备到左侧栏位 · 拖拽物品排序
          {hasBackpack && <div className="text-indigo-400 mt-1">🎒 背包扩展中 (+9格)</div>}
        </div>
      </div>
    </div>
  )
}

export function ContainerPanel() {
  const { openedContainerId, buildings, openContainer, moveItemToContainer, moveItemFromContainer, inventory, getInventorySize } = useGameStore()
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  if (!openedContainerId) return null

  const building = buildings.find((b) => b.id === openedContainerId)
  if (!building) return null

  const containerSlots = Array.from({ length: 8 }, (_, i) => building.inventory[i] || null)
  const inventorySize = getInventorySize()

  const handleContainerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleContainerDragLeave = () => {
    setDragOverSlot(null)
  }

  const handleContainerDrop = (e: React.DragEvent<HTMLDivElement>, containerIndex: number) => {
    e.preventDefault()
    setDragOverSlot(null)

    const source = e.dataTransfer.getData('source')
    const sourceIndexStr = e.dataTransfer.getData('index')

    if (source === 'inventory' && sourceIndexStr) {
      const sourceIndex = parseInt(sourceIndexStr)
      moveItemToContainer(openedContainerId, sourceIndex, 1)
    }
  }

  const handleInventoryDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleInventoryDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    const source = e.dataTransfer.getData('source')
    const containerIndexStr = e.dataTransfer.getData('containerIndex')

    if (source === 'container' && containerIndexStr) {
      const containerIndex = parseInt(containerIndexStr)
      moveItemFromContainer(openedContainerId, containerIndex, 1)
    }
  }

  const handleContainerItemDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('source', 'container')
    e.dataTransfer.setData('containerIndex', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const getItemNameLocal = (item: InventoryItem): string => {
    const type = item.type
    if (type in RESOURCE_NAMES) return RESOURCE_NAMES[type as ResourceType]
    if (type in TOOL_NAMES) return TOOL_NAMES[type as ToolType]
    if (type in EQUIPMENT_NAMES) return EQUIPMENT_NAMES[type as EquipmentType]
    return type
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => openContainer(null)}>
      <div
        ref={panelRef}
        className="bg-gray-900/95 rounded-xl p-4 border border-gray-700 shadow-2xl w-[700px]"
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
          >
            {containerSlots.map((slot, index) => (
              <div
                key={index}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverSlot(index)
                }}
                onDragLeave={() => setDragOverSlot(null)}
                onDrop={(e) => handleContainerDrop(e, index)}
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
                      onDragStart={(e) => handleContainerItemDragStart(e, index)}
                      className="text-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                      title={`${getItemNameLocal(slot)} - 拖回背包`}
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
            className="flex gap-4 bg-gray-800/50 p-3 rounded-lg border border-dashed border-gray-600"
            onDragOver={handleInventoryDragOver}
            onDrop={handleInventoryDrop}
          >
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 15 }, (_, i) => inventory[i] || null).map((slot, index) => {
                return (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-lg flex items-center justify-center relative border-2 bg-gray-700/50 border-gray-600"
                  >
                    {slot && (
                      <>
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('source', 'inventory')
                            e.dataTransfer.setData('index', index.toString())
                            e.dataTransfer.effectAllowed = 'move'
                          }}
                          className="text-xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                          title={`${getItemNameLocal(slot)} - 拖到箱子`}
                        >
                          {ITEM_ICONS[slot.type] || '📦'}
                        </div>
                        <span className="absolute bottom-0 right-0.5 text-[10px] text-white bg-black/70 px-1 rounded font-bold">
                          {slot.count}
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            {inventorySize > 15 && (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }, (_, i) => inventory[15 + i] || null).map((slot, index) => {
                  return (
                    <div
                      key={`backpack-${index}`}
                      className="w-12 h-12 rounded-lg flex items-center justify-center relative border-2 bg-indigo-900/30 border-indigo-700/50"
                    >
                      {slot && (
                        <>
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('source', 'inventory')
                              e.dataTransfer.setData('index', (15 + index).toString())
                              e.dataTransfer.effectAllowed = 'move'
                            }}
                            className="text-xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                            title={`${getItemNameLocal(slot)} - 拖到箱子`}
                          >
                            {ITEM_ICONS[slot.type] || '📦'}
                          </div>
                          <span className="absolute bottom-0 right-0.5 text-[10px] text-white bg-black/70 px-1 rounded font-bold">
                            {slot.count}
                          </span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 text-center">
          提示：从背包拖动物品到箱子放入，从箱子拖回背包取出
        </div>
      </div>
    </div>
  )
}
