'use client'

import { useEffect, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { Player } from './Player'
import { Ground } from './Ground'
import { ResourceNode } from './ResourceNode'
import { Building, PlacementPreview } from './Building'
import { useGameStore, generateResources } from '@/store/gameStore'
import * as THREE from 'three'

function PlacementHandler() {
  const { placement, updatePlacementPosition, updatePlacementRotation, confirmPlacement, cancelPlacement, toggleSnapToGrid, playerPosition } = useGameStore()
  const { raycaster, camera } = useThree()

  const handlePointerMove = useCallback(
    (event: MouseEvent) => {
      if (!placement.isActive) return

      const rect = (event.target as HTMLElement).getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      )

      raycaster.setFromCamera(mouse, camera)
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(groundPlane, intersection)

      if (intersection) {
        const dist = Math.sqrt(
          Math.pow(intersection.x - playerPosition[0], 2) +
          Math.pow(intersection.z - playerPosition[2], 2)
        )
        if (dist <= 8) {
          updatePlacementPosition([intersection.x, 0, intersection.z])
        }
      }
    },
    [placement.isActive, raycaster, camera, updatePlacementPosition, playerPosition]
  )

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!placement.isActive) return
      if (event.button !== 0) return

      confirmPlacement()
    },
    [placement.isActive, confirmPlacement]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!placement.isActive) return

      if (event.key === 'r' || event.key === 'R') {
        const newRotation = (placement.rotation + Math.PI / 4) % (Math.PI * 2)
        updatePlacementRotation(newRotation)
      }

      if (event.key === 'g' || event.key === 'G') {
        toggleSnapToGrid()
      }

      if (event.key === 'Escape') {
        cancelPlacement()
      }
    },
    [placement.isActive, placement.rotation, updatePlacementRotation, cancelPlacement, toggleSnapToGrid]
  )

  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    if (placement.isActive) {
      canvas.addEventListener('pointermove', handlePointerMove)
      canvas.addEventListener('click', handleClick)
    }

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [placement.isActive, handlePointerMove, handleClick])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return null
}

function SceneContent() {
  const { resources, buildings, placement, openContainer, showMessage } = useGameStore()

  useEffect(() => {
    useGameStore.setState({ resources: generateResources(100) })
  }, [])

  const handleBuildingInteract = useCallback(
    (id: string) => {
      const building = buildings.find((b) => b.id === id)
      if (!building) return

      if (building.type === 'chest') {
        openContainer(id)
        showMessage('📦 打开了箱子', 'info')
      } else if (building.type === 'campfire') {
        showMessage('🔥 火堆正在燃烧', 'info')
      }
    },
    [buildings, openContainer, showMessage]
  )

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

      {buildings.map((building) => (
        <Building key={building.id} building={building} onInteract={handleBuildingInteract} />
      ))}

      {placement.isActive && placement.position && (
        <PlacementPreview
          type={placement.buildingType!}
          position={placement.position}
          rotation={placement.rotation}
          isValid={placement.isValid}
          snapToGrid={placement.snapToGrid}
        />
      )}

      <PlacementHandler />

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
