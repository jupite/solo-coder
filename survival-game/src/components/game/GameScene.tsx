'use client'

import { useEffect, useCallback, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { Player } from './Player'
import { Ground } from './Ground'
import { ResourceNode } from './ResourceNode'
import { Building, PlacementPreview } from './Building'
import { MonsterManager } from './Monster'
import { DroppedItem } from './DroppedItem'
import { SpawnGate } from './SpawnGate'
import { useGameStore, generateResources, generateMonsters, TimeOfDay, ResourceType } from '@/store/gameStore'
import * as THREE from 'three'

function PlacementHandler() {
  const { placement, updatePlacementPosition, updatePlacementRotation, confirmPlacement, cancelPlacement, toggleSnapToGrid, playerPosition, isDead } = useGameStore()
  const { raycaster, camera } = useThree()

  useEffect(() => {
    if (isDead && placement.isActive) {
      cancelPlacement()
    }
  }, [isDead, placement.isActive, cancelPlacement])

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

function DayNightCycle() {
  const { gameTime, timeOfDay, updateGameTime, updateTreeGrowth } = useGameStore()
  const directionalLightRef = useRef<THREE.DirectionalLight>(null)
  const ambientLightRef = useRef<THREE.AmbientLight>(null)
  const lastTime = useRef(0)

  const getLightingParams = (time: number, timeOfDay: TimeOfDay) => {
    let sunAngle: number
    let sunIntensity: number
    let ambientIntensity: number
    let fogColor: string
    let fogNear: number
    let fogFar: number

    if (timeOfDay === 'day') {
      const dayProgress = (time - 6) / 11
      sunAngle = Math.PI * 0.15 + dayProgress * Math.PI * 0.7
      sunIntensity = 0.9 + Math.sin(dayProgress * Math.PI) * 0.3
      ambientIntensity = 0.6 + Math.sin(dayProgress * Math.PI) * 0.2
      fogColor = '#87ceeb'
      fogNear = 30
      fogFar = 80
    } else if (timeOfDay === 'dusk') {
      const duskProgress = (time - 17) / 2
      sunAngle = Math.PI * 0.85 + duskProgress * Math.PI * 0.1
      sunIntensity = 0.5 - duskProgress * 0.4
      ambientIntensity = 0.4 - duskProgress * 0.25
      const r = Math.floor(200 - duskProgress * 150)
      const g = Math.floor(120 - duskProgress * 80)
      const b = Math.floor(80 + duskProgress * 20)
      fogColor = `rgb(${r}, ${g}, ${b})`
      fogNear = 25 - duskProgress * 10
      fogFar = 60 - duskProgress * 25
    } else {
      let nightProgress: number
      if (time >= 19) {
        nightProgress = (time - 19) / 5
      } else {
        nightProgress = 0.5 + time / 6
      }
      nightProgress = Math.min(1, Math.max(0, nightProgress))
      sunAngle = Math.PI * 0.95 + nightProgress * Math.PI * 0.1
      sunIntensity = 0.08
      ambientIntensity = 0.12
      fogColor = '#0a0a1a'
      fogNear = 12
      fogFar = 35
    }

    return { sunAngle, sunIntensity, ambientIntensity, fogColor, fogNear, fogFar }
  }

  useFrame((state, delta) => {
    updateGameTime(delta)
    updateTreeGrowth(delta)

    const params = getLightingParams(gameTime, timeOfDay)

    if (directionalLightRef.current) {
      const sunX = Math.cos(params.sunAngle) * 100
      const sunY = Math.sin(params.sunAngle) * 100
      directionalLightRef.current.position.set(sunX, sunY, 50)
      directionalLightRef.current.intensity = params.sunIntensity

      if (timeOfDay === 'night') {
        directionalLightRef.current.color.setRGB(0.4, 0.4, 0.6)
      } else if (timeOfDay === 'dusk') {
        directionalLightRef.current.color.setRGB(1, 0.7, 0.4)
      } else {
        directionalLightRef.current.color.setRGB(1, 1, 1)
      }
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = params.ambientIntensity
      if (timeOfDay === 'night') {
        ambientLightRef.current.color.setRGB(0.2, 0.2, 0.4)
      } else {
        ambientLightRef.current.color.setRGB(1, 1, 1)
      }
    }

    const scene = state.scene
    if (scene.fog) {
      ;(scene.fog as THREE.Fog).color.set(params.fogColor)
      ;(scene.fog as THREE.Fog).near = params.fogNear
      ;(scene.fog as THREE.Fog).far = params.fogFar
    }
  })

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[
          Math.cos(Math.PI * 0.25) * 100,
          Math.sin(Math.PI * 0.25) * 100,
          50,
        ]}
        inclination={0.5}
        azimuth={0.25}
      />
      <ambientLight ref={ambientLightRef} intensity={0.6} />
      <directionalLight
        ref={directionalLightRef}
        position={[50, 100, 50]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
    </>
  )
}

function SceneContent() {
  const { resources, buildings, placement, openContainer, showMessage, droppedItems, pickupDroppedItem, draggedItem, addBuildingFuel, removeFromInventory, setDraggedItem, spawnPoint, isDead } = useGameStore()
  const { raycaster, camera, gl } = useThree()

  useEffect(() => {
    const generatedResources = generateResources(100).filter(r => {
      const dist = Math.sqrt(
        Math.pow(r.position[0] - spawnPoint[0], 2) +
        Math.pow(r.position[2] - spawnPoint[2], 2)
      )
      return dist > 5
    })

    useGameStore.setState({ 
      resources: generatedResources,
      monsters: generateMonsters(100, 5)
    })
  }, [spawnPoint])

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

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      
      if (!draggedItem) return
      
      const canvas = gl.domElement
      const rect = canvas.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      )

      raycaster.setFromCamera(mouse, camera)
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(groundPlane, intersection)
      
      if (intersection) {
        let nearestBuilding: { id: string; dist: number } | null = null
        
        for (const building of buildings) {
          if (building.type !== 'campfire') continue
          
          const dist = Math.sqrt(
            Math.pow(building.position[0] - intersection.x, 2) +
            Math.pow(building.position[2] - intersection.z, 2)
          )
          
          if (dist < 2 && (!nearestBuilding || dist < nearestBuilding.dist)) {
            nearestBuilding = { id: building.id, dist }
          }
        }
        
        if (nearestBuilding && ['wood', 'twig', 'grass'].includes(draggedItem.type)) {
          const state = useGameStore.getState()
          const item = state.inventory[draggedItem.index]
          if (item && item.type === draggedItem.type && item.count >= draggedItem.count) {
            const success = addBuildingFuel(nearestBuilding.id, draggedItem.type as ResourceType, draggedItem.count)
            if (success) {
              removeFromInventory(draggedItem.index, draggedItem.count)
            }
          }
        }
      }
      
      setDraggedItem(null)
    },
    [draggedItem, buildings, raycaster, camera, gl, addBuildingFuel, removeFromInventory, setDraggedItem]
  )

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
  }, [])

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('drop', handleDrop)
    canvas.addEventListener('dragover', handleDragOver)
    
    return () => {
      canvas.removeEventListener('drop', handleDrop)
      canvas.removeEventListener('dragover', handleDragOver)
    }
  }, [gl, handleDrop, handleDragOver])

  return (
    <>
      <DayNightCycle />

      <Ground />
      <Player />

      <SpawnGate position={[spawnPoint[0], 0, spawnPoint[2]]} />

      {resources.map((resource) => (
        <ResourceNode key={resource.id} resource={resource} />
      ))}

      {droppedItems.map((item) => (
        <DroppedItem key={item.id} item={item} onClick={() => !isDead && pickupDroppedItem(item.id)} />
      ))}

      <MonsterManager />

      {buildings.map((building) => (
        <Building key={building.id} building={building} onInteract={!isDead ? handleBuildingInteract : undefined} />
      ))}

      {!isDead && placement.isActive && placement.position && (
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
