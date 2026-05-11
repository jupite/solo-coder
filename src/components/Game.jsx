import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

const BLOCK_SHAPES = [
  { type: 'cube', size: { x: 1, y: 0.5, z: 1 }, color: '#8B4513' },
  { type: 'long', size: { x: 2, y: 0.4, z: 0.8 }, color: '#A0522D' },
  { type: 'tall', size: { x: 0.8, y: 1.2, z: 0.8 }, color: '#D2691E' },
  { type: 'wide', size: { x: 1.5, y: 0.4, z: 1.5 }, color: '#CD853F' },
  { type: 'small', size: { x: 0.6, y: 0.4, z: 0.6 }, color: '#DEB887' },
]

function Game({ onGameOver }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const physicsWorldRef = useRef(null)
  const blocksRef = useRef([])
  const currentBlockRef = useRef(null)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const mouseRef = useRef({ x: 0, y: 0 })
  const safeZoneRef = useRef({ x: 0, z: 0, width: 3, depth: 3 })
  
  const [score, setScore] = useState(0)

  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(10, 12, 15)
    camera.lookAt(0, 5, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    scene.add(directionalLight)

    const physicsWorld = new CANNON.World()
    physicsWorld.gravity.set(0, -9.82, 0)
    physicsWorld.broadphase = new CANNON.NaiveBroadphase()
    physicsWorld.solver.iterations = 10
    physicsWorldRef.current = physicsWorld

    createGround(scene, physicsWorld)
    createSafeZone(scene)
    createInitialBlocks(scene, physicsWorld)
    spawnNewBlock(scene, physicsWorld)

    const handleMouseMove = (event) => {
      const rect = containerRef.current.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 0.5
      )
      
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)
      
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersectPoint = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, intersectPoint)
      
      if (intersectPoint) {
        mouseRef.current = { x: intersectPoint.x, z: intersectPoint.z }
      }
    }

    const handleClick = () => {
      if (gameOverRef.current || !currentBlockRef.current) return
      
      const block = currentBlockRef.current
      const pos = block.mesh.position
      
      const safeZone = safeZoneRef.current
      const isInSafeZone = 
        Math.abs(pos.x - safeZone.x) < safeZone.width / 2 &&
        Math.abs(pos.z - safeZone.z) < safeZone.depth / 2
      
      if (isInSafeZone) {
        return
      }
      
      block.body.type = CANNON.Body.DYNAMIC
      block.body.allowSleep = true
      block.placed = true
      blocksRef.current.push(block)
      scoreRef.current++
      setScore(scoreRef.current)
      
      spawnNewBlock(scene, physicsWorld)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    window.addEventListener('resize', handleResize)

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      if (!gameOverRef.current && currentBlockRef.current) {
        const block = currentBlockRef.current
        const targetY = getTargetHeight() + 1
        block.mesh.position.x = mouseRef.current.x
        block.mesh.position.z = mouseRef.current.z
        block.mesh.position.y = targetY
        block.body.position.copy(block.mesh.position)
      }
      
      physicsWorld.step(1 / 60)
      
      blocksRef.current.forEach(block => {
        if (block.placed) {
          block.mesh.position.copy(block.body.position)
          block.mesh.quaternion.copy(block.body.quaternion)
          
          if (block.body.position.y < -5) {
            gameOverRef.current = true
            onGameOver(scoreRef.current)
          }
          
          const angle = Math.abs(block.body.quaternion.x) + 
                       Math.abs(block.body.quaternion.y) + 
                       Math.abs(block.body.quaternion.z)
          if (angle > 0.5 && block.placed && block.body.position.y < 10) {
            gameOverRef.current = true
            onGameOver(scoreRef.current)
          }
        }
      })
      
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      containerRef.current.removeChild(renderer.domElement)
    }
  }, [onGameOver])

  const getTargetHeight = () => {
    if (blocksRef.current.length === 0) return 2
    const topBlock = blocksRef.current.reduce((highest, block) => {
      const height = block.body.position.y + block.size.y / 2
      return height > highest ? height : highest
    }, 0)
    return topBlock
  }

  const createWoodTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#8B4513')
    gradient.addColorStop(0.3, '#A0522D')
    gradient.addColorStop(0.5, '#8B4513')
    gradient.addColorStop(0.7, '#654321')
    gradient.addColorStop(1, '#8B4513')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
    
    for (let i = 0; i < 50; i++) {
      ctx.strokeStyle = `rgba(139, 69, 19, ${Math.random() * 0.2})`
      ctx.lineWidth = Math.random() * 2 + 1
      ctx.beginPath()
      ctx.moveTo(Math.random() * 256, 0)
      ctx.lineTo(Math.random() * 256, 256)
      ctx.stroke()
    }
    
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(101, 67, 33, ${Math.random() * 0.3})`
      ctx.fillRect(
        Math.random() * 256,
        Math.random() * 256,
        Math.random() * 100 + 20,
        Math.random() * 5 + 2
      )
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }

  const createGround = (scene, physicsWorld) => {
    const geometry = new THREE.PlaneGeometry(30, 30)
    const material = new THREE.MeshStandardMaterial({
      color: 0x2d5a27,
      roughness: 0.8,
    })
    const ground = new THREE.Mesh(geometry, material)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
    })
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    physicsWorld.addBody(groundBody)
  }

  const createSafeZone = (scene) => {
    const safeZone = safeZoneRef.current
    const geometry = new THREE.BoxGeometry(safeZone.width, 0.1, safeZone.depth)
    const material = new THREE.MeshBasicMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.3,
    })
    const zone = new THREE.Mesh(geometry, material)
    zone.position.y = 0.05
    scene.add(zone)

    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff4444, linewidth: 2 })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)
    wireframe.position.copy(zone.position)
    scene.add(wireframe)
  }

  const createInitialBlocks = (scene, physicsWorld) => {
    const positions = [
      { x: -4, z: 0 },
      { x: 4, z: 0 },
      { x: 0, z: -4 },
      { x: 0, z: 4 },
    ]
    
    positions.forEach(pos => {
      const shapeType = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)]
      createBlock(scene, physicsWorld, pos.x, 2, pos.z, shapeType, true)
    })
  }

  const createBlock = (scene, physicsWorld, x, y, z, shapeType, isStatic = false) => {
    const { size, color } = shapeType
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    
    const texture = createWoodTexture()
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.1,
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)

    const body = new CANNON.Body({
      mass: isStatic ? 0 : size.x * size.y * size.z * 5,
      shape: new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)),
      position: new CANNON.Vec3(x, y, z),
    })
    body.friction = 0.8
    body.restitution = 0.2
    if (isStatic) {
      body.type = CANNON.Body.STATIC
    }
    physicsWorld.addBody(body)

    return { mesh, body, size, placed: isStatic }
  }

  const spawnNewBlock = (scene, physicsWorld) => {
    const shapeType = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)]
    const targetY = getTargetHeight() + 1 + shapeType.size.y / 2
    
    const block = createBlock(scene, physicsWorld, 0, targetY, 0, shapeType)
    block.body.type = CANNON.Body.KINEMATIC
    currentBlockRef.current = block
  }

  return (
    <div className="game-container">
      <div className="score-display">
        <span>得分: {score}</span>
      </div>
      <div className="hint-text">点击放置积木（安全区外）</div>
      <div ref={containerRef} className="canvas-container" />
      
      <style jsx>{`
        .game-container {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        
        .canvas-container {
          width: 100%;
          height: 100%;
        }
        
        .score-display {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.7);
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 1.5rem;
          color: white;
          font-weight: bold;
          z-index: 10;
        }
        
        .hint-text {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          z-index: 10;
        }
      `}</style>
    </div>
  )
}

export default Game
