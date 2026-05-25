import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { Horse } from './Horse'
import { Arrow } from './Arrow'
import { Target } from './Target'
import { MAX_ARROW_SPEED, MIN_ARROW_SPEED } from '../utils/physics'

export function GameScene() {
  const { camera, scene } = useThree()
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

  const chargeStartTimeRef = useRef<number>(0)
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

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
        const charge = Math.min(1, chargeTime / 2)
        const speed = MIN_ARROW_SPEED + (MAX_ARROW_SPEED - MIN_ARROW_SPEED) * charge

        const angle = (aimPosition.y - 0.5) * -0.3
        const horizontalAngle = (aimPosition.x - 0.5) * 0.5

        const velocity = new THREE.Vector3(
          Math.sin(horizontalAngle) * speed * 0.3,
          Math.sin(angle) * speed + 5,
          -speed
        )

        const arrowId = Math.random().toString(36).substring(2, 11)
        addArrow({
          id: arrowId,
          position: new THREE.Vector3(0, 2.5, -horsePosition),
          velocity,
          isActive: true,
        })

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
  }, [isPlaying, isCharging, aimPosition, horsePosition, addArrow, setIsCharging, setChargeProgress, setAimPosition])

  useFrame((state, delta) => {
    if (isCharging) {
      const chargeTime = (Date.now() - chargeStartTimeRef.current) / 1000
      const progress = Math.min(1, chargeTime / 2)
      setChargeProgress(progress)
    }

    const targetZ = -horsePosition
    camera.position.lerp(new THREE.Vector3(0, 3, targetZ + 5), 0.1)
    camera.lookAt(0, 2, targetZ - 10)

    const time = state.clock.elapsedTime
    camera.position.y += Math.sin(time * 4) * 0.01
    camera.position.x += Math.sin(time * 2) * 0.005
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

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -50]} receiveShadow>
        <planeGeometry args={[100, 300]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>

      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={`tree-left-${i}`}
          position={[-15 - Math.random() * 5, 2 + Math.random(), -20 - i * 25]}
          castShadow
        >
          <coneGeometry args={[1.5, 4, 8]} />
          <meshStandardMaterial color="#2E7D32" />
        </mesh>
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={`tree-right-${i}`}
          position={[15 + Math.random() * 5, 2 + Math.random(), -20 - i * 25]}
          castShadow
        >
          <coneGeometry args={[1.5, 4, 8]} />
          <meshStandardMaterial color="#2E7D32" />
        </mesh>
      ))}

      <mesh position={[0, 8, -150]}>
        <boxGeometry args={[80, 16, 1]} />
        <meshStandardMaterial color="#6B8E23" />
      </mesh>

      <mesh position={[0, 12, 0]}>
        <sphereGeometry args={[3, 32, 32]} />
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
