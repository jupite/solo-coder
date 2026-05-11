import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'
import * as THREE from 'three'

function App() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('jumpGameHighScore') || '0')
  })
  const [gameOver, setGameOver] = useState(false)
  const [power, setPower] = useState(0)
  const [combo, setCombo] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  
  const gameState = useRef({
    score: 0,
    combo: 0,
    isPowering: false,
    powerStartTime: 0,
    currentPower: 0,
    isJumping: false,
    player: null,
    platforms: [],
    currentPlatformIndex: 0,
    jumpVelocity: { x: 0, y: 0, z: 0 },
    jumpStartPos: { x: 0, y: 0, z: 0 },
    jumpProgress: 0,
    camera: null,
    scene: null,
    renderer: null,
    animationId: null,
    isInitialized: false
  })

  const updateHighScore = useCallback((newScore) => {
    const currentHigh = parseInt(localStorage.getItem('jumpGameHighScore') || '0')
    if (newScore > currentHigh) {
      setHighScore(newScore)
      localStorage.setItem('jumpGameHighScore', newScore.toString())
    }
  }, [])

  const createPlatformWithEdges = useCallback((width, depth, color, position, scene) => {
    const group = new THREE.Group()
    
    const platformGeo = new THREE.BoxGeometry(width, 0.8, depth)
    const platformMat = new THREE.MeshStandardMaterial({ 
      color: color,
      metalness: 0.3,
      roughness: 0.4
    })
    const platform = new THREE.Mesh(platformGeo, platformMat)
    group.add(platform)
    
    const edges = new THREE.EdgesGeometry(platformGeo)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 })
    const edgeLines = new THREE.LineSegments(edges, lineMat)
    group.add(edgeLines)
    
    const topGeo = new THREE.BoxGeometry(width - 0.1, 0.05, depth - 0.1)
    const topMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color).multiplyScalar(1.3),
      metalness: 0.2,
      roughness: 0.3
    })
    const top = new THREE.Mesh(topGeo, topMat)
    top.position.y = 0.425
    group.add(top)
    
    group.position.copy(position)
    group.userData = { width, depth }
    scene.add(group)
    return group
  }, [])

  const addPlatform = useCallback((state) => {
    const lastPlatform = state.platforms[state.platforms.length - 1]
    const lastPos = lastPlatform.position
    
    const distance = 2.5 + Math.random() * 3.5
    const width = 1.2 + Math.random() * 1.8
    const depth = 1.2 + Math.random() * 1.8
    
    const colors = [
      0x2196F3,
      0xE91E63,
      0xFF9800,
      0x00BCD4,
      0x9C27B0,
      0x4CAF50,
      0xFF5722,
      0x03A9F4
    ]
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    let newPosition
    if (state.platforms.length % 2 === 0) {
      newPosition = new THREE.Vector3(lastPos.x + distance, -0.4, lastPos.z)
    } else {
      newPosition = new THREE.Vector3(lastPos.x, -0.4, lastPos.z + distance)
    }
    
    const platform = createPlatformWithEdges(width, depth, color, newPosition, state.scene)
    state.platforms.push(platform)
  }, [createPlatformWithEdges])

  const jump = useCallback((jumpPower, state) => {
    if (state.isJumping) return
    
    state.isJumping = true
    state.isPowering = false
    state.currentPower = 0
    setPower(0)
    
    const currentPlatform = state.platforms[state.currentPlatformIndex]
    const nextPlatform = state.platforms[state.currentPlatformIndex + 1]
    
    if (!nextPlatform) return
    
    const dx = nextPlatform.position.x - currentPlatform.position.x
    const dz = nextPlatform.position.z - currentPlatform.position.z
    const totalDistance = Math.sqrt(dx * dx + dz * dz)
    
    const jumpDistance = Math.min(jumpPower * 0.1, totalDistance + 3)
    
    state.jumpStartPos = {
      x: state.player.position.x,
      y: state.player.position.y,
      z: state.player.position.z
    }
    
    const dirX = dx / totalDistance || 0
    const dirZ = dz / totalDistance || 0
    
    state.jumpVelocity = {
      x: dirX * jumpDistance,
      y: 0,
      z: dirZ * jumpDistance
    }
    
    state.jumpProgress = 0
  }, [])

  const initGame = useCallback((state) => {
    state.score = 0
    state.combo = 0
    state.isPowering = false
    state.currentPower = 0
    state.isJumping = false
    state.platforms = []
    state.currentPlatformIndex = 0
    state.jumpProgress = 0
    setScore(0)
    setCombo(0)
    setPower(0)
    setGameOver(false)

    if (!state.isInitialized) {
      state.scene = new THREE.Scene()
      state.scene.background = new THREE.Color(0x87CEEB)
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
      state.scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
      directionalLight.position.set(10, 20, 10)
      state.scene.add(directionalLight)
      
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
      directionalLight2.position.set(-10, 10, -10)
      state.scene.add(directionalLight2)
      
      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
      state.scene.add(hemisphereLight)
      
      const canvas = canvasRef.current
      state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      state.renderer.setSize(window.innerWidth, window.innerHeight)
      state.renderer.setPixelRatio(window.devicePixelRatio)
      state.renderer.shadowMap.enabled = true
      
      state.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
      state.camera.position.set(0, 10, 15)
      state.camera.lookAt(0, 0, 0)
      
      state.isInitialized = true
    } else {
      while(state.scene.children.length > 0) {
        state.scene.remove(state.scene.children[0])
      }
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
      state.scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
      directionalLight.position.set(10, 20, 10)
      state.scene.add(directionalLight)
      
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
      directionalLight2.position.set(-10, 10, -10)
      state.scene.add(directionalLight2)
      
      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
      state.scene.add(hemisphereLight)
    }

    const firstPlatform = createPlatformWithEdges(2.5, 2.5, 0x4CAF50, new THREE.Vector3(0, -0.4, 0), state.scene)
    state.platforms.push(firstPlatform)

    for (let i = 0; i < 4; i++) {
      addPlatform(state)
    }

    const playerGroup = new THREE.Group()
    
    const playerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ 
        color: 0xFF5722,
        metalness: 0.3,
        roughness: 0.4
      })
    )
    playerGroup.add(playerBody)
    
    const playerEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.6, 0.6, 0.6)),
      new THREE.LineBasicMaterial({ color: 0x000000 })
    )
    playerGroup.add(playerEdges)
    
    playerGroup.position.set(0, 0.5, 0)
    state.scene.add(playerGroup)
    state.player = playerGroup
  }, [addPlatform, createPlatformWithEdges])

  useEffect(() => {
    const state = gameState.current
    
    const checkLanding = () => {
      const currentPlatform = state.platforms[state.currentPlatformIndex]
      const nextPlatform = state.platforms[state.currentPlatformIndex + 1]
      
      if (!nextPlatform) {
        return
      }
      
      const px = state.player.position.x
      const pz = state.player.position.z
      
      const np = nextPlatform.position
      const nGeo = nextPlatform.userData
      const halfW = nGeo.width / 2
      const halfD = nGeo.depth / 2
      
      const onNextPlatform = px >= np.x - halfW && px <= np.x + halfW && pz >= np.z - halfD && pz <= np.z + halfD
      
      if (onNextPlatform) {
        state.player.position.x = px
        state.player.position.z = pz
        state.player.position.y = 0.5
        
        const distFromCenter = Math.sqrt(Math.pow(px - np.x, 2) + Math.pow(pz - np.z, 2))
        const maxDist = Math.sqrt(halfW * halfW + halfD * halfD)
        const centerRatio = 1 - (distFromCenter / maxDist)
        
        let points = 1
        
        if (centerRatio > 0.8) {
          points = 5
          state.combo++
          if (state.combo >= 2) {
            points += state.combo * 2
            setShowCombo(true)
            setTimeout(() => setShowCombo(false), 800)
          }
        } else {
          points = 1 + Math.floor(centerRatio * 2)
          state.combo = 0
        }
        
        state.score += points
        state.currentPlatformIndex++
        setScore(state.score)
        setCombo(state.combo)
        
        updateHighScore(state.score)
        
        while (state.platforms.length > state.currentPlatformIndex + 4) {
          const oldPlatform = state.platforms.shift()
          state.scene.remove(oldPlatform)
          state.currentPlatformIndex--
        }
        
        addPlatform(state)
        
        state.isJumping = false
      } else {
        setGameOver(true)
        updateHighScore(state.score)
      }
    }
    
    let animationRunning = true
    
    const animate = () => {
      if (!animationRunning) return
      if (!state.scene || !state.renderer || !state.camera) {
        state.animationId = requestAnimationFrame(animate)
        return
      }
      
      state.animationId = requestAnimationFrame(animate)
      
      if (state.isPowering && !state.isJumping && state.player) {
        const now = Date.now()
        const elapsed = now - state.powerStartTime
        state.currentPower = Math.min(elapsed / 20, 100)
        setPower(state.currentPower)
        
        state.player.scale.y = 1 - state.currentPower / 400
        state.player.scale.x = 1 + state.currentPower / 800
        state.player.scale.z = 1 + state.currentPower / 800
      }
      
      if (state.isJumping && state.player) {
        state.jumpProgress += 0.035
        
        if (state.jumpProgress <= 1) {
          const startPos = state.jumpStartPos
          const vel = state.jumpVelocity
          
          state.player.position.x = startPos.x + vel.x * state.jumpProgress
          state.player.position.z = startPos.z + vel.z * state.jumpProgress
          
          const jumpHeight = 3.5 + Math.abs(vel.x) * 0.4 + Math.abs(vel.z) * 0.4
          const parabola = 4 * jumpHeight * state.jumpProgress * (1 - state.jumpProgress)
          state.player.position.y = startPos.y + parabola
          
          state.player.rotation.x += 0.15
          state.player.rotation.z += 0.1
        } else {
          state.player.scale.y = 1
          state.player.scale.x = 1
          state.player.scale.z = 1
          state.player.rotation.x = 0
          state.player.rotation.z = 0
          
          checkLanding()
        }
      }
      
      if (state.player) {
        const targetX = state.player.position.x
        const targetZ = state.player.position.z + 12
        const targetY = 10
        
        state.camera.position.x += (targetX - state.camera.position.x) * 0.08
        state.camera.position.z += (targetZ - state.camera.position.z) * 0.08
        state.camera.position.y += (targetY - state.camera.position.y) * 0.05
        state.camera.lookAt(state.player.position.x, 0, state.player.position.z)
      }
      
      state.renderer.render(state.scene, state.camera)
    }
    
    initGame(state)
    animate()
    
    const handleResize = () => {
      if (state.camera && state.renderer) {
        state.camera.aspect = window.innerWidth / window.innerHeight
        state.camera.updateProjectionMatrix()
        state.renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      animationRunning = false
      window.removeEventListener('resize', handleResize)
      if (state.animationId) {
        cancelAnimationFrame(state.animationId)
      }
    }
  }, [gameKey, initGame, addPlatform, updateHighScore])

  const handleMouseDown = useCallback(() => {
    const state = gameState.current
    if (state.isJumping || gameOver || !state.isInitialized) return
    
    state.isPowering = true
    state.powerStartTime = Date.now()
  }, [gameOver])

  const handleMouseUp = useCallback(() => {
    const state = gameState.current
    if (!state.isPowering || gameOver || !state.isInitialized) return
    
    jump(state.currentPower, state)
  }, [jump, gameOver])

  const handleRestart = useCallback(() => {
    setGameKey(prev => prev + 1)
  }, [])

  return (
    <div className="game-container">
      <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onTouchStart={handleMouseDown} onTouchEnd={handleMouseUp} />
      
      <div className="ui-overlay">
        <div className="score-panel">
          <div className="score-item">
            <span className="label">当前分数</span>
            <span className="value">{score}</span>
          </div>
          <div className="score-item">
            <span className="label">最高分</span>
            <span className="value">{highScore}</span>
          </div>
          {combo >= 2 && showCombo && (
            <div className="combo-badge animate-combo">{combo}连击!</div>
          )}
        </div>
        
        <div className="power-bar-container">
          <div className="power-bar">
            <div className="power-fill" style={{ width: `${power}%` }} />
          </div>
          <div className="power-label">蓄力</div>
        </div>
        
        <div className="instructions">按住鼠标蓄力，松开跳跃</div>
        
        {gameOver && (
          <div className="game-over-modal">
            <h2>游戏结束</h2>
            <div className="final-score">得分: {score}</div>
            <div className="high-score">最高分: {highScore}</div>
            <button className="restart-btn" onClick={handleRestart}>重新开始</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
