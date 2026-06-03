import { create } from 'zustand'

export type ResourceType = 'wood' | 'stone' | 'flint' | 'twig' | 'grass'
export type ToolType = 'axe' | 'pickaxe' | 'torch' | 'campfire'

export interface InventoryItem {
  type: ResourceType | ToolType
  count: number
}

export interface ResourceNode {
  id: string
  type: ResourceType
  position: [number, number, number]
  health: number
  maxHealth: number
}

export interface GameState {
  playerPosition: [number, number, number]
  playerHealth: number
  playerHunger: number
  playerStamina: number
  inventory: InventoryItem[]
  equippedTool: ToolType | null
  resources: ResourceNode[]
  showMap: boolean
  showCrafting: boolean
  mapSize: number
  addToInventory: (type: ResourceType | ToolType, count?: number) => void
  removeFromInventory: (type: ResourceType | ToolType, count?: number) => void
  setEquippedTool: (tool: ToolType | null) => void
  setPlayerPosition: (pos: [number, number, number]) => void
  updatePlayerStats: (health?: number, hunger?: number, stamina?: number) => void
  damageResource: (id: string, damage: number) => void
  toggleMap: () => void
  toggleCrafting: () => void
  craftTool: (tool: ToolType) => boolean
  hasResources: (requirements: Partial<Record<ResourceType, number>>) => boolean
}

export const RECIPES: Record<ToolType, Partial<Record<ResourceType, number>>> = {
  axe: { wood: 3, stone: 2 },
  pickaxe: { wood: 2, stone: 3, flint: 1 },
  torch: { wood: 2, twig: 3 },
  campfire: { wood: 5, stone: 3 },
}

export const useGameStore = create<GameState>((set, get) => ({
  playerPosition: [0, 1, 0],
  playerHealth: 100,
  playerHunger: 100,
  playerStamina: 100,
  inventory: [],
  equippedTool: null,
  resources: [],
  showMap: false,
  showCrafting: false,
  mapSize: 100,

  addToInventory: (type, count = 1) =>
    set((state) => {
      const existing = state.inventory.find((i) => i.type === type)
      if (existing) {
        return {
          inventory: state.inventory.map((i) =>
            i.type === type ? { ...i, count: i.count + count } : i
          ),
        }
      }
      return { inventory: [...state.inventory, { type, count }] }
    }),

  removeFromInventory: (type, count = 1) =>
    set((state) => ({
      inventory: state.inventory
        .map((i) => (i.type === type ? { ...i, count: i.count - count } : i))
        .filter((i) => i.count > 0),
    })),

  setEquippedTool: (tool) => set({ equippedTool: tool }),

  setPlayerPosition: (pos) => set({ playerPosition: pos }),

  updatePlayerStats: (health, hunger, stamina) =>
    set((state) => ({
      playerHealth: health ?? state.playerHealth,
      playerHunger: hunger ?? state.playerHunger,
      playerStamina: stamina ?? state.playerStamina,
    })),

  damageResource: (id, damage) =>
    set((state) => {
      const resource = state.resources.find((r) => r.id === id)
      if (!resource) return state

      const newHealth = resource.health - damage
      if (newHealth <= 0) {
        get().addToInventory(resource.type, Math.floor(Math.random() * 3) + 2)
        return {
          resources: state.resources.filter((r) => r.id !== id),
        }
      }
      return {
        resources: state.resources.map((r) =>
          r.id === id ? { ...r, health: newHealth } : r
        ),
      }
    }),

  toggleMap: () => set((state) => ({ showMap: !state.showMap })),

  toggleCrafting: () => set((state) => ({ showCrafting: !state.showCrafting })),

  hasResources: (requirements) => {
    const state = get()
    return Object.entries(requirements).every(([type, count]) => {
      const item = state.inventory.find((i) => i.type === type)
      return item && item.count >= (count || 0)
    })
  },

  craftTool: (tool) => {
    const requirements = RECIPES[tool]
    if (!get().hasResources(requirements)) return false

    Object.entries(requirements).forEach(([type, count]) => {
      get().removeFromInventory(type as ResourceType, count)
    })
    get().addToInventory(tool)
    return true
  },
}))

export function generateResources(mapSize: number): ResourceNode[] {
  const resources: ResourceNode[] = []
  const types: ResourceType[] = ['wood', 'stone', 'flint', 'twig', 'grass']

  for (let i = 0; i < 80; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const x = (Math.random() - 0.5) * mapSize * 0.9
    const z = (Math.random() - 0.5) * mapSize * 0.9

    resources.push({
      id: `resource-${i}`,
      type,
      position: [x, 0, z],
      health: type === 'wood' ? 50 : type === 'stone' ? 40 : 15,
      maxHealth: type === 'wood' ? 50 : type === 'stone' ? 40 : 15,
    })
  }

  return resources
}
