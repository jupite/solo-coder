'use client'

import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { Player } from './Player'
import { Ground } from './Ground'
import { ResourceNode } from './ResourceNode'
import { useGameStore, generateResources } from '@/store/gameStore'

function SceneContent() {
  const { resources } = useGameStore()

  useEffect(() => {
    useGameStore.setState({ resources: generateResources(100) })
  }, [])

  return (
    <>
      <Sky sunPosition={[100, 50, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      <Ground />
      <Player />
      
      {resources.map((resource) => (
        <ResourceNode key={resource.id} resource={resource} />
      ))}

      <fog attach="fog" args={['#87ceeb', 30, 80]} />
    </>
  )
}

export function GameScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 10, 15], fov: 60 }}
        gl={{ antialias: true }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
