'use client'

import { useGameStore, ITEM_ICONS, TOOL_NAMES } from '@/store/gameStore'

function StatBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-300 mb-1">
          <span>{label}</span>
          <span>{Math.round(value)}/100</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-300`}
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function StatusBar() {
  const { playerHealth, playerHunger, playerStamina, equippedTool } = useGameStore()

  return (
    <div className="absolute right-4 top-4 w-52 bg-gray-900/90 rounded-lg p-4 space-y-3 border border-gray-700">
      <StatBar label="生命" value={playerHealth} color="bg-red-500" icon="❤️" />
      <StatBar label="饥饿" value={playerHunger} color="bg-yellow-500" icon="🍖" />
      <StatBar label="体力" value={playerStamina} color="bg-green-500" icon="⚡" />
      
      <div className="pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">当前装备</div>
        <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-2">
          <span className="text-3xl">
            {equippedTool ? ITEM_ICONS[equippedTool] : '✋'}
          </span>
          <div>
            <div className="text-sm text-white font-medium">
              {equippedTool ? TOOL_NAMES[equippedTool] : '空手'}
            </div>
            <div className="text-xs text-gray-400">
              {equippedTool === 'axe' ? '可采集：木材' : 
               equippedTool === 'pickaxe' ? '可采集：石头' :
               equippedTool === 'torch' ? '可采集：无（照明）' :
               equippedTool === 'campfire' ? '可采集：无' :
               '可采集：燧石、树枝、草'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
