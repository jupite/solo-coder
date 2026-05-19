import * as THREE from 'three'
import { GameScene } from './scene/Scene'
import { CameraController } from './scene/Camera'
import { Stone } from './scene/Stone'
import { Physics } from './physics/Physics'
import { AIOpponent } from './logic/AIOpponent'
import { Scoring } from './logic/Scoring'
import { GAME_CONFIG } from './config'
import type { GamePhase, CameraMode, Team } from './types'

export interface GameStateData {
  phase: GamePhase
  playerStonesThrown: number
  aiStonesThrown: number
  playerScore: number
  aiScore: number
  winner: Team | 'draw' | null
  isDragging: boolean
  throwPower: number
  throwAngle: number
  cameraMode: CameraMode
  message: string
  currentStone: Stone | null
}

export class Game {
  private scene: GameScene
  private camera: CameraController
  private renderer: THREE.WebGLRenderer
  private physics: Physics
  private ai: AIOpponent
  private clock: THREE.Clock
  private animationId: number | null = null
  private onStateChange: ((state: GameStateData) => void) | null = null

  private state: GameStateData = {
    phase: 'idle',
    playerStonesThrown: 0,
    aiStonesThrown: 0,
    playerScore: 0,
    aiScore: 0,
    winner: null,
    isDragging: false,
    throwPower: 0,
    throwAngle: 0,
    cameraMode: 'default',
    message: '点击并向后拖动冰壶来控制投掷',
    currentStone: null,
  }

  private dragStart: { x: number; y: number } | null = null
  private dragCurrent: { x: number; y: number } | null = null
  private previewLine: THREE.Line | null = null
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new GameScene()
    this.camera = new CameraController(canvas.clientWidth, canvas.clientHeight)
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.physics = new Physics()
    this.ai = new AIOpponent()
    this.clock = new THREE.Clock()
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.setupEventListeners(canvas)
    this.createPreviewLine()
  }

  private createPreviewLine() {
    const geometry = new THREE.BufferGeometry()
    geometry.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)])
    const material = new THREE.LineDashedMaterial({
      color: 0xff5722,
      dashSize: 0.3,
      gapSize: 0.2,
    })
    this.previewLine = new THREE.Line(geometry, material)
    this.previewLine.computeLineDistances()
    this.previewLine.visible = false
    this.scene.getScene().add(this.previewLine)
  }

  private updatePreviewLine() {
    if (!this.previewLine || !this.state.currentStone || !this.dragStart || !this.dragCurrent) {
      if (this.previewLine) {
        this.previewLine.visible = false
      }
      return
    }

    const dx = this.dragCurrent.x - this.dragStart.x
    const dy = this.dragCurrent.y - this.dragStart.y

    const power = Math.min(Math.sqrt(dx * dx + dy * dy) * GAME_CONFIG.POWER_MULTIPLIER, GAME_CONFIG.MAX_POWER)
    const angle = Math.atan2(dx, dy)

    const startPos = this.state.currentStone.getPosition()
    const endX = startPos.x - Math.sin(angle) * power * 2
    const endZ = startPos.z + Math.cos(angle) * power * 2

    const points = [
      new THREE.Vector3(startPos.x, 0.1, startPos.z),
      new THREE.Vector3(endX, 0.1, endZ),
    ]

    this.previewLine.geometry.setFromPoints(points)
    this.previewLine.computeLineDistances()
    this.previewLine.visible = true

    this.state.throwPower = power
    this.state.throwAngle = angle
  }

  private setupEventListeners(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    canvas.addEventListener('mouseleave', this.onMouseUp.bind(this))
    canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: true })

    window.addEventListener('resize', () => {
      this.camera.resize(canvas.clientWidth, canvas.clientHeight)
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    })
  }

  private onWheel(event: WheelEvent) {
    this.camera.zoom(event.deltaY)
  }

  private onMouseDown(event: MouseEvent) {
    if (this.state.phase !== 'player_turn' || !this.state.currentStone || this.state.isDragging) return

    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera.getCamera())
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersect = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(plane, intersect)

    if (intersect) {
      this.dragStart = { x: intersect.x, y: intersect.z }
      this.dragCurrent = { x: intersect.x, y: intersect.z }
      this.state.isDragging = true
      this.state.message = '拖动控制方向和力度，释放投掷'
      this.notifyStateChange()
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.state.isDragging || !this.dragStart) return

    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera.getCamera())
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersect = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(plane, intersect)

    if (intersect) {
      this.dragCurrent = { x: intersect.x, y: intersect.z }
      this.updatePreviewLine()
      this.notifyStateChange()
    }
  }

  private onMouseUp() {
    if (!this.state.isDragging || !this.state.currentStone || !this.dragStart || !this.dragCurrent) {
      this.state.isDragging = false
      this.notifyStateChange()
      return
    }

    const dx = this.dragCurrent.x - this.dragStart.x
    const dy = this.dragCurrent.y - this.dragStart.y

    const power = Math.min(Math.sqrt(dx * dx + dy * dy) * GAME_CONFIG.POWER_MULTIPLIER, GAME_CONFIG.MAX_POWER)
    const angle = Math.atan2(dx, dy)

    if (power > 0.3) {
      const vx = -Math.sin(angle) * power
      const vz = Math.cos(angle) * power
      this.state.currentStone.setVelocity(vx, vz)

      this.physics.addStone(this.state.currentStone)
      this.camera.setFollowTarget(this.state.currentStone.getMesh())
      this.camera.setMode('follow')
      this.state.cameraMode = 'follow'

      this.state.phase = 'calculating'
      this.state.message = '冰壶滑行中...'
      this.state.currentStone = null
      this.state.playerStonesThrown++
    } else {
      this.state.message = '力度太小，请重新投掷'
    }

    this.state.isDragging = false
    this.dragStart = null
    this.dragCurrent = null
    if (this.previewLine) {
      this.previewLine.visible = false
    }
    this.notifyStateChange()
  }

  setStateChangeListener(listener: (state: GameStateData) => void) {
    this.onStateChange = listener
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state })
    }
  }

  start() {
    this.resetGame()
    this.animate()
  }

  resetGame() {
    this.scene.clearStones()
    this.physics.clearStones()

    this.state = {
      phase: 'player_turn',
      playerStonesThrown: 0,
      aiStonesThrown: 0,
      playerScore: 0,
      aiScore: 0,
      winner: null,
      isDragging: false,
      throwPower: 0,
      throwAngle: 0,
      cameraMode: this.state.cameraMode,
      message: '点击并向后拖动冰壶来控制投掷',
      currentStone: null,
    }

    this.spawnPlayerStone()
    this.notifyStateChange()
  }

  resetThrow() {
    if (this.state.phase !== 'player_turn') return

    if (this.state.currentStone) {
      this.scene.removeStone(this.state.currentStone)
      this.physics.removeStone(this.state.currentStone)
    }

    this.state.throwPower = 0
    this.state.throwAngle = 0
    this.state.isDragging = false
    this.dragStart = null
    this.dragCurrent = null
    if (this.previewLine) {
      this.previewLine.visible = false
    }

    this.spawnPlayerStone()
    this.state.message = '点击并向后拖动冰壶来控制投掷'
    this.notifyStateChange()
  }

  private spawnPlayerStone() {
    const stone = new Stone('player', `player_${this.state.playerStonesThrown}`)
    stone.setPosition(GAME_CONFIG.THROW_START_X, GAME_CONFIG.THROW_START_Z)
    this.scene.addStone(stone)
    this.state.currentStone = stone
  }

  private spawnAIStone() {
    const stone = this.ai.createThrow(
      this.scene.stones,
      this.state.playerStonesThrown,
      this.state.aiStonesThrown,
      'ai',
      `ai_${this.state.aiStonesThrown}`,
    )
    this.scene.addStone(stone)
    this.physics.addStone(stone)
    this.camera.setFollowTarget(stone.getMesh())
    this.camera.setMode('follow')
    this.state.cameraMode = 'follow'
    this.state.aiStonesThrown++
  }

  setCameraMode(mode: CameraMode) {
    this.state.cameraMode = mode
    this.camera.setMode(mode)
    this.notifyStateChange()
  }

  private checkGameEnd() {
    if (
      this.state.playerStonesThrown >= GAME_CONFIG.STONES_PER_PLAYER &&
      this.state.aiStonesThrown >= GAME_CONFIG.STONES_PER_PLAYER
    ) {
      const { playerScore, aiScore } = Scoring.calculateScore(
        this.scene.stones,
        this.scene.getHouseCenter(),
      )
      this.state.playerScore = playerScore
      this.state.aiScore = aiScore

      if (playerScore > aiScore) {
        this.state.winner = 'player'
        this.state.message = `恭喜你获胜！玩家: ${playerScore}分 vs AI: ${aiScore}分`
      } else if (aiScore > playerScore) {
        this.state.winner = 'ai'
        this.state.message = `AI获胜！玩家: ${playerScore}分 vs AI: ${aiScore}分`
      } else {
        this.state.winner = 'draw'
        this.state.message = `平局！双方各得 ${playerScore} 分`
      }

      this.state.phase = 'finished'
      this.camera.setFollowTarget(null)
      this.notifyStateChange()
      return true
    }
    return false
  }

  private update() {
    const deltaTime = Math.min(this.clock.getDelta(), 0.1)

    this.physics.update(deltaTime)
    this.camera.update(deltaTime)

    if (this.state.phase === 'calculating') {
      const movingStones = this.physics.stones.filter((s) => s.isMoving)
      const outOfBoundsStones = movingStones.filter((s) => s.isOutOfBounds)

      if (outOfBoundsStones.length > 0) {
        outOfBoundsStones.forEach((stone) => stone.stop())
        this.state.message = '冰壶出界！'
        this.notifyStateChange()
      }
    }

    if (this.state.phase === 'calculating' && this.physics.allStonesStopped()) {
      this.camera.setFollowTarget(null)
      this.camera.setMode('default')
      this.state.cameraMode = 'default'

      if (this.checkGameEnd()) return

      if (this.state.playerStonesThrown > this.state.aiStonesThrown) {
        this.state.phase = 'ai_turn'
        this.state.message = 'AI回合...'
        this.notifyStateChange()

        setTimeout(() => {
          this.spawnAIStone()
          this.state.phase = 'calculating'
          this.notifyStateChange()
        }, 1000)
      } else {
        this.state.phase = 'player_turn'
        this.state.message = '点击并向后拖动冰壶来控制投掷'
        this.spawnPlayerStone()
        this.notifyStateChange()
      }
    }
  }

  private animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this))
    this.update()
    this.renderer.render(this.scene.getScene(), this.camera.getCamera())
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.renderer.dispose()
  }

  getState(): GameStateData {
    return { ...this.state }
  }
}
