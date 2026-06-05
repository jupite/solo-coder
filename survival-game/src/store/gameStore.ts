import { create } from 'zustand'

export type ResourceType = 'wood' | 'stone' | 'flint' | 'twig' | 'grass'
export type ToolType = 'axe' | 'pickaxe' | 'torch'
export type EquipmentType = 'helmet' | 'armor' | 'spear'
export type ItemType = ResourceType | ToolType | EquipmentType
export type BuildingType = 'campfire' | 'chest'
export type EquipSlotType = 'head' | 'body' | 'hand'

export interface InventoryItem {
  type: ItemType
  count: number
  durability?: number
  maxDurability?: number
}

export interface EquipmentSlot {
  slot: EquipSlotType
  item: InventoryItem | null
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

export interface Monster {
  id: string
  type: 'pigman'
  position: [number, number, number]
  health: number
  maxHealth: number
  damage: number
  attackRange: number
  detectRange: number
  isAggro: boolean
  lastAttackTime: number
  targetPosition: [number, number, number] | null
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
  playerMaxHealth: number
  playerHunger: number
  playerStamina: number
  inventory: (InventoryItem | null)[]
  equipment: Record<EquipSlotType, InventoryItem | null>
  equippedTool: ToolType | null
  resources: ResourceNode[]
  buildings: PlacedBuilding[]
  monsters: Monster[]
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
  lastAttackTime: number
  showMessage: (text: string, type?: 'success' | 'error' | 'info') => void
  addToInventory: (type: ItemType, count?: number, durability?: number, maxDurability?: number) => boolean
  removeFromInventory: (index: number, count?: number) => void
  moveInventoryItem: (fromIndex: number, toIndex: number) => void
  setEquippedTool: (tool: ToolType | null) => void
  equipItem: (inventoryIndex: number, slot: EquipSlotType) => void
  unequipItem: (slot: EquipSlotType) => void
  reduceDurability: (slot: EquipSlotType, amount?: number) => void
  calculateDamage: (baseDamage: number) => number
  takeDamage: (damage: number) => void
  setPlayerPosition: (pos: [number, number, number]) => void
  updatePlayerStats: (health?: number, hunger?: number, stamina?: number) => void
  gatherResource: (id: string, equippedTool: ToolType | null) => { success: boolean; message: string }
  attack: () => void
  toggleMap: () => void
  toggleCrafting: () => void
  craftTool: (tool: ToolType) => boolean
  craftEquipment: (equipment: EquipmentType) => boolean
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
  addItemToContainer: (containerId: string, type: ItemType, count?: number) => void
  removeItemFromContainer: (containerId: string, type: ItemType, count?: number) => void
  moveItemToContainer: (containerId: string, inventoryIndex: number, count?: number) => void
  moveItemFromContainer: (containerId: string, containerIndex: number, count?: number) => void
  updateGameTime: (delta: number) => void
  setTimeSpeed: (speed: number) => void
  setGameTime: (time: number) => void
  toggleDevTools: () => void
  updateMonster: (monsterId: string, updates: Partial<Monster>) => void
  damageMonster: (monsterId: string, damage: number) => void
}

export const TOOL_RECIPES: Record<ToolType, Partial<Record<ResourceType, number>>> = {
  axe: { twig: 4, flint: 3, grass: 2 },
  pickaxe: { twig: 3, flint: 4, grass: 2 },
  torch: { twig: 3, grass: 2, flint: 1 },
}

export const EQUIPMENT_RECIPES: Record<EquipmentType, Partial<Record<ResourceType, number>>> = {
  helmet: { stone: 5, wood: 3, grass: 2 },
  armor: { stone: 8, wood: 5, grass: 3 },
  spear: { wood: 6, flint: 4, grass: 2 },
}

export const EQUIPMENT_STATS: Record<EquipmentType, { damageReduction?: number; damage?: number; durability: number; equipSlot: EquipSlotType }> = {
  helmet: { damageReduction: 0.2, durability: 100, equipSlot: 'head' },
  armor: { damageReduction: 0.4, durability: 150, equipSlot: 'body' },
  spear: { damage: 25, durability: 80, equipSlot: 'hand' },
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

export const EQUIPMENT_NAMES: Record<EquipmentType, string> = {
  helmet: '头盔',
  armor: '盔甲',
  spear: '长矛',
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

export const EQUIPMENT_DESCRIPTIONS: Record<EquipmentType, string> = {
  helmet: '保护头部，减少20%受到的伤害',
  armor: '保护身体，减少40%受到的伤害',
  spear: '近战武器，增加25点攻击力',
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
  helmet: '⛑️',
  armor: '🛡️',
  spear: '🔱',
  campfire: '🔥',
  chest: '📦',
}

export const RECIPES = { ...TOOL_RECIPES, ...EQUIPMENT_RECIPES, ...BUILDING_RECIPES }

const GRID_SIZE = 1
const INVENTORY_SIZE = 15

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

function isEquipment(type: ItemType): type is EquipmentType {
  return ['helmet', 'armor', 'spear'].includes(type)
}

export const useGameStore = create<GameState>((set, get) => ({
  playerPosition: [0, 1, 0],
  playerHealth: 100,
  playerMaxHealth: 100,
  playerHunger: 100,
  playerStamina: 100,
  inventory: Array(INVENTORY_SIZE).fill(null),
  equipment: {
    head: null,
    body: null,
    hand: null,
  },
  equippedTool: null,
  resources: [],
  buildings: [],
  monsters: [],
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
  lastAttackTime: 0,

  showMessage: (text, type = 'info') => {
    set({ message: { text, type } })
    setTimeout(() => {
      set((state) => (state.message?.text === text ? { message: null } : {}))
    }, 2000)
  },

  addToInventory: (type, count = 1, durability, maxDurability) => {
    const state = get()
    const isEquip = isEquipment(type)

    if (isEquip) {
      const emptyIndex = state.inventory.findIndex((item) => item === null)
      if (emptyIndex === -1) {
        get().showMessage('❌ 背包已满', 'error')
        return false
      }
      const stats = EQUIPMENT_STATS[type]
      const newInventory = [...state.inventory]
      newInventory[emptyIndex] = {
        type,
        count: 1,
        durability: durability ?? stats.durability,
        maxDurability: maxDurability ?? stats.durability,
      }
      set({ inventory: newInventory })
      return true
    }

    const existingIndex = state.inventory.findIndex(
      (item) => item !== null && item.type === type && !isEquipment(item.type)
    )

    if (existingIndex !== -1) {
      const newInventory = [...state.inventory]
      newInventory[existingIndex] = {
        ...newInventory[existingIndex]!,
        count: newInventory[existingIndex]!.count + count,
      }
      set({ inventory: newInventory })
      return true
    }

    const emptyIndex = state.inventory.findIndex((item) => item === null)
    if (emptyIndex === -1) {
      get().showMessage('❌ 背包已满', 'error')
      return false
    }

    const newInventory = [...state.inventory]
    newInventory[emptyIndex] = { type, count }
    set({ inventory: newInventory })
    return true
  },

  removeFromInventory: (index, count = 1) => {
    set((state) => {
      const item = state.inventory[index]
      if (!item) return state

      if (item.count <= count) {
        const newInventory = [...state.inventory]
        newInventory[index] = null
        return { inventory: newInventory }
      }

      const newInventory = [...state.inventory]
      newInventory[index] = { ...item, count: item.count - count }
      return { inventory: newInventory }
    })
  },

  moveInventoryItem: (fromIndex, toIndex) => {
    set((state) => {
      if (fromIndex === toIndex) return state
      const newInventory = [...state.inventory]
      const temp = newInventory[fromIndex]
      newInventory[fromIndex] = newInventory[toIndex]
      newInventory[toIndex] = temp
      return { inventory: newInventory }
    })
  },

  setEquippedTool: (tool) => set({ equippedTool: tool }),

  equipItem: (inventoryIndex, slot) => {
    const state = get()
    const item = state.inventory[inventoryIndex]
    if (!item) return

    const equipmentType = item.type as EquipmentType
    if (!isEquipment(equipmentType)) return

    const stats = EQUIPMENT_STATS[equipmentType]
    if (stats.equipSlot !== slot) {
      get().showMessage('❌ 该装备不能放入此栏位', 'error')
      return
    }

    set((state) => {
      const newInventory = [...state.inventory]
      const currentEquipped = state.equipment[slot]

      newInventory[inventoryIndex] = currentEquipped

      return {
        inventory: newInventory,
        equipment: {
          ...state.equipment,
          [slot]: { ...item, count: 1 },
        },
      }
    })

    get().showMessage(`✅ 已装备 ${EQUIPMENT_NAMES[equipmentType]}`, 'success')
  },

  unequipItem: (slot) => {
    const state = get()
    const item = state.equipment[slot]
    if (!item) return

    const emptyIndex = state.inventory.findIndex((i) => i === null)
    if (emptyIndex === -1) {
      get().showMessage('❌ 背包已满，无法卸下装备', 'error')
      return
    }

    set((state) => {
      const newInventory = [...state.inventory]
      newInventory[emptyIndex] = item

      return {
        inventory: newInventory,
        equipment: {
          ...state.equipment,
          [slot]: null,
        },
      }
    })

    get().showMessage(`✅ 已卸下装备`, 'success')
  },

  reduceDurability: (slot, amount = 1) => {
    set((state) => {
      const item = state.equipment[slot]
      if (!item || !item.durability) return state

      const newDurability = item.durability - amount
      if (newDurability <= 0) {
        get().showMessage(`❌ ${EQUIPMENT_NAMES[item.type as EquipmentType]} 已损坏`, 'error')
        return {
          equipment: {
            ...state.equipment,
            [slot]: null,
          },
        }
      }

      return {
        equipment: {
          ...state.equipment,
          [slot]: { ...item, durability: newDurability },
        },
      }
    })
  },

  calculateDamage: (baseDamage) => {
    const state = get()
    let damage = baseDamage

    const helmet = state.equipment.head
    if (helmet) {
      const reduction = EQUIPMENT_STATS[helmet.type as EquipmentType].damageReduction || 0
      damage *= (1 - reduction)
    }

    const armor = state.equipment.body
    if (armor) {
      const reduction = EQUIPMENT_STATS[armor.type as EquipmentType].damageReduction || 0
      damage *= (1 - reduction)
    }

    return Math.max(1, Math.floor(damage))
  },

  takeDamage: (damage) => {
    const state = get()
    const actualDamage = state.calculateDamage(damage)
    
    if (state.equipment.head) state.reduceDurability('head', Math.ceil(damage * 0.1))
    if (state.equipment.body) state.reduceDurability('body', Math.ceil(damage * 0.15))

    const newHealth = Math.max(0, state.playerHealth - actualDamage)
    set({ playerHealth: newHealth })

    if (newHealth <= 0) {
      get().showMessage('💀 你被击败了！', 'error')
    } else {
      get().showMessage(`💥 受到 ${actualDamage} 点伤害`, 'error')
    }
  },

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
    const state = get()
    const now = Date.now()
    
    if (now - state.lastAttackTime < 1000) return
    set({ lastAttackTime: now })

    let baseDamage = 10
    const handItem = state.equipment.hand
    if (handItem && handItem.type === 'spear') {
      baseDamage = EQUIPMENT_STATS.spear.damage || 10
      state.reduceDurability('hand', 2)
    }

    for (const monster of state.monsters) {
      const dist = Math.sqrt(
        Math.pow(monster.position[0] - state.playerPosition[0], 2) +
        Math.pow(monster.position[2] - state.playerPosition[2], 2)
      )
      if (dist < 3) {
        state.damageMonster(monster.id, baseDamage)
        set((s) => ({
          monsters: s.monsters.map((m) =>
            m.id === monster.id ? { ...m, isAggro: true } : m
          ),
        }))
        get().showMessage(`⚔️ 攻击造成 ${baseDamage} 点伤害！`, 'info')
        break
      }
    }

    set((state) => ({
      playerStamina: Math.max(0, state.playerStamina - 5),
    }))
  },

  toggleMap: () => set((state) => ({ showMap: !state.showMap })),

  toggleCrafting: () => set((state) => ({ showCrafting: !state.showCrafting })),

  hasResources: (requirements) => {
    if (get().infiniteBuild) return true
    const state = get()
    return Object.entries(requirements).every(([type, count]) => {
      const item = state.inventory.find((i) => i?.type === type)
      return item && item.count >= (count || 0)
    })
  },

  craftTool: (tool) => {
    const requirements = TOOL_RECIPES[tool]
    if (!get().hasResources(requirements)) return false

    if (!get().infiniteBuild) {
      Object.entries(requirements).forEach(([type, count]) => {
        const state = get()
        const index = state.inventory.findIndex((i) => i?.type === type)
        if (index !== -1) {
          get().removeFromInventory(index, count)
        }
      })
    }
    get().addToInventory(tool)
    return true
  },

  craftEquipment: (equipment) => {
    const requirements = EQUIPMENT_RECIPES[equipment]
    if (!get().hasResources(requirements)) return false

    if (!get().infiniteBuild) {
      Object.entries(requirements).forEach(([type, count]) => {
        const state = get()
        const index = state.inventory.findIndex((i) => i?.type === type)
        if (index !== -1) {
          get().removeFromInventory(index, count)
        }
      })
    }
    return get().addToInventory(equipment)
  },

  craftBuilding: (building) => {
    const requirements = BUILDING_RECIPES[building]
    if (!get().hasResources(requirements)) return false

    if (!get().infiniteBuild) {
      Object.entries(requirements).forEach(([type, count]) => {
        const state = get()
        const index = state.inventory.findIndex((i) => i?.type === type)
        if (index !== -1) {
          get().removeFromInventory(index, count)
        }
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

  moveItemToContainer: (containerId, inventoryIndex, count = 1) => {
    const state = get()
    const item = state.inventory[inventoryIndex]
    if (!item || item.count < count) return

    get().removeFromInventory(inventoryIndex, count)
    get().addItemToContainer(containerId, item.type, count)
    get().showMessage(`📦 放入 ${count} 个物品`, 'success')
  },

  moveItemFromContainer: (containerId, containerIndex, count = 1) => {
    const state = get()
    const building = state.buildings.find((b) => b.id === containerId)
    if (!building) return
    const item = building.inventory[containerIndex]
    if (!item || item.count < count) return

    if (get().addToInventory(item.type, count, item.durability, item.maxDurability)) {
      get().removeItemFromContainer(containerId, item.type, count)
    }
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

  updateMonster: (monsterId, updates) => {
    set((state) => ({
      monsters: state.monsters.map((m) =>
        m.id === monsterId ? { ...m, ...updates } : m
      ),
    }))
  },

  damageMonster: (monsterId, damage) => {
    set((state) => {
      const monster = state.monsters.find((m) => m.id === monsterId)
      if (!monster) return state

      const newHealth = monster.health - damage
      if (newHealth <= 0) {
        get().addToInventory('meat' as ResourceType, 2)
        get().showMessage('🎉 击败了猪人！获得2个肉', 'success')
        return {
          monsters: state.monsters.filter((m) => m.id !== monsterId),
        }
      }

      return {
        monsters: state.monsters.map((m) =>
          m.id === monsterId ? { ...m, health: newHealth, isAggro: true } : m
        ),
      }
    })
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

export function generateMonsters(mapSize: number, count: number = 5): Monster[] {
  const monsters: Monster[] = []

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * mapSize * 0.7
    const z = (Math.random() - 0.5) * mapSize * 0.7

    if (Math.abs(x) < 10 && Math.abs(z) < 10) continue

    monsters.push({
      id: `monster-${i}`,
      type: 'pigman',
      position: [x, 0, z],
      health: 50,
      maxHealth: 50,
      damage: 15,
      attackRange: 2,
      detectRange: 8,
      isAggro: false,
      lastAttackTime: 0,
      targetPosition: null,
    })
  }

  return monsters
}
