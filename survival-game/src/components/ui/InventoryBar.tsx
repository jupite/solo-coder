'use client'

import { useGameStore, ResourceType, ToolType, ITEM_ICONS } from '@/store/gameStore'

export function InventoryBar() {
  const { inventory, equippedTool, setEquippedTool } = useGameStore()

  const slots = Array.from({ length: 8 }, (_, i) => inventory[i] || null)

  const isTool = (type: string) => ['axe', 'pickaxe', 'torch', 'campfire'].includes(type)

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
                className="text-3xl hover:scale-110 transition-transform"
                title={isTool(slot.type) ? '点击装备/卸下' : ''}
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
