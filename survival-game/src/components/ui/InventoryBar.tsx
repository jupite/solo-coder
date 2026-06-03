'use client'

import { useGameStore, ResourceType, ToolType } from '@/store/gameStore'

const ITEM_ICONS: Record<string, string> = {
  wood: '🪵',
  stone: '🪨',
  flint: '🔥',
  twig: '🌿',
  grass: '🌱',
  axe: '🪓',
  pickaxe: '⛏️',
  torch: '🔦',
  campfire: '🔥',
}

const ITEM_NAMES: Record<string, string> = {
  wood: '木材',
  stone: '石头',
  flint: '燧石',
  twig: '树枝',
  grass: '草',
  axe: '斧头',
  pickaxe: '稿子',
  torch: '火把',
  campfire: '火堆',
}

export function InventoryBar() {
  const { inventory, equippedTool, setEquippedTool } = useGameStore()

  const slots = Array.from({ length: 8 }, (_, i) => inventory[i] || null)

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      {slots.map((slot, index) => (
        <div
          key={index}
          className={`w-14 h-14 bg-gray-900/80 rounded-lg flex items-center justify-center relative border-2 ${
            slot && equippedTool === slot.type
              ? 'border-green-500'
              : 'border-gray-700'
          }`}
        >
          {slot && (
            <>
              <button
                onClick={() => {
                  if (['axe', 'pickaxe', 'torch', 'campfire'].includes(slot.type)) {
                    setEquippedTool(equippedTool === slot.type ? null : slot.type as ToolType)
                  }
                }}
                className="text-2xl hover:scale-110 transition-transform"
                title={ITEM_NAMES[slot.type] || slot.type}
              >
                {ITEM_ICONS[slot.type] || '📦'}
              </button>
              <span className="absolute bottom-1 right-1 text-xs text-white bg-black/70 px-1.5 py-0.5 rounded font-bold">
                {slot.count}
              </span>
            </>
          )}
          <span className="absolute top-0.5 left-1.5 text-xs text-gray-500">
            {index + 1}
          </span>
        </div>
      ))}
    </div>
  )
}
