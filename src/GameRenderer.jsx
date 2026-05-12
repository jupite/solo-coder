import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { TILE_SIZE, GRID_SIZE, TILE_TYPES } from './gameLogic'

export default function GameRenderer({ gameState }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const playerRef = useRef(null)
  const boxRef = useRef(null)

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

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(500, 500)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(center, 10, center - 5)
    scene.add(directionalLight)

    buildScene(gameState, scene, center)

    let animId
    const animate = () => {
      renderer.render(scene, camera)
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current) return
    const center = (GRID_SIZE * TILE_SIZE) / 2
    clearScene(sceneRef.current)
    buildScene(gameState, sceneRef.current, center)
  }, [gameState.levelIndex, gameState.player.x, gameState.player.y, gameState.box.x, gameState.box.y, gameState.isWin])

  function clearScene(scene) {
    while (scene.children.length > 0) {
      const child = scene.children[0]
      scene.remove(child)
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    }
    playerRef.current = null
    boxRef.current = null
  }

  function buildScene(state, scene, center) {
    const floorGeometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE)
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4e69 })
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x22223b })
    const targetMaterial = new THREE.MeshStandardMaterial({ color: 0xf2e9e4 })

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
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xe07a5f })
    const player = new THREE.Mesh(playerGeometry, playerMaterial)
    player.position.set(state.player.x, 0.4, state.player.y)
    scene.add(player)
    playerRef.current = player

    const boxGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7)
    const boxMaterial = new THREE.MeshStandardMaterial({ 
      color: state.isWin ? 0xffd93d : 0x81b29a 
    })
    const box = new THREE.Mesh(boxGeometry, boxMaterial)
    box.position.set(state.box.x, 0.35, state.box.y)
    scene.add(box)
    boxRef.current = box
  }

  return <div ref={containerRef} className="game-canvas"></div>
}
