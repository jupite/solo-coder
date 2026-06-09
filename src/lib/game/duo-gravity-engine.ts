import {
  CellType,
  Direction,
  DuoGravityGameState,
  DuoGravityLevelData,
  DuoGravityPlayerState,
  DuoGravityMoveHistoryEntry,
  PlayerColor,
  Position,
} from './types';

const DIRS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function createDuoGravityGameState(level: DuoGravityLevelData): DuoGravityGameState {
  const grid = level.grid.map((row) => row.slice());

  const bluePlayer: DuoGravityPlayerState = {
    position: { ...level.bluePlayer },
    origin: { ...level.bluePlayer },
    onTarget: false,
  };

  const redPlayer: DuoGravityPlayerState = {
    position: { ...level.redPlayer },
    origin: { ...level.redPlayer },
    onTarget: false,
  };

  const initialBoxes = level.boxes.map((b) => ({ ...b }));

  const state: DuoGravityGameState = {
    grid,
    bluePlayer,
    redPlayer,
    boxes: level.boxes.map((b) => ({ ...b })),
    initialBoxes,
    targets: level.targets.map((t) => ({ ...t })),
    currentTurn: 'blue',
    steps: 0,
    isWin: false,
    history: [],
  };

  applyGravity(state);
  updateOnTarget(state);
  state.isWin = checkDuoGravityWin(state);

  return state;
}

function isWall(grid: CellType[][], x: number, y: number): boolean {
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return true;
  return grid[y][x] === CellType.WALL;
}

function findBoxIndex(boxes: Position[], x: number, y: number): number {
  return boxes.findIndex((b) => b.x === x && b.y === y);
}

function isBoxAt(boxes: Position[], x: number, y: number): boolean {
  return findBoxIndex(boxes, x, y) !== -1;
}

function isPlayerAt(
  state: DuoGravityGameState,
  x: number, y: number,
): PlayerColor | null {
  if (state.bluePlayer.position.x === x && state.bluePlayer.position.y === y) return 'blue';
  if (state.redPlayer.position.x === x && state.redPlayer.position.y === y) return 'red';
  return null;
}

function isSolidWithPlayers(
  state: DuoGravityGameState,
  x: number, y: number,
  ignoreColor?: PlayerColor,
): boolean {
  if (isWall(state.grid, x, y)) return true;
  if (isBoxAt(state.boxes, x, y)) return true;
  const player = isPlayerAt(state, x, y);
  if (player && player !== ignoreColor) return true;
  return false;
}

function isPassable(
  state: DuoGravityGameState,
  x: number, y: number,
  ignoreColor?: PlayerColor,
): boolean {
  return !isSolidWithPlayers(state, x, y, ignoreColor);
}

function getGroundYWithPlayers(
  state: DuoGravityGameState,
  x: number,
  startY: number,
  ignoreColor?: PlayerColor,
): number {
  let y = startY;
  while (y + 1 < state.grid.length && !isSolidWithPlayers(state, x, y + 1, ignoreColor)) {
    y++;
  }
  return y;
}

function applyGravity(state: DuoGravityGameState): void {
  const rows = state.grid.length;
  const cols = state.grid[0]?.length ?? 0;

  for (let y = rows - 2; y >= 0; y--) {
    for (let x = 0; x < cols; x++) {
      const boxIdx = findBoxIndex(state.boxes, x, y);
      if (boxIdx !== -1) {
        const newY = getGroundYWithPlayers(state, x, y);
        if (newY !== y) {
          state.boxes[boxIdx].y = newY;
        }
      }
    }
  }

  const blueY = getGroundYWithPlayers(state, state.bluePlayer.position.x, state.bluePlayer.position.y, 'blue');
  if (blueY !== state.bluePlayer.position.y) {
    state.bluePlayer.position.y = blueY;
  }

  const redY = getGroundYWithPlayers(state, state.redPlayer.position.x, state.redPlayer.position.y, 'red');
  if (redY !== state.redPlayer.position.y) {
    state.redPlayer.position.y = redY;
  }
}

function getStackedItemsAtColumn(
  state: DuoGravityGameState,
  x: number,
  bottomY: number,
): { y: number; type: 'box' | 'player'; boxIndex?: number; color?: PlayerColor }[] {
  const items: { y: number; type: 'box' | 'player'; boxIndex?: number; color?: PlayerColor }[] = [];
  let y = bottomY;
  while (y >= 0) {
    const boxIdx = findBoxIndex(state.boxes, x, y);
    if (boxIdx !== -1) {
      items.push({ y, type: 'box', boxIndex });
    } else {
      const player = isPlayerAt(state, x, y);
      if (player) {
        items.push({ y, type: 'player', color: player });
      } else {
        break;
      }
    }
    y--;
  }
  return items;
}

function tryMoveHorizontal(
  state: DuoGravityGameState,
  color: PlayerColor,
  dx: number,
): {
  success: boolean;
  boxesMoved: { from: Position; to: Position }[];
  oldPosition: Position;
  newPosition: Position;
} | null {
  const player = color === 'blue' ? state.bluePlayer : state.redPlayer;
  const oldPosition = { ...player.position };

  const targetX = player.position.x + dx;
  const targetY = player.position.y;

  const boxesMoved: { from: Position; to: Position }[] = [];

  if (isBoxAt(state.boxes, targetX, targetY)) {
    let furthestX = targetX;
    while (isBoxAt(state.boxes, furthestX, targetY)) {
      furthestX += dx;
    }

    for (let colX = furthestX - dx; colX >= targetX; colX -= dx) {
      const stacked = getStackedItemsAtColumn(state, colX, targetY);

      const canMoveByY = new Map<number, boolean>();
      for (const item of stacked) {
        if (item.type === 'player' && item.color !== color) {
          canMoveByY.set(item.y, false);
        } else {
          canMoveByY.set(item.y, isPassable(state, colX + dx, item.y, color));
        }
      }

      let firstBlockedY: number | null = null;
      for (const item of stacked) {
        if (!canMoveByY.get(item.y)) {
          firstBlockedY = item.y;
          break;
        }
      }

      for (const item of stacked) {
        if (firstBlockedY !== null && item.y <= firstBlockedY) {
          continue;
        }

        if (canMoveByY.get(item.y)) {
          if (item.type === 'box' && item.boxIndex !== undefined) {
            boxesMoved.push({
              from: { x: colX, y: item.y },
              to: { x: colX + dx, y: item.y },
            });
            state.boxes[item.boxIndex].x += dx;
          } else if (item.type === 'player' && item.color) {
            if (item.color === 'blue') {
              state.bluePlayer.position.x += dx;
            } else {
              state.redPlayer.position.x += dx;
            }
          }
        }
      }
    }

    applyGravity(state);

    if (isPassable(state, targetX, targetY, color)) {
      player.position.x = targetX;
    } else if (targetY - 1 >= 0 && isPassable(state, targetX, targetY - 1, color)) {
      player.position.x = targetX;
      player.position.y = targetY - 1;
    } else {
      for (let i = boxesMoved.length - 1; i >= 0; i--) {
        const bm = boxesMoved[i];
        const idx = findBoxIndex(state.boxes, bm.to.x, bm.to.y);
        if (idx !== -1) {
          state.boxes[idx] = { ...bm.from };
        }
      }
      applyGravity(state);
      return null;
    }
  } else if (isWall(state.grid, targetX, targetY)) {
    if (targetY - 1 >= 0 && isPassable(state, targetX, targetY - 1, color)) {
      player.position.x = targetX;
      player.position.y = targetY - 1;
    } else {
      return null;
    }
  } else {
    const otherPlayer = isPlayerAt(state, targetX, targetY);
    if (otherPlayer && otherPlayer !== color) {
      if (targetY - 1 >= 0 && isPassable(state, targetX, targetY - 1, color)) {
        player.position.x = targetX;
        player.position.y = targetY - 1;
      } else {
        return null;
      }
    } else {
      player.position.x = targetX;
    }
  }

  applyGravity(state);
  updateOnTarget(state);

  return {
    success: true,
    boxesMoved,
    oldPosition,
    newPosition: { ...player.position },
  };
}

function tryMoveUp(
  state: DuoGravityGameState,
  color: PlayerColor,
): {
  success: boolean;
  boxesMoved: { from: Position; to: Position }[];
  oldPosition: Position;
  newPosition: Position;
} | null {
  const player = color === 'blue' ? state.bluePlayer : state.redPlayer;
  const oldPosition = { ...player.position };

  const px = player.position.x;
  const py = player.position.y;

  if (py - 1 >= 0 && isPassable(state, px, py - 1, color)) {
    player.position.y = py - 1;
    applyGravity(state);
    updateOnTarget(state);
    return {
      success: true,
      boxesMoved: [],
      oldPosition,
      newPosition: { ...player.position },
    };
  }

  if (py - 2 >= 0) {
    const obstacleAbove = isSolidWithPlayers(state, px, py - 1, color);
    const spaceOnTop = isPassable(state, px, py - 2, color);
    if (obstacleAbove && spaceOnTop) {
      player.position.y = py - 2;
      applyGravity(state);
      updateOnTarget(state);
      return {
        success: true,
        boxesMoved: [],
        oldPosition,
        newPosition: { ...player.position },
      };
    }
  }

  const sides = [-1, 1];
  for (const sdx of sides) {
    const sideX = px + sdx;
    if (sideX < 0 || sideX >= state.grid[0].length) continue;
    if (py - 1 < 0) continue;

    const hasObstacleOnSide = isSolidWithPlayers(state, sideX, py, color);
    const canStandOnTop = isPassable(state, sideX, py - 1, color);

    if (hasObstacleOnSide && canStandOnTop) {
      player.position.x = sideX;
      player.position.y = py - 1;
      applyGravity(state);
      updateOnTarget(state);
      return {
        success: true,
        boxesMoved: [],
        oldPosition,
        newPosition: { ...player.position },
      };
    }
  }

  return null;
}

export function moveDuoGravityPlayer(
  state: DuoGravityGameState,
  color: PlayerColor,
  direction: Direction,
): DuoGravityGameState {
  if (state.isWin) return state;

  const dir = DIRS[direction];

  if (dir.y > 0) return state;

  const newState: DuoGravityGameState = {
    ...state,
    bluePlayer: { ...state.bluePlayer, position: { ...state.bluePlayer.position } },
    redPlayer: { ...state.redPlayer, position: { ...state.redPlayer.position } },
    boxes: state.boxes.map((b) => ({ ...b })),
    history: [...state.history],
  };

  let result: {
    success: boolean;
    boxesMoved: { from: Position; to: Position }[];
    oldPosition: Position;
    newPosition: Position;
  } | null = null;

  if (dir.y < 0) {
    result = tryMoveUp(newState, color);
  } else if (dir.x !== 0) {
    result = tryMoveHorizontal(newState, color, dir.x);
  }

  if (!result) {
    return state;
  }

  newState.steps++;
  newState.isWin = checkDuoGravityWin(newState);

  const historyEntry: DuoGravityMoveHistoryEntry = {
    color,
    from: result.oldPosition,
    to: result.newPosition,
    boxesMoved: result.boxesMoved,
    blueOnTarget: newState.bluePlayer.onTarget,
    redOnTarget: newState.redPlayer.onTarget,
  };

  newState.history.push(historyEntry);

  return newState;
}

function updateOnTarget(state: DuoGravityGameState): void {
  const blueOnTarget = state.targets.some(
    (t) => t.x === state.bluePlayer.position.x && t.y === state.bluePlayer.position.y,
  );
  const redOnTarget = state.targets.some(
    (t) => t.x === state.redPlayer.position.x && t.y === state.redPlayer.position.y,
  );
  state.bluePlayer.onTarget = blueOnTarget;
  state.redPlayer.onTarget = redOnTarget;
}

export function checkDuoGravityWin(state: DuoGravityGameState): boolean {
  return state.bluePlayer.onTarget && state.redPlayer.onTarget;
}

export function undoDuoGravityMove(state: DuoGravityGameState): DuoGravityGameState {
  if (state.history.length === 0 || state.isWin) return state;

  const lastMove = state.history[state.history.length - 1];
  const newHistory = state.history.slice(0, -1);

  const newState: DuoGravityGameState = {
    ...state,
    bluePlayer: { ...state.bluePlayer, position: { ...state.bluePlayer.position } },
    redPlayer: { ...state.redPlayer, position: { ...state.redPlayer.position } },
    boxes: state.boxes.map((b) => ({ ...b })),
    history: newHistory,
  };

  const player = lastMove.color === 'blue' ? newState.bluePlayer : newState.redPlayer;
  player.position = { ...lastMove.from };

  for (let i = lastMove.boxesMoved.length - 1; i >= 0; i--) {
    const boxMove = lastMove.boxesMoved[i];
    const idx = findBoxIndex(newState.boxes, boxMove.to.x, boxMove.to.y);
    if (idx !== -1) {
      newState.boxes[idx] = { ...boxMove.from };
    }
  }

  applyGravity(newState);
  updateOnTarget(newState);
  newState.steps--;
  newState.isWin = false;

  return newState;
}

export function getDuoGravityCellAt(
  state: DuoGravityGameState,
  x: number, y: number,
): CellType {
  if (y < 0 || y >= state.grid.length || x < 0 || x >= state.grid[0].length) {
    return CellType.WALL;
  }
  const base = state.grid[y][x];

  if (base === CellType.WALL) return CellType.WALL;

  const hasBlue =
    state.bluePlayer.position.x === x && state.bluePlayer.position.y === y;
  const hasRed =
    state.redPlayer.position.x === x && state.redPlayer.position.y === y;
  const hasBox = state.boxes.some((b) => b.x === x && b.y === y);

  if (hasBlue || hasRed) {
    return base === CellType.TARGET
      ? CellType.PLAYER_ON_TARGET
      : CellType.PLAYER;
  }
  if (hasBox) {
    return base === CellType.TARGET
      ? CellType.BOX_ON_TARGET
      : CellType.BOX;
  }
  return base;
}

export function resetDuoGravityGame(state: DuoGravityGameState): DuoGravityGameState {
  const levelData: DuoGravityLevelData = {
    grid: state.grid.map((row) => row.slice()),
    bluePlayer: { ...state.bluePlayer.origin },
    redPlayer: { ...state.redPlayer.origin },
    boxes: state.initialBoxes.map((b) => ({ ...b })),
    targets: state.targets.map((t) => ({ ...t })),
  };
  return createDuoGravityGameState(levelData);
}
