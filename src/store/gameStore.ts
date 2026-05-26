import { create } from 'zustand'
import * as THREE from 'three'

interface GameRecord {
  id: string
  score: number
  date: string
}

interface Arrow {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  isActive: boolean
}

interface Target {
  id: string
  position: THREE.Vector3
  type: 'static' | 'moving'
  moveRange: number
  moveSpeed: number
  initialX: number
  isHit: boolean
}

interface GameState {
  score: number
  timeLeft: number
  isPlaying: boolean
  isGameOver: boolean
  isCharging: boolean
  chargeProgress: number
  arrows: Arrow[]
  targets: Target[]
  horsePosition: number
  cameraOffset: THREE.Vector3
  history: GameRecord[]
  aimPosition: { x: number; y: number }
  setScore: (score: number) => void
  setTimeLeft: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setIsGameOver: (over: boolean) => void
  setIsCharging: (charging: boolean) => void
  setChargeProgress: (progress: number) => void
  addArrow: (arrow: Arrow) => void
  updateArrow: (id: string, position: THREE.Vector3, velocity: THREE.Vector3) => void
  deactivateArrow: (id: string) => void
  setTargets: (targets: Target[]) => void
  updateTargetPosition: (id: string, position: THREE.Vector3) => void
  hitTarget: (id: string) => void
  setHorsePosition: (pos: number) => void
  setAimPosition: (x: number, y: number) => void
  addScore: (points: number) => void
  saveScore: (score: number) => void
  loadHistory: () => void
  resetGame: () => void
}

const initialTargets: Target[] = [
  { id: 'target1', position: new THREE.Vector3(8, 2, -25), type: 'static', moveRange: 0, moveSpeed: 0, initialX: 8, isHit: false },
  { id: 'target2', position: new THREE.Vector3(-8, 2.5, -40), type: 'moving', moveRange: 3, moveSpeed: 1.5, initialX: -8, isHit: false },
  { id: 'target3', position: new THREE.Vector3(10, 2.2, -55), type: 'static', moveRange: 0, moveSpeed: 0, initialX: 10, isHit: false },
  { id: 'target4', position: new THREE.Vector3(-10, 1.8, -70), type: 'moving', moveRange: 4, moveSpeed: 2, initialX: -10, isHit: false },
  { id: 'target5', position: new THREE.Vector3(9, 2.5, -85), type: 'static', moveRange: 0, moveSpeed: 0, initialX: 9, isHit: false },
  { id: 'target6', position: new THREE.Vector3(-9, 2, -100), type: 'moving', moveRange: 5, moveSpeed: 2.5, initialX: -9, isHit: false },
  { id: 'target7', position: new THREE.Vector3(11, 2.3, -115), type: 'static', moveRange: 0, moveSpeed: 0, initialX: 11, isHit: false },
  { id: 'target8', position: new THREE.Vector3(-11, 2.6, -130), type: 'moving', moveRange: 4, moveSpeed: 2, initialX: -11, isHit: false },
]

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  timeLeft: 30,
  isPlaying: false,
  isGameOver: false,
  isCharging: false,
  chargeProgress: 0,
  arrows: [],
  targets: initialTargets,
  horsePosition: 0,
  cameraOffset: new THREE.Vector3(0, 2.5, 5),
  history: [],
  aimPosition: { x: 0, y: 0 },
  setScore: (score) => set({ score }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsGameOver: (over) => set({ isGameOver: over }),
  setIsCharging: (charging) => set({ isCharging: charging }),
  setChargeProgress: (progress) => set({ chargeProgress: Math.min(1, Math.max(0, progress)) }),
  addArrow: (arrow) => set((state) => ({ arrows: [...state.arrows, arrow] })),
  updateArrow: (id, position, velocity) =>
    set((state) => ({
      arrows: state.arrows.map((a) =>
        a.id === id ? { ...a, position, velocity } : a
      ),
    })),
  deactivateArrow: (id) =>
    set((state) => ({
      arrows: state.arrows.map((a) =>
        a.id === id ? { ...a, isActive: false } : a
      ),
    })),
  setTargets: (targets) => set({ targets }),
  updateTargetPosition: (id, position) =>
    set((state) => ({
      targets: state.targets.map((t) =>
        t.id === id ? { ...t, position } : t
      ),
    })),
  hitTarget: (id) =>
    set((state) => ({
      targets: state.targets.map((t) =>
        t.id === id ? { ...t, isHit: true } : t
      ),
    })),
  setHorsePosition: (pos) => set({ horsePosition: pos }),
  setAimPosition: (x, y) => set({ aimPosition: { x, y } }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  saveScore: (score) => {
    const record: GameRecord = {
      id: Date.now().toString(),
      score,
      date: new Date().toLocaleString('zh-CN'),
    }
    const history = JSON.parse(localStorage.getItem('archeryHistory') || '[]')
    history.unshift(record)
    if (history.length > 10) history.pop()
    localStorage.setItem('archeryHistory', JSON.stringify(history))
    set({ history })
  },
  loadHistory: () => {
    const history = JSON.parse(localStorage.getItem('archeryHistory') || '[]')
    set({ history })
  },
  resetGame: () =>
    set({
      score: 0,
      timeLeft: 30,
      isPlaying: true,
      isGameOver: false,
      isCharging: false,
      chargeProgress: 0,
      arrows: [],
      targets: initialTargets.map((t) => ({ ...t, isHit: false, position: new THREE.Vector3(t.initialX, t.position.y, t.position.z) })),
      horsePosition: 0,
      aimPosition: { x: 0, y: 0 },
    }),
}))
