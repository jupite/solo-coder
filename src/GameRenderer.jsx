import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { TILE_SIZE, GRID_SIZE, TILE_TYPES } from './gameLogic'

export default function GameRenderer({ gameState }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const playerRef = useRef(null)
  const boxRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    sceneRef.current = scene

    const center = (GRID_SIZE * TILE_SIZE) / 2
    const camera = new THREE.OrthographicCamera(
      center + 1,
      -center - 1,
      center + 1,
      -center - 1,
      0.1,
      100
    )
    camera.position.set(center, 15, center)
    camera.lookAt(center, 0, center)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(500, 500)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(center, 10, center - 5)
    scene.add(directionalLight)

    buildScene(gameState, scene, center)

    const animate = () => {
      renderer.render(scene, camera)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      renderer.dispose()
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current) return
    updateScene(gameState)
  }, [gameState])

  function buildScene(state, scene, center) {
    const floorGeometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE)
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4e69 })
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x22223b })
    const targetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd93d, 
      emissive: 0xffd93d, 
      emissiveIntensity: 0.3 
    })

    const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, 0x9ca3af, 0x4b5563)
    gridHelper.position.set(center - 0.5, 0.01, center - 0.5)
    scene.add(gridHelper)

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tileType = state.grid[y][x]

        if (tileType === TILE_TYPES.FLOOR || tileType === TILE_TYPES.TARGET) {
          const floor = new THREE.Mesh(floorGeometry, floorMaterial)
          floor.rotation.x = -Math.PI / 2
          floor.position.set(x, 0, y)
          scene.add(floor)

          if (tileType === TILE_TYPES.TARGET) {
            const targetGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1)
            const target = new THREE.Mesh(targetGeometry, targetMaterial)
            target.position.set(x, 0.05, y)
            scene.add(target)
          }
        } else if (tileType === TILE_TYPES.WALL) {
          const wallGeometry = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE)
          const wall = new THREE.Mesh(wallGeometry, wallMaterial)
          wall.position.set(x, TILE_SIZE / 2, y)
          scene.add(wall)
        }
      }
    }

    const playerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8)
    const playerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe07a5f, 
      emissive: 0xe07a5f, 
      emissiveIntensity: 0.2 
    })
    const player = new THREE.Mesh(playerGeometry, playerMaterial)
    player.position.set(state.player.x, 0.4, state.player.y)
    scene.add(player)
    playerRef.current = player

    const boxGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7)
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x81b29a })
    const box = new THREE.Mesh(boxGeometry, boxMaterial)
    box.position.set(state.box.x, 0.35, state.box.y)
    scene.add(box)
    boxRef.current = box
  }

  function updateScene(state) {
    if (!playerRef.current || !boxRef.current) return

    playerRef.current.position.set(state.player.x, 0.4, state.player.y)
    boxRef.current.position.set(state.box.x, 0.35, state.box.y)

    if (boxRef.current && state.isWin) {
      boxRef.current.material.color.setHex(0xffd93d)
      boxRef.current.material.emissive.setHex(0xffd93d)
      boxRef.current.material.emissiveIntensity = 0.5
    } else if (boxRef.current) {
      boxRef.current.material.color.setHex(0x81b29a)
      boxRef.current.material.emissive.setHex(0x000000)
      boxRef.current.material.emissiveIntensity = 0
    }
  }

  return <div ref={containerRef} className="game-canvas"></div>
}
