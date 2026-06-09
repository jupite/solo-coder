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

function isSolidForGravity(
  state: DuoGravityGameState,
  x: number, y: number,
): boolean {
  if (isWall(state.grid, x, y)) return true;
  if (isBoxAt(state.boxes, x, y)) return true;
  if (isPlayerAt(state, x, y)) return true;
  return false;
}

function isPassableForMove(
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

function isSolidSupport(
  state: DuoGravityGameState,
  x: number, y: number,
): boolean {
  if (isWall(state.grid, x, y)) return true;
  if (isBoxAt(state.boxes, x, y)) return true;
  return false;
}

function applyGravity(state: DuoGravityGameState): void {
  const rows = state.grid.length;
  const cols = state.grid[0]?.length ?? 0;

  for (let y = rows - 2; y >= 0; y--) {
    for (let x = 0; x < cols; x++) {
      const boxIdx = findBoxIndex(state.boxes, x, y);
      if (boxIdx !== -1) {
        let newY = y;
        while (newY + 1 < rows && !isSolidForGravity(state, x, newY + 1)) {
          newY++;
        }
        if (newY !== y) {
          state.boxes[boxIdx].y = newY;
        }
      }
    }
  }

  for (const color of ['blue', 'red'] as PlayerColor[]) {
    const player = color === 'blue' ? state.bluePlayer : state.redPlayer;
    let newY = player.position.y;
    while (newY + 1 < rows && !isSolidForGravity(state, player.position.x, newY + 1)) {
      const playerBelow = isPlayerAt(state, player.position.x, newY + 1);
      if (playerBelow && playerBelow !== color) {
        break;
      }
      newY++;
    }
    if (newY !== player.position.y) {
      player.position.y = newY;
    }
  }
}

function getStackedBoxesAbove(
  state: DuoGravityGameState,
  x: number, y: number,
): Position[] {
  const stacked: Position[] = [];
  let currentY = y - 1;

  while (currentY >= 0) {
    const boxIdx = findBoxIndex(state.boxes, x, currentY);
    if (boxIdx !== -1) {
      stacked.push({ x, y: currentY });
    } else {
      break;
    }
    currentY--;
  }

  return stacked;
}

function canPushBoxColumn(
  state: DuoGravityGameState,
  startX: number, y: number,
  dx: number,
  ignoreColor: PlayerColor,
): boolean {
  const newX = startX + dx;

  if (isWall(state.grid, newX, y)) return false;

  const boxAtTarget = isBoxAt(state.boxes, newX, y);
  if (boxAtTarget) {
    return canPushBoxColumn(state, newX, y, dx, ignoreColor);
  }

  const playerAtTarget = isPlayerAt(state, newX, y);
  if (playerAtTarget && playerAtTarget !== ignoreColor) return false;

  const stacked = getStackedBoxesAbove(state, startX, y);
  for (const box of stacked) {
    const aboveNewX = box.x + dx;
    const aboveNewY = box.y;
    if (isWall(state.grid, aboveNewX, aboveNewY)) return false;
    const aboveBox = isBoxAt(state.boxes, aboveNewX, aboveNewY);
    if (aboveBox && aboveNewX !== startX + dx) return false;
    const abovePlayer = isPlayerAt(state, aboveNewX, aboveNewY);
    if (abovePlayer && abovePlayer !== ignoreColor) return false;
  }

  return true;
}

function pushBoxColumn(
  state: DuoGravityGameState,
  startX: number, y: number,
  dx: number,
): { from: Position; to: Position }[] {
  const moved: { from: Position; to: Position }[] = [];

  const boxIdx = findBoxIndex(state.boxes, startX, y);
  if (boxIdx === -1) return moved;

  const nextX = startX + dx;
  const nextBoxIdx = findBoxIndex(state.boxes, nextX, y);
  if (nextBoxIdx !== -1) {
    const nextMoved = pushBoxColumn(state, nextX, y, dx);
    moved.push(...nextMoved);
  }

  const stacked = getStackedBoxesAbove(state, startX, y);

  moved.push({
    from: { x: state.boxes[boxIdx].x, y: state.boxes[boxIdx].y },
    to: { x: startX + dx, y },
  });
  state.boxes[boxIdx].x = startX + dx;

  for (let i = 0; i < stacked.length; i++) {
    const sBox = stacked[i];
    const sIdx = findBoxIndex(state.boxes, sBox.x, sBox.y);
    if (sIdx !== -1) {
      moved.push({
        from: { x: state.boxes[sIdx].x, y: state.boxes[sIdx].y },
        to: { x: sBox.x + dx, y: sBox.y },
      });
      state.boxes[sIdx].x = sBox.x + dx;
    }
  }

  return moved;
}

function tryClimbUp(
  state: DuoGravityGameState,
  color: PlayerColor,
): Position | null {
  const player = color === 'blue' ? state.bluePlayer : state.redPlayer;
  const { x, y } = player.position;

  if (y - 1 < 0) return null;

  if (isSolidSupport(state, x - 1, y) && isPassableForMove(state, x - 1, y - 1, color)) {
    return { x: x - 1, y: y - 1 };
  }

  if (isSolidSupport(state, x + 1, y) && isPassableForMove(state, x + 1, y - 1, color)) {
    return { x: x + 1, y: y - 1 };
  }

  if (isPassableForMove(state, x, y - 1, color)) {
    return { x, y: y - 1 };
  }

  return null;
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

  if (isWall(state.grid, targetX, targetY)) {
    return null;
  }

  const otherPlayer = isPlayerAt(state, targetX, targetY);
  if (otherPlayer && otherPlayer !== color) {
    return null;
  }

  if (isBoxAt(state.boxes, targetX, targetY)) {
    if (canPushBoxColumn(state, targetX, targetY, dx, color)) {
      boxesMoved = pushBoxColumn(state, targetX, targetY, dx);
      player.position.x = targetX;
    } else {
      return null;
    }
  } else {
    player.position.x = targetX;
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

  const climbTarget = tryClimbUp(state, color);
  if (!climbTarget) {
    return null;
  }

  player.position.x = climbTarget.x;
  player.position.y = climbTarget.y;

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
  newState.currentTurn = newState.currentTurn === 'blue' ? 'red' : 'blue';
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
  newState.currentTurn = newState.currentTurn === 'blue' ? 'red' : 'blue';
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
