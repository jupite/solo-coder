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

  applyGravityToBoxes(state);
  applyGravityToPlayers(state);
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

function isSolidForBox(
  grid: CellType[][],
  boxes: Position[],
  x: number, y: number,
): boolean {
  if (isWall(grid, x, y)) return true;
  if (isBoxAt(boxes, x, y)) return true;
  return false;
}

function isSolidForBoxWithPlayers(
  state: DuoGravityGameState,
  x: number, y: number,
): boolean {
  if (isWall(state.grid, x, y)) return true;
  if (isBoxAt(state.boxes, x, y)) return true;
  if (isPlayerAt(state, x, y)) return true;
  return false;
}

function isPassableForPlayer(
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

function getGroundSurfaceY(
  state: DuoGravityGameState,
  x: number,
  startY: number,
  ignoreColor?: PlayerColor,
): number {
  let y = startY;
  const rows = state.grid.length;
  while (y + 1 < rows) {
    const checkY = y + 1;
    if (isWall(state.grid, x, checkY)) return checkY;
    if (isBoxAt(state.boxes, x, checkY)) return checkY;
    const otherPlayer = isPlayerAt(state, x, checkY);
    if (otherPlayer && otherPlayer !== ignoreColor) return checkY;
    y = checkY;
  }
  return rows;
}

function getSupportYForPlayer(
  state: DuoGravityGameState,
  x: number,
  startY: number,
  ignoreColor?: PlayerColor,
): number {
  const surfaceY = getGroundSurfaceY(state, x, startY, ignoreColor);
  return surfaceY - 1;
}

function getBoxGroundY(
  state: DuoGravityGameState,
  x: number,
  startY: number,
): number {
  let y = startY;
  const rows = state.grid.length;
  while (y + 1 < rows && !isSolidForBoxWithPlayers(state, x, y + 1)) {
    y++;
  }
  return y;
}

function applyGravityToBoxes(state: DuoGravityGameState): void {
  const rows = state.grid.length;
  const cols = state.grid[0]?.length ?? 0;

  let changed = true;
  while (changed) {
    changed = false;
    for (let y = rows - 2; y >= 0; y--) {
      for (let x = 0; x < cols; x++) {
        const boxIdx = findBoxIndex(state.boxes, x, y);
        if (boxIdx !== -1) {
          const newY = getBoxGroundY(state, x, y);
          if (newY !== y) {
            state.boxes[boxIdx].y = newY;
            changed = true;
          }
        }
      }
    }
  }
}

function applyGravityToPlayers(state: DuoGravityGameState): void {
  const blueSurfaceY = getGroundSurfaceY(state, state.bluePlayer.position.x, state.bluePlayer.position.y, 'blue');
  const blueStandY = blueSurfaceY - 1;
  const blueMaxFloatY = blueStandY - 1;
  if (state.bluePlayer.position.y < blueMaxFloatY) {
    state.bluePlayer.position.y = blueMaxFloatY;
  } else if (state.bluePlayer.position.y > blueStandY) {
    state.bluePlayer.position.y = blueStandY;
  }

  const redSurfaceY = getGroundSurfaceY(state, state.redPlayer.position.x, state.redPlayer.position.y, 'red');
  const redStandY = redSurfaceY - 1;
  const redMaxFloatY = redStandY - 1;
  if (state.redPlayer.position.y < redMaxFloatY) {
    state.redPlayer.position.y = redMaxFloatY;
  } else if (state.redPlayer.position.y > redStandY) {
    state.redPlayer.position.y = redStandY;
  }
}

function getBoxStackAbove(
  state: DuoGravityGameState,
  x: number, y: number,
): number[] {
  const boxIndices: number[] = [];
  let currentY = y - 1;

  while (currentY >= 0) {
    const boxIdx = findBoxIndex(state.boxes, x, currentY);
    if (boxIdx !== -1) {
      boxIndices.push(boxIdx);
    } else {
      break;
    }
    currentY--;
  }

  return boxIndices;
}

function canMoveBoxColumnHorizontal(
  state: DuoGravityGameState,
  x: number, bottomY: number,
  dx: number,
): boolean {
  const newX = x + dx;

  if (!isPassableForPlayer(state, newX, bottomY)) return false;

  const above = getBoxStackAbove(state, x, bottomY);
  for (const boxIdx of above) {
    const box = state.boxes[boxIdx];
    if (!isPassableForPlayer(state, newX, box.y)) return false;
  }

  return true;
}

function moveBoxColumnHorizontal(
  state: DuoGravityGameState,
  x: number, bottomY: number,
  dx: number,
): { from: Position; to: Position }[] {
  const moved: { from: Position; to: Position }[] = [];
  const above = getBoxStackAbove(state, x, bottomY);

  const bottomBoxIdx = findBoxIndex(state.boxes, x, bottomY);
  if (bottomBoxIdx !== -1) {
    moved.push({
      from: { x: state.boxes[bottomBoxIdx].x, y: state.boxes[bottomBoxIdx].y },
      to: { x: state.boxes[bottomBoxIdx].x + dx, y: state.boxes[bottomBoxIdx].y },
    });
    state.boxes[bottomBoxIdx].x += dx;
  }

  for (const boxIdx of above) {
    moved.push({
      from: { x: state.boxes[boxIdx].x, y: state.boxes[boxIdx].y },
      to: { x: state.boxes[boxIdx].x + dx, y: state.boxes[boxIdx].y },
    });
    state.boxes[boxIdx].x += dx;
  }

  return moved;
}

function isPlayerPositionValid(
  state: DuoGravityGameState,
  x: number, y: number,
  ignoreColor?: PlayerColor,
): boolean {
  if (y < 0) return false;
  if (!isPassableForPlayer(state, x, y, ignoreColor)) return false;

  const surfaceY = getGroundSurfaceY(state, x, y, ignoreColor);
  const standY = surfaceY - 1;
  if (y > standY) return false;
  if (standY - y > 1) return false;

  return true;
}

function canClimb(
  state: DuoGravityGameState,
  color: PlayerColor,
  dx: number,
): boolean {
  const player = color === 'blue' ? state.bluePlayer : state.redPlayer;
  const targetX = player.position.x + dx;
  const targetY = player.position.y - 1;

  return isPlayerPositionValid(state, targetX, targetY, color);
}

function canJumpUp(
  state: DuoGravityGameState,
  color: PlayerColor,
): boolean {
  const player = color === 'blue' ? state.bluePlayer : state.redPlayer;
  const targetX = player.position.x;
  const targetY = player.position.y - 1;

  return isPlayerPositionValid(state, targetX, targetY, color);
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

  if (isBoxAt(state.boxes, targetX, targetY)) {
    if (canMoveBoxColumnHorizontal(state, targetX, targetY, dx)) {
      boxesMoved = moveBoxColumnHorizontal(state, targetX, targetY, dx);
      player.position.x = targetX;
    } else if (canClimb(state, color, dx)) {
      player.position.x = targetX;
      player.position.y = targetY - 1;
    } else {
      return null;
    }
  } else if (isWall(state.grid, targetX, targetY)) {
    if (canClimb(state, color, dx)) {
      player.position.x = targetX;
      player.position.y = targetY - 1;
    } else {
      return null;
    }
  } else {
    const otherPlayer = isPlayerAt(state, targetX, targetY);
    if (otherPlayer && otherPlayer !== color) {
      return null;
    }

    if (isPlayerPositionValid(state, targetX, targetY, color)) {
      player.position.x = targetX;
      player.position.y = targetY;
    } else if (canClimb(state, color, dx)) {
      player.position.x = targetX;
      player.position.y = targetY - 1;
    } else {
      return null;
    }
  }

  applyGravityToBoxes(state);
  applyGravityToPlayers(state);
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

  if (!canJumpUp(state, color)) {
    return null;
  }

  player.position.y -= 1;

  applyGravityToBoxes(state);
  applyGravityToPlayers(state);
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
  newState.currentTurn = state.currentTurn === 'blue' ? 'red' : 'blue';

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
  const bluePos = state.bluePlayer.position;
  const redPos = state.redPlayer.position;

  if (state.targets.length !== 2) return false;

  const t1 = state.targets[0];
  const t2 = state.targets[1];

  const blueOnT1 = bluePos.x === t1.x && bluePos.y === t1.y;
  const blueOnT2 = bluePos.x === t2.x && bluePos.y === t2.y;
  const redOnT1 = redPos.x === t1.x && redPos.y === t1.y;
  const redOnT2 = redPos.x === t2.x && redPos.y === t2.y;

  return (blueOnT1 && redOnT2) || (blueOnT2 && redOnT1);
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

  applyGravityToBoxes(newState);
  applyGravityToPlayers(newState);
  updateOnTarget(newState);
  newState.steps--;
  newState.isWin = false;
  newState.currentTurn = state.currentTurn === 'blue' ? 'red' : 'blue';

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
