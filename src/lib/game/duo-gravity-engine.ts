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

function isSolid(
  grid: CellType[][],
  boxes: Position[],
  x: number, y: number,
): boolean {
  if (isWall(grid, x, y)) return true;
  if (isBoxAt(boxes, x, y)) return true;
  return false;
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
  if (isWall(state.grid, x, y)) return false;
  if (isBoxAt(state.boxes, x, y)) return false;
  const player = isPlayerAt(state, x, y);
  if (player && player !== ignoreColor) return false;
  return true;
}

function getGroundY(
  grid: CellType[][],
  boxes: Position[],
  x: number,
  startY: number,
): number {
  let y = startY;
  while (y + 1 < grid.length && !isSolid(grid, boxes, x, y + 1)) {
    y++;
  }
  return y;
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

interface StackItem {
  position: Position;
  type: 'box' | 'player';
  color?: PlayerColor;
  boxIndex?: number;
}

function getStackAbove(
  state: DuoGravityGameState,
  x: number, y: number,
): StackItem[] {
  const items: StackItem[] = [];
  let currentY = y - 1;

  while (currentY >= 0) {
    const boxIdx = findBoxIndex(state.boxes, x, currentY);
    const playerColor = isPlayerAt(state, x, currentY);

    if (boxIdx !== -1) {
      items.push({ position: { x, y: currentY }, type: 'box', boxIndex: boxIdx });
    } else if (playerColor) {
      items.push({ position: { x, y: currentY }, type: 'player', color: playerColor });
    } else {
      break;
    }
    currentY--;
  }

  return items;
}

function canMoveColumnHorizontal(
  state: DuoGravityGameState,
  x: number, bottomY: number,
  dx: number,
  ignoreColor?: PlayerColor,
): boolean {
  const newX = x + dx;

  if (!isPassable(state, newX, bottomY, ignoreColor)) return false;

  const above = getStackAbove(state, x, bottomY);
  for (const item of above) {
    if (!isPassable(state, newX, item.position.y, ignoreColor)) return false;
  }

  return true;
}

function moveColumnHorizontal(
  state: DuoGravityGameState,
  x: number, bottomY: number,
  dx: number,
): { moved: StackItem[] } {
  const moved: StackItem[] = [];
  const above = getStackAbove(state, x, bottomY);

  const bottomBoxIdx = findBoxIndex(state.boxes, x, bottomY);
  const bottomPlayer = isPlayerAt(state, x, bottomY);

  if (bottomBoxIdx !== -1) {
    moved.push({ position: { x, y: bottomY }, type: 'box', boxIndex: bottomBoxIdx });
    state.boxes[bottomBoxIdx].x += dx;
  } else if (bottomPlayer) {
    moved.push({ position: { x, y: bottomY }, type: 'player', color: bottomPlayer });
    if (bottomPlayer === 'blue') {
      state.bluePlayer.position.x += dx;
    } else {
      state.redPlayer.position.x += dx;
    }
  }

  for (const item of above) {
    if (item.type === 'box' && item.boxIndex !== undefined) {
      moved.push({ ...item, position: { ...item.position } });
      state.boxes[item.boxIndex].x += dx;
    } else if (item.type === 'player' && item.color) {
      moved.push({ ...item, position: { ...item.position } });
      if (item.color === 'blue') {
        state.bluePlayer.position.x += dx;
      } else {
        state.redPlayer.position.x += dx;
      }
    }
  }

  return { moved };
}

function countHorizontalBoxColumns(
  state: DuoGravityGameState,
  startX: number, y: number,
  dx: number,
  playerColor: PlayerColor,
): { count: number; lastX: number; canPush: boolean } {
  let count = 0;
  let x = startX;
  let lastX = startX;

  while (isBoxAt(state.boxes, x, y)) {
    const stackAbove = getStackAbove(state, x, y);
    const blockedByOtherPlayer = stackAbove.some(
      (item) => item.type === 'player' && item.color !== playerColor,
    );
    if (blockedByOtherPlayer) {
      return { count, lastX, canPush: false };
    }
    count++;
    lastX = x;
    x += dx;
  }

  if (!canMoveColumnHorizontal(state, lastX, y, dx, playerColor)) {
    return { count, lastX, canPush: false };
  }

  return { count, lastX, canPush: true };
}

function tryClimb(
  state: DuoGravityGameState,
  color: PlayerColor,
  dx: number,
): boolean {
  const player = color === 'blue' ? state.bluePlayer : state.redPlayer;
  const targetX = player.position.x + dx;
  const targetY = player.position.y - 1;

  if (targetY < 0) return false;

  if (!isPassable(state, targetX, targetY, color)) return false;

  if (!isSolid(state.grid, state.boxes, targetX, player.position.y)) return false;

  player.position.x = targetX;
  player.position.y = targetY;
  return true;
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

  let boxesMoved: { from: Position; to: Position }[] = [];
  let moved = false;

  if (isBoxAt(state.boxes, targetX, targetY)) {
    const boxInfo = countHorizontalBoxColumns(state, targetX, targetY, dx, color);
    if (boxInfo.canPush && boxInfo.count <= 2) {
      for (let bx = boxInfo.lastX; bx >= targetX; bx -= dx) {
        const result = moveColumnHorizontal(state, bx, targetY, dx);
        for (const item of result.moved) {
          if (item.type === 'box') {
            boxesMoved.push({
              from: { x: item.position.x, y: item.position.y },
              to: { x: item.position.x + dx, y: item.position.y },
            });
          }
        }
      }
      player.position.x = targetX;
      moved = true;
    } else {
      if (tryClimb(state, color, dx)) {
        moved = true;
      } else {
        return null;
      }
    }
  } else if (isWall(state.grid, targetX, targetY)) {
    if (tryClimb(state, color, dx)) {
      moved = true;
    } else {
      return null;
    }
  } else {
    const otherPlayer = isPlayerAt(state, targetX, targetY);
    if (otherPlayer && otherPlayer !== color) {
      return null;
    }
    player.position.x = targetX;
    moved = true;
  }

  if (moved) {
    applyGravity(state);
    updateOnTarget(state);

    return {
      success: true,
      boxesMoved,
      oldPosition,
      newPosition: { ...player.position },
    };
  }

  return null;
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

  const targetX = player.position.x;
  const targetY = player.position.y - 1;

  if (targetY < 0) return null;

  if (isBoxAt(state.boxes, targetX, targetY)) {
    return null;
  }

  if (isWall(state.grid, targetX, targetY)) {
    return null;
  }

  const otherPlayer = isPlayerAt(state, targetX, targetY);
  if (otherPlayer && otherPlayer !== color) {
    return null;
  }

  player.position.y = targetY;

  applyGravity(state);
  updateOnTarget(state);

  return {
    success: true,
    boxesMoved: [],
    oldPosition,
    newPosition: { ...player.position },
  };
}

export function moveDuoGravityPlayer(
  state: DuoGravityGameState,
  color: PlayerColor,
  direction: Direction,
): DuoGravityGameState {
  if (state.isWin) return state;
  if (state.currentTurn !== color) return state;

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

  const otherColor = color === 'blue' ? 'red' : 'blue';

  newState.steps++;
  newState.currentTurn = otherColor;
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
  newState.currentTurn = lastMove.color;
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
