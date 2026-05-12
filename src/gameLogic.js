export const TILE_SIZE = 1
export const GRID_SIZE = 8

export const TILE_TYPES = {
  FLOOR: 0,
  WALL: 1,
  TARGET: 2,
}

export const levels = [
  {
    name: '第一关 - 入门',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 0, 0, 1],
      [1, 0, 0, 1, 2, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    player: { x: 2, y: 2 },
    box: { x: 3, y: 5 },
  },
  {
    name: '第二关 - L形走廊',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    player: { x: 5, y: 1 },
    box: { x: 4, y: 4 },
  },
  {
    name: '第三关 - 迷宫',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1],
      [1, 0, 0, 0, 1, 2, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    player: { x: 1, y: 1 },
    box: { x: 3, y: 4 },
  },
]

export function createGameState(levelIndex) {
  const level = levels[levelIndex]
  return {
    levelIndex,
    levelName: level.name,
    grid: level.grid.map((row) => [...row]),
    player: { ...level.player },
    box: { ...level.box },
    target: findTarget(level.grid),
    isWin: false,
  }
}

function findTarget(grid) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === TILE_TYPES.TARGET) {
        return { x, y }
      }
    }
  }
  return null
}

export function movePlayer(state, dx, dy) {
  if (state.isWin) return state

  const newX = state.player.x + dx
  const newY = state.player.y + dy

  if (!isValidPosition(state, newX, newY)) {
    return state
  }

  if (state.box.x === newX && state.box.y === newY) {
    const boxNewX = state.box.x + dx
    const boxNewY = state.box.y + dy

    if (!isValidPosition(state, boxNewX, boxNewY)) {
      return state
    }

    const newState = {
      ...state,
      player: { x: newX, y: newY },
      box: { x: boxNewX, y: boxNewY },
    }

    if (newState.box.x === state.target.x && newState.box.y === state.target.y) {
      newState.isWin = true
    }

    return newState
  }

  return {
    ...state,
    player: { x: newX, y: newY },
  }
}

function isValidPosition(state, x, y) {
  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
    return false
  }
  if (state.grid[y][x] === TILE_TYPES.WALL) {
    return false
  }
  return true
}
