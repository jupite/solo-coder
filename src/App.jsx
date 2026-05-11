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
    nextPlatformDirection: 0,
    jumpVelocity: { x: 0, y: 0, z: 0 },
    jumpStartPos: { x: 0, y: 0, z: 0 },
    jumpProgress: 0,
    camera: null,
    cameraTargetPos: { x: 0, y: 5, z: 10 },
    scene: null,
    renderer: null
  })

  const initGame = useCallback(() => {
    const state = gameState.current
    
    state.score = 0
    state.combo = 0
    state.isPowering = false
    state.currentPower = 0
    state.isJumping = false
    state.platforms = []
    state.currentPlatformIndex = 0
    setScore(0)
    setCombo(0)
    setPower(0)
    setGameOver(false)

    if (state.scene) {
      while(state.scene.children.length > 0) {
        state.scene.remove(state.scene.children[0])
      }
    } else {
      state.scene = new THREE.Scene()
      state.scene.background = new THREE.Color(0x87CEEB)
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      state.scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(5, 10, 5)
      state.scene.add(directionalLight)
      
      const canvas = canvasRef.current
      state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      state.renderer.setSize(window.innerWidth, window.innerHeight)
      state.renderer.setPixelRatio(window.devicePixelRatio)
      
      state.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
      state.camera.position.set(0, 8, 12)
      state.camera.lookAt(0, 0, 0)
    }

    const platformGeo = new THREE.BoxGeometry(2, 0.8, 2)
    const platformMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 })
    const firstPlatform = new THREE.Mesh(platformGeo, platformMat)
    firstPlatform.position.set(0, -0.4, 0)
    state.scene.add(firstPlatform)
    state.platforms.push(firstPlatform)

    for (let i = 0; i < 5; i++) {
      addPlatform(state)
    }

    const playerGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6)
    const playerMat = new THREE.MeshLambertMaterial({ color: 0xFF5722 })
    const player = new THREE.Mesh(playerGeo, playerMat)
    player.position.set(0, 0.5, 0)
    state.scene.add(player)
    state.player = player
  }, [])

  const addPlatform = (state) => {
    const lastPlatform = state.platforms[state.platforms.length - 1]
    const lastPos = lastPlatform.position
    
    const direction = Math.random() > 0.5 ? 1 : -1
    state.nextPlatformDirection = direction
    
    const distance = 2 + Math.random() * 3
    const width = 1 + Math.random() * 1.5
    const depth = 1 + Math.random() * 1.5
    
    const platformGeo = new THREE.BoxGeometry(width, 0.8, depth)
    const colors = [0x2196F3, 0x9C27B0, 0xFF9800, 0x00BCD4, 0xE91E63]
    const color = colors[Math.floor(Math.random() * colors.length)]
    const platformMat = new THREE.MeshLambertMaterial({ color })
    const platform = new THREE.Mesh(platformGeo, platformMat)
    
    if (state.platforms.length % 2 === 0) {
      platform.position.set(lastPos.x + distance, -0.4, lastPos.z)
    } else {
      platform.position.set(lastPos.x, -0.4, lastPos.z + distance)
    }
    
    state.scene.add(platform)
    state.platforms.push(platform)
  }

  const jump = (power, state) => {
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
    
    const jumpDistance = Math.min(power * 0.08, totalDistance + 4)
    
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
  }

  const checkLanding = (state) => {
    const currentPlatform = state.platforms[state.currentPlatformIndex]
    const nextPlatform = state.platforms[state.currentPlatformIndex + 1]
    
    if (!nextPlatform) {
      endGame(state)
      return
    }
    
    const px = state.player.position.x
    const pz = state.player.position.z
    
    const np = nextPlatform.position
    const nGeo = nextPlatform.geometry.parameters
    const halfW = nGeo.width / 2
    const halfD = nGeo.depth / 2
    
    const onNextPlatform = px >= np.x - halfW && px <= np.x + halfW &&
                           pz >= np.z - halfD && pz <= np.z + halfD
    
    if (onNextPlatform) {
      const distFromCenter = Math.sqrt(
        Math.pow(px - np.x, 2) + Math.pow(pz - np.z, 2)
      )
      
      const maxDist = Math.sqrt(halfW * halfW + halfD * halfD)
      const centerRatio = 1 - (distFromCenter / maxDist)
      
      let points = 1
      let hitCenter = false
      
      if (centerRatio > 0.8) {
        points = 5
        hitCenter = true
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
      
      if (state.score > highScore) {
        setHighScore(state.score)
        localStorage.setItem('jumpGameHighScore', state.score.toString())
      }
      
      while (state.platforms.length > state.currentPlatformIndex + 3) {
        const oldPlatform = state.platforms.shift()
        state.scene.remove(oldPlatform)
        state.currentPlatformIndex--
      }
      
      addPlatform(state)
      
      state.isJumping = false
    } else {
      endGame(state)
    }
  }

  const endGame = (state) => {
    state.isJumping = false
    setGameOver(true)
    
    if (state.score > highScore) {
      setHighScore(state.score)
      localStorage.setItem('jumpGameHighScore', state.score.toString())
    }
  }

  const animate = useCallback(() => {
    const state = gameState.current
    if (!state.scene || !state.renderer || !state.camera) return
    
    requestAnimationFrame(animate)
    
    if (state.isPowering && !state.isJumping) {
      const now = Date.now()
      const elapsed = now - state.powerStartTime
      state.currentPower = Math.min(elapsed / 20, 100)
      setPower(state.currentPower)
      
      if (state.player) {
        state.player.scale.y = 1 - state.currentPower / 400
        state.player.scale.x = 1 + state.currentPower / 800
        state.player.scale.z = 1 + state.currentPower / 800
      }
    }
    
    if (state.isJumping) {
      state.jumpProgress += 0.03
      
      if (state.jumpProgress <= 1) {
        const startPos = state.jumpStartPos
        const vel = state.jumpVelocity
        
        state.player.position.x = startPos.x + vel.x * state.jumpProgress
        state.player.position.z = startPos.z + vel.z * state.jumpProgress
        
        const jumpHeight = 3 + vel.x * 0.3 + vel.z * 0.3
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
        
        checkLanding(state)
      }
    }
    
    if (state.player) {
      const targetX = state.player.position.x
      const targetZ = state.player.position.z + 10
      
      state.camera.position.x += (targetX - state.camera.position.x) * 0.05
      state.camera.position.z += (targetZ - state.camera.position.z) * 0.05
      state.camera.lookAt(state.player.position.x, 0, state.player.position.z)
    }
    
    state.renderer.render(state.scene, state.camera)
  }, [highScore])

  const handleMouseDown = useCallback(() => {
    const state = gameState.current
    if (state.isJumping || gameOver) return
    
    state.isPowering = true
    state.powerStartTime = Date.now()
  }, [gameOver])

  const handleMouseUp = useCallback(() => {
    const state = gameState.current
    if (!state.isPowering || gameOver) return
    
    jump(state.currentPower, state)
  }, [gameOver])

  const handleRestart = useCallback(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    initGame()
    animate()
    
    const handleResize = () => {
      const state = gameState.current
      if (state.camera && state.renderer) {
        state.camera.aspect = window.innerWidth / window.innerHeight
        state.camera.updateProjectionMatrix()
        state.renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [initGame, animate])

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      />
      
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
            <div className="combo-badge animate-combo">
              {combo}连击!
            </div>
          )}
        </div>
        
        <div className="power-bar-container">
          <div className="power-bar">
            <div 
              className="power-fill"
              style={{ width: `${power}%` }}
            />
          </div>
          <div className="power-label">蓄力</div>
        </div>
        
        <div className="instructions">
          按住鼠标蓄力，松开跳跃
        </div>
        
        {gameOver && (
          <div className="game-over-modal">
            <h2>游戏结束</h2>
            <div className="final-score">得分: {score}</div>
            <div className="high-score">最高分: {highScore}</div>
            <button className="restart-btn" onClick={handleRestart}>
              重新开始
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
