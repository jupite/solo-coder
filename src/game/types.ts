import * as THREE from 'three'

export type Team = 'player' | 'ai'

export type GamePhase =
  | 'idle'
  | 'player_turn'
  | 'ai_turn'
  | 'calculating'
  | 'finished'

export type CameraMode = 'default' | 'follow' | 'top'

export interface StoneState {
  id: string
  team: Team
  position: THREE.Vector3
  velocity: THREE.Vector2
  isMoving: boolean
  mesh: THREE.Mesh | null
}

export interface GameState {
  phase: GamePhase
  playerStonesThrown: number
  aiStonesThrown: number
  playerScore: number
  aiScore: number
  winner: Team | 'draw' | null
  isDragging: boolean
  dragStart: { x: number; y: number } | null
  dragCurrent: { x: number; y: number } | null
  throwPower: number
  throwAngle: number
  cameraMode: CameraMode
  currentStone: StoneState | null
  stones: StoneState[]
  message: string
}

export interface ScoreDetail {
  team: Team
  distance: number
  score: number
}
