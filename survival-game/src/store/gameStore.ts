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

export const BASIC_RESOURCES: ResourceType[] = ['flint', 'twig', 'grass']
export const TOOL_REQUIRED_RESOURCES: Record<ToolType, ResourceType[]> = {
  axe: ['wood'],
  pickaxe: ['stone'],
  torch: [],
  campfire: [],
}

export interface GameMessage {
  text: string
  type: 'success' | 'error' | 'info'
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
  message: GameMessage | null
  showMessage: (text: string, type?: 'success' | 'error' | 'info') => void
  addToInventory: (type: ResourceType | ToolType, count?: number) => void
  removeFromInventory: (type: ResourceType | ToolType, count?: number) => void
  setEquippedTool: (tool: ToolType | null) => void
  setPlayerPosition: (pos: [number, number, number]) => void
  updatePlayerStats: (health?: number, hunger?: number, stamina?: number) => void
  gatherResource: (id: string, equippedTool: ToolType | null) => { success: boolean; message: string }
  attack: () => void
  toggleMap: () => void
  toggleCrafting: () => void
  craftTool: (tool: ToolType) => boolean
  hasResources: (requirements: Partial<Record<ResourceType, number>>) => boolean
}

export const RECIPES: Record<ToolType, Partial<Record<ResourceType, number>>> = {
  axe: { twig: 3, flint: 2, grass: 1 },
  pickaxe: { twig: 2, stone: 3, flint: 1 },
  torch: { twig: 3, grass: 2 },
  campfire: { wood: 3, stone: 2, twig: 2 },
}

export const TOOL_NAMES: Record<ToolType, string> = {
  axe: '斧头',
  pickaxe: '稿子',
  torch: '火把',
  campfire: '火堆',
}

export const RESOURCE_NAMES: Record<ResourceType, string> = {
  wood: '木材',
  stone: '石头',
  flint: '燧石',
  twig: '树枝',
  grass: '草',
}

export const ITEM_ICONS: Record<string, string> = {
  wood: '🪵',
  stone: '🪨',
  flint: '🔥',
  twig: '🌿',
  grass: '🌱',
  axe: '🪓',
  pickaxe: '⛏️',
  torch: '🔦',
  campfire: '🔥',
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
  message: null,

  showMessage: (text, type = 'info') => {
    set({ message: { text, type } })
    setTimeout(() => {
      set((state) => (state.message?.text === text ? { message: null } : {}))
    }, 2000)
  },

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

  gatherResource: (id, equippedTool) => {
    const state = get()
    const resource = state.resources.find((r) => r.id === id)
    if (!resource) return { success: false, message: '资源不存在' }

    const isBasic = BASIC_RESOURCES.includes(resource.type)
    
    if (!isBasic) {
      if (!equippedTool) {
        return { success: false, message: `需要工具才能采集${RESOURCE_NAMES[resource.type]}` }
      }
      
      const canGather = TOOL_REQUIRED_RESOURCES[equippedTool]?.includes(resource.type)
      if (!canGather) {
        const requiredTool = Object.entries(TOOL_REQUIRED_RESOURCES).find(
          ([, resources]) => resources.includes(resource.type)
        )?.[0]
        return { 
          success: false, 
          message: `需要${TOOL_NAMES[requiredTool as ToolType] || '正确的工具'}才能采集${RESOURCE_NAMES[resource.type]}` 
        }
      }
    }

    const baseDamage = isBasic ? 15 : (equippedTool === 'axe' || equippedTool === 'pickaxe' ? 20 : 10)
    const damage = isBasic ? baseDamage : baseDamage
    
    const newHealth = resource.health - damage
    if (newHealth <= 0) {
      const dropCount = isBasic 
        ? Math.floor(Math.random() * 3) + 2 
        : Math.floor(Math.random() * 2) + 3
      get().addToInventory(resource.type, dropCount)
      set({
        resources: state.resources.filter((r) => r.id !== id),
      })
      return { success: true, message: `获得 ${dropCount} 个${RESOURCE_NAMES[resource.type]}` }
    }
    
    set({
      resources: state.resources.map((r) =>
        r.id === id ? { ...r, health: newHealth } : r
      ),
    })
    return { success: true, message: `采集中... ${Math.round((newHealth / resource.maxHealth) * 100)}%` }
  },

  attack: () => {
    set((state) => ({
      playerStamina: Math.max(0, state.playerStamina - 2),
    }))
  },

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

  for (let i = 0; i < 100; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const x = (Math.random() - 0.5) * mapSize * 0.9
    const z = (Math.random() - 0.5) * mapSize * 0.9

    resources.push({
      id: `resource-${i}`,
      type,
      position: [x, 0, z],
      health: type === 'wood' ? 60 : type === 'stone' ? 50 : 20,
      maxHealth: type === 'wood' ? 60 : type === 'stone' ? 50 : 20,
    })
  }

  return resources
}
