'use client'

import dynamic from 'next/dynamic'
import { Toolbar } from '@/components/ui/Toolbar'
import { StatusBar } from '@/components/ui/StatusBar'
import { InventoryBar } from '@/components/ui/InventoryBar'
import { MapButton, MapOverlay } from '@/components/ui/MapButton'
import { ControlsHint } from '@/components/ui/ControlsHint'
import { MessageDisplay } from '@/components/ui/MessageDisplay'

const GameScene = dynamic(() => import('@/components/game/GameScene').then((mod) => mod.GameScene), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden relative bg-black">
      <GameScene />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <Toolbar />
        </div>
        <div className="pointer-events-auto">
          <StatusBar />
        </div>
        <div className="pointer-events-auto">
          <ControlsHint />
        </div>
        <div className="pointer-events-auto">
          <InventoryBar />
        </div>
        <div className="pointer-events-auto">
          <MapButton />
        </div>
        <MessageDisplay />
      </div>
      
      <MapOverlay />
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xl font-bold bg-gray-900/70 px-6 py-2 rounded-lg">
        🏕️ 生存建造 3D
      </div>
    </main>
  )
}
