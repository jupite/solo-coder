'use client'

import { useGameStore } from '@/store/gameStore'

export function MessageDisplay() {
  const { message } = useGameStore()

  if (!message) return null

  return (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className={`px-6 py-3 rounded-lg border-2 text-lg font-bold shadow-lg transition-all duration-300 ${
        message.type === 'success' 
          ? 'bg-green-900/90 border-green-500 text-green-300'
          : message.type === 'error'
          ? 'bg-red-900/90 border-red-500 text-red-300'
          : 'bg-blue-900/90 border-blue-500 text-blue-300'
      }`}>
        {message.text}
      </div>
    </div>
  )
}
