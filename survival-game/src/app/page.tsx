'use client'

import dynamic from 'next/dynamic'
import { Sidebar } from '@/components/ui/Sidebar'
import { StatusBar } from '@/components/ui/StatusBar'
import { InventoryBar, ContainerPanel } from '@/components/ui/InventoryBar'
import { MapButton, MapOverlay } from '@/components/ui/MapButton'
import { ControlsHint } from '@/components/ui/ControlsHint'
import { MessageDisplay } from '@/components/ui/MessageDisplay'
import { PlacementHint } from '@/components/ui/PlacementHint'
import { GameClock } from '@/components/ui/GameClock'
import { DevTools } from '@/components/ui/DevTools'

const GameScene = dynamic(() => import('@/components/game/GameScene').then((mod) => mod.GameScene), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden relative bg-black">
      <GameScene />

      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <Sidebar />
        </div>
        <div className="pointer-events-auto">
          <StatusBar />
        </div>
        <div className="pointer-events-auto">
          <GameClock />
        </div>
        <div className="pointer-events-auto">
          <DevTools />
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
        <PlacementHint />
      </div>

      <MapOverlay />
      <ContainerPanel />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xl font-bold bg-gray-900/70 px-6 py-2 rounded-lg pointer-events-none">
        🏕️ 生存建造 3D
      </div>
    </main>
  )
}
