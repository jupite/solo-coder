import { create } from 'zustand'
import type { GameStateData } from '../game/Game'
import type { CameraMode } from '../game/types'

interface GameStore extends GameStateData {
  gameRef: any
  setGameRef: (ref: any) => void
  updateState: (state: Partial<GameStateData>) => void
  resetGame: () => void
  resetThrow: () => void
  setCameraMode: (mode: CameraMode) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
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
  message: '加载中...',
  currentStone: null,
  gameRef: null,

  setGameRef: (ref) => set({ gameRef: ref }),

  updateState: (state) => set(state),

  resetGame: () => {
    const { gameRef } = get()
    if (gameRef) {
      gameRef.resetGame()
    }
  },

  resetThrow: () => {
    const { gameRef } = get()
    if (gameRef) {
      gameRef.resetThrow()
    }
  },

  setCameraMode: (mode) => {
    const { gameRef } = get()
    if (gameRef) {
      gameRef.setCameraMode(mode)
    }
  },
}))
