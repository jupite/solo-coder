'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'

interface SpawnGateProps {
  position: [number, number, number]
}

export function SpawnGate({ position }: SpawnGateProps) {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const { isDead } = useGameStore()

  const archShape = useMemo(() => {
    const shape = new THREE.Shape()
    const outerRadius = 1.5
    const innerRadius = 1.2
    const pillarWidth = 0.3
    const totalWidth = 4
    const totalHeight = 3.5
    
    shape.moveTo(0, 0)
    shape.lineTo(0, totalHeight - outerRadius)
    
    for (let i = 0; i <= 32; i++) {
      const angle = (Math.PI * i) / 32
      const x = pillarWidth + outerRadius + Math.cos(angle) * outerRadius
      const y = totalHeight - outerRadius + Math.sin(angle) * outerRadius
      shape.lineTo(x, y)
    }
    
    shape.lineTo(totalWidth, 0)
    shape.lineTo(totalWidth - pillarWidth, 0)
    
    const rightInnerX = totalWidth - pillarWidth - innerRadius
    shape.lineTo(rightInnerX + innerRadius, 0)
    
    for (let i = 32; i >= 0; i--) {
      const angle = (Math.PI * i) / 32
      const x = rightInnerX + Math.cos(angle) * innerRadius
      const y = totalHeight - outerRadius + (outerRadius - innerRadius) + Math.sin(angle) * innerRadius
      shape.lineTo(x, y)
    }
    
    shape.lineTo(pillarWidth, totalHeight - outerRadius + (outerRadius - innerRadius))
    shape.lineTo(pillarWidth, 0)
    shape.lineTo(0, 0)
    
    return shape
  }, [])

  const archExtrudeSettings = useMemo(() => ({
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  }), [])

  useEffect(() => {
    if (!particlesRef.current) return
    const positions = new Float32Array(100 * 3)
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = 1 + (Math.random() - 0.5) * 2.5
      positions[i * 3 + 1] = Math.random() * 3
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4
    }
    const geometry = particlesRef.current.geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime

    const light = groupRef.current.getObjectByName('gateLight')
    if (light) {
      const intensity = isDead 
        ? 3 + Math.sin(time * 3) * 1 
        : 1.2 + Math.sin(time * 2) * 0.4
      ;(light as THREE.PointLight).intensity = intensity
    }

    const innerLight = groupRef.current.getObjectByName('gateInnerLight')
    if (innerLight) {
      const intensity = isDead 
        ? 2 + Math.sin(time * 4) * 0.8 
        : 0.8 + Math.sin(time * 2.5) * 0.3
      ;(innerLight as THREE.PointLight).intensity = intensity
    }

    const portal = groupRef.current.getObjectByName('portal')
    if (portal) {
      const scale = 1 + Math.sin(time * 2) * 0.03
      portal.scale.set(scale, scale, 1)
      ;(portal as THREE.Mesh).rotation.z = time * 0.3
    }

    const particles = particlesRef.current
    if (particles) {
      particles.rotation.y = time * 0.2
      const positions = particles.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i)
        const newY = (y + 0.01) % 3
        positions.setY(i, newY)
      }
      positions.needsUpdate = true
    }
  })

  const halfWidth = 2

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[halfWidth, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry args={[archShape, archExtrudeSettings]} />
        <meshStandardMaterial 
          color={isDead ? '#5a6a8a' : '#4a4a6a'} 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>

      <mesh position={[halfWidth, 1.5, -0.5]} castShadow>
        <boxGeometry args={[0.5, 3, 0.2]} />
        <meshStandardMaterial color="#3a3a5a" metalness={0.5} roughness={0.5} />
      </mesh>

      <mesh position={[halfWidth, 2.8, -0.4]} name="gateBaseOrnament">
        <torusGeometry args={[0.3, 0.05, 8, 16, Math.PI]} />
        <meshStandardMaterial 
          color={isDead ? '#88ccff' : '#6699cc'} 
          metalness={0.8} 
          roughness={0.2}
          emissive={isDead ? '#4488cc' : '#335588'}
          emissiveIntensity={isDead ? 0.5 : 0.2}
        />
      </mesh>

      <group position={[halfWidth, 1.3, -0.1]} name="portal">
        <mesh>
          <planeGeometry args={[2.2, 2.2]} />
          <meshBasicMaterial 
            color={isDead ? '#88ccff' : '#6699cc'} 
            transparent 
            opacity={isDead ? 0.85 : 0.55} 
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[0.9, 1.0, 32]} />
          <meshBasicMaterial 
            color={isDead ? '#aaddff' : '#88aadd'} 
            transparent 
            opacity={isDead ? 0.9 : 0.7} 
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial 
            color={isDead ? '#cceeFF' : '#aaccee'} 
            transparent 
            opacity={isDead ? 0.7 : 0.5} 
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <circleGeometry args={[0.5, 32]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={isDead ? 0.6 : 0.3} 
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <points ref={particlesRef} position={[halfWidth, 0, -0.1]}>
        <bufferGeometry />
        <pointsMaterial 
          color={isDead ? '#88ccff' : '#6699cc'} 
          size={0.05} 
          transparent 
          opacity={isDead ? 0.9 : 0.6}
        />
      </points>

      <pointLight 
        name="gateLight"
        position={[halfWidth, 2, 0.5]} 
        color={isDead ? '#88ccff' : '#6699cc'} 
        intensity={isDead ? 3 : 1.2} 
        distance={15} 
        decay={2}
        castShadow 
      />

      <pointLight 
        name="gateInnerLight"
        position={[halfWidth, 1.5, -0.5]} 
        color={isDead ? '#aaddff' : '#88bbff'} 
        intensity={isDead ? 2 : 0.8} 
        distance={8} 
        decay={2} 
      />

      <mesh position={[halfWidth, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2.0, 32]} />
        <meshBasicMaterial 
          color={isDead ? '#88ccff' : '#6699cc'} 
          transparent 
          opacity={isDead ? 0.6 : 0.35} 
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[halfWidth, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.6, 32]} />
        <meshBasicMaterial 
          color={isDead ? '#aaddff' : '#88aadd'} 
          transparent 
          opacity={isDead ? 0.4 : 0.25} 
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[halfWidth, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.2, 32]} />
        <meshBasicMaterial 
          color={isDead ? '#cceeFF' : '#aaccee'} 
          transparent 
          opacity={isDead ? 0.3 : 0.2} 
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.6]} />
        <meshStandardMaterial color="#3a3a5a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[halfWidth * 2, 0.25, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.6]} />
        <meshStandardMaterial color="#3a3a5a" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}
