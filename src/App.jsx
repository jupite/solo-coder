import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './App.css'

const BOARD_SIZE = 15
const CELL_SIZE = 1
const BOARD_PADDING = 0.5
const TOTAL_SIZE = (BOARD_SIZE - 1) * CELL_SIZE + BOARD_PADDING * 2

function createWoodTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  for (let i = 0; i < 200; i++) {
    const y = Math.random() * canvas.height
    const opacity = Math.random() * 0.3
    ctx.fillStyle = `rgba(139, 69, 19, ${opacity})`
    ctx.fillRect(0, y, canvas.width, Math.random() * 2 + 1)
  }
  
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const length = Math.random() * 100 + 50
    const angle = Math.random() * 0.2 - 0.1
    ctx.strokeStyle = `rgba(101, 67, 33, ${Math.random() * 0.2})`
    ctx.lineWidth = Math.random() * 2 + 0.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
    ctx.stroke()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

function checkWin(boardData, row, col, player) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]
  
  for (const [dx, dy] of directions) {
    let count = 1
    
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (newRow >= 0 && newRow < BOARD_SIZE && 
          newCol >= 0 && newCol < BOARD_SIZE && 
          boardData[newRow][newCol] === player) {
        count++
      } else break
    }
    
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      if (newRow >= 0 && newRow < BOARD_SIZE && 
          newCol >= 0 && newCol < BOARD_SIZE && 
          boardData[newRow][newCol] === player) {
        count++
      } else break
    }
    
    if (count >= 5) return true
  }
  return false
}

function App() {
  const containerRef = useRef(null)
  const gameState = useRef({
    board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
    currentPlayer: 'black',
    winner: null
  })
  const uiState = useRef({
    message: '黑棋先行',
    currentPlayer: 'black',
    winner: null
  })
  const [ui, setUi] = useState({ message: '黑棋先行', currentPlayer: 'black', winner: null })
  const renderer = useRef(null)
  const pieces = useRef([])

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb)

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 12, 10)
    camera.lookAt(0, 0, 0)

    const ren = new THREE.WebGLRenderer({ antialias: true })
    ren.setSize(window.innerWidth, window.innerHeight)
    ren.shadowMap.enabled = true
    containerRef.current.appendChild(ren.domElement)
    renderer.current = ren

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const boardGeometry = new THREE.BoxGeometry(TOTAL_SIZE, 0.3, TOTAL_SIZE)
    const boardMaterial = new THREE.MeshPhongMaterial({ map: createWoodTexture() })
    const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial)
    boardMesh.receiveShadow = true
    boardMesh.position.y = -0.15
    scene.add(boardMesh)

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333 })
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = i * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2
      const hLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-(BOARD_SIZE - 1) * CELL_SIZE / 2, 0.01, pos),
          new THREE.Vector3((BOARD_SIZE - 1) * CELL_SIZE / 2, 0.01, pos)
        ]),
        lineMaterial
      )
      scene.add(hLine)
      const vLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(pos, 0.01, -(BOARD_SIZE - 1) * CELL_SIZE / 2),
          new THREE.Vector3(pos, 0.01, (BOARD_SIZE - 1) * CELL_SIZE / 2)
        ]),
        lineMaterial
      )
      scene.add(vLine)
    }

    const starGeometry = new THREE.CircleGeometry(0.08, 16)
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 })
    for (const i of [3, 7, 11]) {
      for (const j of [3, 7, 11]) {
        const star = new THREE.Mesh(starGeometry, starMaterial)
        star.position.set(j * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2, 0.015, i * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2)
        star.rotation.x = -Math.PI / 2
        scene.add(star)
      }
    }

    const hoverMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, transparent: true, opacity: 0.5 })
    const hoverPoint = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.08, 16), hoverMaterial)
    hoverPoint.visible = false
    scene.add(hoverPoint)

    const createPiece = (row, col, player) => {
      const piece = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 32, 32),
        new THREE.MeshPhongMaterial({
          color: player === 'black' ? 0x1a1a1a : 0xf0f0f0,
          shininess: 80,
          specular: player === 'black' ? 0x222222 : 0xaaaaaa
        })
      )
      piece.position.set(col * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2, 0.45, row * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2)
      piece.castShadow = true
      scene.add(piece)
      if (!pieces.current[row]) pieces.current[row] = []
      pieces.current[row][col] = piece
    }

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const getGridPosition = (event) => {
      const rect = ren.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObject(boardMesh)
      if (intersects.length === 0) return null

      const p = intersects[0].point
      const boardHalf = (BOARD_SIZE - 1) * CELL_SIZE / 2
      const col = Math.round((p.x + boardHalf) / CELL_SIZE)
      const row = Math.round((p.z + boardHalf) / CELL_SIZE)

      if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        return { row, col }
      }
      return null
    }

    const updateUI = () => {
      const newUi = {
        message: uiState.current.message,
        currentPlayer: uiState.current.currentPlayer,
        winner: uiState.current.winner
      }
      setUi(newUi)
    }

    const placePiece = (row, col) => {
      const gs = gameState.current
      if (gs.winner || gs.board[row][col]) return

      gs.board[row][col] = gs.currentPlayer
      createPiece(row, col, gs.currentPlayer)

      if (checkWin(gs.board, row, col, gs.currentPlayer)) {
        gs.winner = gs.currentPlayer
        uiState.current.winner = gs.currentPlayer
        uiState.current.message = gs.currentPlayer === 'black' ? '黑棋获胜！' : '白棋获胜！'
      } else {
        gs.currentPlayer = gs.currentPlayer === 'black' ? 'white' : 'black'
        uiState.current.currentPlayer = gs.currentPlayer
        uiState.current.message = gs.currentPlayer === 'black' ? '轮到黑棋' : '轮到白棋'
      }
      updateUI()
    }

    const onMouseMove = (event) => {
      if (gameState.current.winner) return
      const pos = getGridPosition(event)
      if (pos && !gameState.current.board[pos.row][pos.col]) {
        hoverPoint.visible = true
        hoverPoint.position.set(
          pos.col * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2,
          0.05,
          pos.row * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2
        )
        hoverPoint.material.color.setHex(gameState.current.currentPlayer === 'black' ? 0x333333 : 0xcccccc)
      } else {
        hoverPoint.visible = false
      }
    }

    const onClick = (event) => {
      const pos = getGridPosition(event)
      if (pos) placePiece(pos.row, pos.col)
    }

    ren.domElement.addEventListener('mousemove', onMouseMove)
    ren.domElement.addEventListener('click', onClick)

    const animate = () => {
      requestAnimationFrame(animate)
      ren.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      ren.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      ren.domElement.removeEventListener('mousemove', onMouseMove)
      ren.domElement.removeEventListener('click', onClick)
      if (containerRef.current) containerRef.current.removeChild(ren.domElement)
      ren.dispose()
    }
  }, [])

  const resetGame = () => {
    gameState.current = {
      board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
      currentPlayer: 'black',
      winner: null
    }
    uiState.current = { message: '黑棋先行', currentPlayer: 'black', winner: null }
    setUi({ message: '黑棋先行', currentPlayer: 'black', winner: null })
    window.location.reload()
  }

  return (
    <div className="game-container">
      <div ref={containerRef} className="canvas-container" />
      <div className="game-info">
        <h1>五子棋</h1>
        <div className={`message ${ui.winner ? 'winner' : ''}`}>{ui.message}</div>
        <div className="player-info">
          <div className={`player black ${ui.currentPlayer === 'black' && !ui.winner ? 'active' : ''}`}>
            <div className="player-piece black-piece"></div>
            <span>黑棋</span>
          </div>
          <div className={`player white ${ui.currentPlayer === 'white' && !ui.winner ? 'active' : ''}`}>
            <div className="player-piece white-piece"></div>
            <span>白棋</span>
          </div>
        </div>
        <button className="reset-btn" onClick={resetGame}>重新开始</button>
      </div>
    </div>
  )
}

export default App
