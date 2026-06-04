import { create } from 'zustand'

export type ResourceType = 'wood' | 'stone' | 'flint' | 'twig' | 'grass'
export type ToolType = 'axe' | 'pickaxe' | 'torch'
export type BuildingType = 'campfire' | 'chest'

export interface InventoryItem {
  type: ResourceType | ToolType | BuildingType
  count: number
}

export interface ResourceNode {
  id: string
  type: ResourceType
  position: [number, number, number]
  health: number
  maxHealth: number
}

export interface PlacedBuilding {
  id: string
  type: BuildingType
  position: [number, number, number]
  rotation: number
  inventory: InventoryItem[]
}

export const BASIC_RESOURCES: ResourceType[] = ['flint', 'twig', 'grass']
export const TOOL_REQUIRED_RESOURCES: Record<ToolType, ResourceType[]> = {
  axe: ['wood'],
  pickaxe: ['stone'],
  torch: [],
}

export interface GameMessage {
  text: string
  type: 'success' | 'error' | 'info'
}

export interface PlacementState {
  isActive: boolean
  buildingType: BuildingType | null
  position: [number, number, number] | null
  rotation: number
  isValid: boolean
  snapToGrid: boolean
}

export type TimeOfDay = 'day' | 'dusk' | 'night'

export interface GameState {
  playerPosition: [number, number, number]
  playerHealth: number
  playerHunger: number
  playerStamina: number
  inventory: InventoryItem[]
  equippedTool: ToolType | null
  resources: ResourceNode[]
  buildings: PlacedBuilding[]
  showMap: boolean
  showCrafting: boolean
  mapSize: number
  message: GameMessage | null
  infiniteBuild: boolean
  placement: PlacementState
  openedContainerId: string | null
  timeOfDay: TimeOfDay
  gameTime: number
  timeSpeed: number
  day: number
  showDevTools: boolean
  showMessage: (text: string, type?: 'success' | 'error' | 'info') => void
  addToInventory: (type: ResourceType | ToolType | BuildingType, count?: number) => void
  removeFromInventory: (type: ResourceType | ToolType | BuildingType, count?: number) => void
  setEquippedTool: (tool: ToolType | null) => void
  setPlayerPosition: (pos: [number, number, number]) => void
  updatePlayerStats: (health?: number, hunger?: number, stamina?: number) => void
  gatherResource: (id: string, equippedTool: ToolType | null) => { success: boolean; message: string }
  attack: () => void
  toggleMap: () => void
  toggleCrafting: () => void
  craftTool: (tool: ToolType) => boolean
  craftBuilding: (building: BuildingType) => boolean
  hasResources: (requirements: Partial<Record<ResourceType, number>>) => boolean
  toggleInfiniteBuild: () => void
  startPlacement: (type: BuildingType) => void
  cancelPlacement: () => void
  updatePlacementPosition: (pos: [number, number, number]) => void
  updatePlacementRotation: (rotation: number) => void
  setPlacementValidity: (isValid: boolean) => void
  toggleSnapToGrid: () => void
  confirmPlacement: () => boolean
  openContainer: (id: string | null) => void
  addItemToContainer: (containerId: string, type: ResourceType | ToolType, count?: number) => void
  removeItemFromContainer: (containerId: string, type: ResourceType | ToolType, count?: number) => void
  moveItemToContainer: (containerId: string, type: ResourceType | ToolType, count?: number) => void
  moveItemFromContainer: (containerId: string, type: ResourceType | ToolType, count?: number) => void
  updateGameTime: (delta: number) => void
  setTimeSpeed: (speed: number) => void
  setGameTime: (time: number) => void
  toggleDevTools: () => void
}

export const TOOL_RECIPES: Record<ToolType, Partial<Record<ResourceType, number>>> = {
  axe: { twig: 4, flint: 3, grass: 2 },
  pickaxe: { twig: 3, flint: 4, grass: 2 },
  torch: { twig: 3, grass: 2, flint: 1 },
}

export const BUILDING_RECIPES: Record<BuildingType, Partial<Record<ResourceType, number>>> = {
  campfire: { wood: 4, twig: 3, grass: 2, flint: 2 },
  chest: { wood: 6, twig: 4, flint: 2 },
}

export const TOOL_NAMES: Record<ToolType, string> = {
  axe: '斧头',
  pickaxe: '稿子',
  torch: '火把',
}

export const BUILDING_NAMES: Record<BuildingType, string> = {
  campfire: '火堆',
  chest: '箱子',
}

export const TOOL_DESCRIPTIONS: Record<ToolType, string> = {
  axe: '用于砍伐树木获取木材',
  pickaxe: '用于挖掘岩石获取石头',
  torch: '照明工具，可在黑暗中照亮周围',
}

export const BUILDING_DESCRIPTIONS: Record<BuildingType, string> = {
  campfire: '提供温暖和光照，可以烹饪食物',
  chest: '用于存储物品，可以放入各种资源',
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
  chest: '📦',
}

export const RECIPES = { ...TOOL_RECIPES, ...BUILDING_RECIPES }

const GRID_SIZE = 1

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

function checkPlacementCollision(
  position: [number, number, number],
  buildings: PlacedBuilding[],
  resources: ResourceNode[],
  playerPosition: [number, number, number]
): boolean {
  for (const building of buildings) {
    const dx = Math.abs(position[0] - building.position[0])
    const dz = Math.abs(position[2] - building.position[2])
    if (dx < 1.5 && dz < 1.5) return false
  }

  const dx = Math.abs(position[0] - playerPosition[0])
  const dz = Math.abs(position[2] - playerPosition[2])
  if (dx < 1.0 && dz < 1.0) return false

  for (const resource of resources) {
    const rdx = Math.abs(position[0] - resource.position[0])
    const rdz = Math.abs(position[2] - resource.position[2])
    if (rdx < 1.0 && rdz < 1.0) return false
  }

  return true
}

export const useGameStore = create<GameState>((set, get) => ({
  playerPosition: [0, 1, 0],
  playerHealth: 100,
  playerHunger: 100,
  playerStamina: 100,
  inventory: [],
  equippedTool: null,
  resources: [],
  buildings: [],
  showMap: false,
  showCrafting: false,
  mapSize: 100,
  message: null,
  infiniteBuild: false,
  placement: {
    isActive: false,
    buildingType: null,
    position: null,
    rotation: 0,
    isValid: false,
    snapToGrid: true,
  },
  openedContainerId: null,
  timeOfDay: 'day',
  gameTime: 0,
  timeSpeed: 1,
  day: 1,
  showDevTools: false,

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
    if (get().infiniteBuild) return true
    const state = get()
    return Object.entries(requirements).every(([type, count]) => {
      const item = state.inventory.find((i) => i.type === type)
      return item && item.count >= (count || 0)
    })
  },

  craftTool: (tool) => {
    const requirements = TOOL_RECIPES[tool]
    if (!get().hasResources(requirements)) return false

    if (!get().infiniteBuild) {
      Object.entries(requirements).forEach(([type, count]) => {
        get().removeFromInventory(type as ResourceType, count)
      })
    }
    get().addToInventory(tool)
    return true
  },

  craftBuilding: (building) => {
    const requirements = BUILDING_RECIPES[building]
    if (!get().hasResources(requirements)) return false

    if (!get().infiniteBuild) {
      Object.entries(requirements).forEach(([type, count]) => {
        get().removeFromInventory(type as ResourceType, count)
      })
    }
    get().startPlacement(building)
    return true
  },

  toggleInfiniteBuild: () => set((state) => ({ infiniteBuild: !state.infiniteBuild })),

  startPlacement: (type) => {
    set({
      placement: {
        isActive: true,
        buildingType: type,
        position: null,
        rotation: 0,
        isValid: false,
        snapToGrid: true,
      },
    })
    get().showMessage(`🔨 放置${BUILDING_NAMES[type]}：鼠标移动定位，R旋转，点击确认，ESC取消`, 'info')
  },

  cancelPlacement: () => {
    set({
      placement: {
        isActive: false,
        buildingType: null,
        position: null,
        rotation: 0,
        isValid: false,
        snapToGrid: true,
      },
    })
    get().showMessage('❌ 取消放置', 'info')
  },

  updatePlacementPosition: (pos) => {
    const state = get()
    if (!state.placement.isActive) return

    const finalPos: [number, number, number] = state.placement.snapToGrid
      ? [snapToGrid(pos[0]), pos[1], snapToGrid(pos[2])]
      : [pos[0], pos[1], pos[2]]

    const halfMap = state.mapSize / 2 - 1
    const inBounds = Math.abs(finalPos[0]) < halfMap && Math.abs(finalPos[2]) < halfMap
    const noCollision = checkPlacementCollision(finalPos, state.buildings, state.resources, state.playerPosition)
    const isValid = inBounds && noCollision

    set({
      placement: {
        ...state.placement,
        position: finalPos,
        isValid,
      },
    })
  },

  updatePlacementRotation: (rotation) => {
    set((state) => ({
      placement: { ...state.placement, rotation },
    }))
  },

  setPlacementValidity: (isValid) => {
    set((state) => ({
      placement: { ...state.placement, isValid },
    }))
  },

  toggleSnapToGrid: () => {
    set((state) => ({
      placement: { ...state.placement, snapToGrid: !state.placement.snapToGrid },
    }))
  },

  confirmPlacement: () => {
    const state = get()
    if (!state.placement.isActive || !state.placement.position || !state.placement.isValid) {
      return false
    }

    const newBuilding: PlacedBuilding = {
      id: `building-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: state.placement.buildingType!,
      position: [...state.placement.position] as [number, number, number],
      rotation: state.placement.rotation,
      inventory: [],
    }

    set({
      buildings: [...state.buildings, newBuilding],
      placement: {
        isActive: false,
        buildingType: null,
        position: null,
        rotation: 0,
        isValid: false,
        snapToGrid: true,
      },
    })

    get().showMessage(`✅ 成功放置${BUILDING_NAMES[newBuilding.type]}！`, 'success')
    return true
  },

  openContainer: (id) => set({ openedContainerId: id }),

  addItemToContainer: (containerId, type, count = 1) => {
    set((state) => ({
      buildings: state.buildings.map((b) => {
        if (b.id !== containerId) return b
        const existing = b.inventory.find((i) => i.type === type)
        if (existing) {
          return {
            ...b,
            inventory: b.inventory.map((i) =>
              i.type === type ? { ...i, count: i.count + count } : i
            ),
          }
        }
        return { ...b, inventory: [...b.inventory, { type, count }] }
      }),
    }))
  },

  removeItemFromContainer: (containerId, type, count = 1) => {
    set((state) => ({
      buildings: state.buildings.map((b) => {
        if (b.id !== containerId) return b
        return {
          ...b,
          inventory: b.inventory
            .map((i) => (i.type === type ? { ...i, count: i.count - count } : i))
            .filter((i) => i.count > 0),
        }
      }),
    }))
  },

  moveItemToContainer: (containerId, type, count = 1) => {
    const state = get()
    const item = state.inventory.find((i) => i.type === type)
    if (!item || item.count < count) return

    get().removeFromInventory(type, count)
    get().addItemToContainer(containerId, type, count)
    get().showMessage(`📦 放入 ${count} 个${RESOURCE_NAMES[type as ResourceType] || type}`, 'success')
  },

  moveItemFromContainer: (containerId, type, count = 1) => {
    const state = get()
    const building = state.buildings.find((b) => b.id === containerId)
    if (!building) return
    const item = building.inventory.find((i) => i.type === type)
    if (!item || item.count < count) return

    get().removeItemFromContainer(containerId, type, count)
    get().addToInventory(type, count)
    get().showMessage(`📦 取出 ${count} 个${RESOURCE_NAMES[type as ResourceType] || type}`, 'success')
  },

  updateGameTime: (delta) => {
    const state = get()
    const totalTime = state.gameTime + delta * state.timeSpeed
    const newTime = totalTime % 16
    const newDay = state.day + Math.floor(totalTime / 16)

    let newTimeOfDay: TimeOfDay
    if (newTime >= 0 && newTime < 8) {
      newTimeOfDay = 'day'
    } else if (newTime >= 8 && newTime < 12) {
      newTimeOfDay = 'dusk'
    } else {
      newTimeOfDay = 'night'
    }

    const hungerRate = 75 / 16
    const newHunger = Math.max(0, state.playerHunger - hungerRate * delta * state.timeSpeed)

    set({
      gameTime: newTime,
      day: newDay > state.day ? newDay : state.day,
      timeOfDay: newTimeOfDay,
      playerHunger: newHunger,
    })
  },

  setTimeSpeed: (speed) => set({ timeSpeed: speed }),

  setGameTime: (time) => {
    const clampedTime = Math.max(0, Math.min(16, time))
    let newTimeOfDay: TimeOfDay
    if (clampedTime >= 0 && clampedTime < 8) {
      newTimeOfDay = 'day'
    } else if (clampedTime >= 8 && clampedTime < 12) {
      newTimeOfDay = 'dusk'
    } else {
      newTimeOfDay = 'night'
    }
    set({ gameTime: clampedTime, timeOfDay: newTimeOfDay })
  },

  toggleDevTools: () => set((state) => ({ showDevTools: !state.showDevTools })),
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
