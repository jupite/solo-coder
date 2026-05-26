import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { Horse } from './Horse'
import { Arrow } from './Arrow'
import { Target } from './Target'
import { MAX_ARROW_SPEED, MIN_ARROW_SPEED, GRAVITY } from '../utils/physics'

export function GameScene() {
  const { camera } = useThree()
  const arrows = useGameStore((state) => state.arrows)
  const targets = useGameStore((state) => state.targets)
  const horsePosition = useGameStore((state) => state.horsePosition)
  const isPlaying = useGameStore((state) => state.isPlaying)
  const isCharging = useGameStore((state) => state.isCharging)
  const chargeProgress = useGameStore((state) => state.chargeProgress)
  const setIsCharging = useGameStore((state) => state.setIsCharging)
  const setChargeProgress = useGameStore((state) => state.setChargeProgress)
  const addArrow = useGameStore((state) => state.addArrow)
  const setAimPosition = useGameStore((state) => state.setAimPosition)
  const aimPosition = useGameStore((state) => state.aimPosition)
  const setHorsePosition = useGameStore((state) => state.setHorsePosition)

  const chargeStartTimeRef = useRef<number>(0)
  const raycaster = useRef(new THREE.Raycaster())
  const aimPointRef = useRef(new THREE.Vector3())

  const leftTreePositions = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      x: -14 - (i * 0.3),
      y: 2 + (i % 3) * 0.3,
      z: -30 - i * 18,
      scale: 0.8 + (i % 3) * 0.15,
    }))
  }, [])

  const rightTreePositions = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      x: 14 + (i * 0.3),
      y: 2 + (i % 3) * 0.3,
      z: -30 - i * 18,
      scale: 0.8 + (i % 3) * 0.15,
    }))
  }, [])

  useEffect(() => {
    if (isPlaying && horsePosition === 0) {
      setHorsePosition(0.01)
    }
  }, [isPlaying, horsePosition, setHorsePosition])

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isPlaying) return
      if (e.button === 0) {
        chargeStartTimeRef.current = Date.now()
        setIsCharging(true)
        setChargeProgress(0)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!isPlaying) return
      if (e.button === 0 && isCharging) {
        const chargeTime = (Date.now() - chargeStartTimeRef.current) / 1000
        const charge = Math.min(1, chargeTime / 1.5)
        const speed = MIN_ARROW_SPEED + (MAX_ARROW_SPEED - MIN_ARROW_SPEED) * charge

        const aimPoint = aimPointRef.current
        const arrowStartPos = new THREE.Vector3(0.5, 2.2, -horsePosition - 0.5)

        const direction = new THREE.Vector3().subVectors(aimPoint, arrowStartPos)
        const distance = direction.length()

        if (distance > 1) {
          direction.normalize()
          const flightTime = distance / speed
          const velocityX = (aimPoint.x - arrowStartPos.x) / flightTime
          const velocityZ = (aimPoint.z - arrowStartPos.z) / flightTime
          const velocityY = (aimPoint.y - arrowStartPos.y) / flightTime + 0.5 * GRAVITY * flightTime

          const velocity = new THREE.Vector3(velocityX, velocityY, velocityZ)

          const arrowId = Math.random().toString(36).substring(2, 11)
          addArrow({
            id: arrowId,
            position: arrowStartPos.clone(),
            velocity,
            isActive: true,
          })
        }

        setIsCharging(false)
        setChargeProgress(0)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setAimPosition(x, y)
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isPlaying, isCharging, horsePosition, addArrow, setIsCharging, setChargeProgress, setAimPosition])

  useFrame((state, delta) => {
    if (isCharging) {
      const chargeTime = (Date.now() - chargeStartTimeRef.current) / 1000
      const progress = Math.min(1, chargeTime / 1.5)
      setChargeProgress(progress)
    }

    const normalizedMouse = new THREE.Vector2(
      aimPosition.x * 2 - 1,
      -(aimPosition.y) * 2 + 1
    )

    raycaster.current.setFromCamera(normalizedMouse, camera)
    const aimPlaneZ = -horsePosition - 50
    const aimPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -aimPlaneZ)
    raycaster.current.ray.intersectPlane(aimPlane, aimPointRef.current)

    const targetZ = -horsePosition
    camera.position.lerp(new THREE.Vector3(0, 3.5, targetZ + 6), 0.08)
    camera.lookAt(0, 2.5, targetZ - 15)

    const time = state.clock.elapsedTime
    camera.position.y += Math.sin(time * 3) * 0.01
    camera.position.x += Math.sin(time * 1.5) * 0.005
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -80]} receiveShadow>
        <planeGeometry args={[80, 400]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>

      {leftTreePositions.map((pos, i) => (
        <mesh
          key={`tree-left-${i}`}
          position={[pos.x, pos.y, pos.z]}
          scale={pos.scale}
          castShadow
        >
          <coneGeometry args={[1.2, 3.5, 8]} />
          <meshStandardMaterial color="#2E7D32" />
        </mesh>
      ))}
      {rightTreePositions.map((pos, i) => (
        <mesh
          key={`tree-right-${i}`}
          position={[pos.x, pos.y, pos.z]}
          scale={pos.scale}
          castShadow
        >
          <coneGeometry args={[1.2, 3.5, 8]} />
          <meshStandardMaterial color="#2E7D32" />
        </mesh>
      ))}

      <mesh position={[0, 12, 10]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>

      <Horse />

      {targets.map((target) => (
        <Target
          key={target.id}
          id={target.id}
          initialPosition={target.position}
          type={target.type}
          moveRange={target.moveRange}
          moveSpeed={target.moveSpeed}
        />
      ))}

      {arrows
        .filter((a) => a.isActive)
        .map((arrow) => (
          <Arrow
            key={arrow.id}
            id={arrow.id}
            initialPosition={arrow.position}
            initialVelocity={arrow.velocity}
          />
        ))}
    </>
  )
}
