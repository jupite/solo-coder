import { CellType, Direction, GameState, LevelData, Position } from './types';

const DIRS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function createGameState(level: LevelData): GameState {
  const grid = level.grid.map((row) => row.slice());
  return {
    grid,
    player: { ...level.player },
    boxes: level.boxes.map((b) => ({ ...b })),
    targets: level.targets.map((t) => ({ ...t })),
    steps: 0,
    isWin: false,
  };
}

function isWall(grid: CellType[][], x: number, y: number): boolean {
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return true;
  return grid[y][x] === CellType.WALL;
}

function findBoxIndex(boxes: Position[], x: number, y: number): number {
  return boxes.findIndex((b) => b.x === x && b.y === y);
}

export function movePlayer(
  state: GameState,
  direction: Direction,
): GameState {
  if (state.isWin) return state;

  const dir = DIRS[direction];
  const nx = state.player.x + dir.x;
  const ny = state.player.y + dir.y;

  if (isWall(state.grid, nx, ny)) return state;

  const boxIdx = findBoxIndex(state.boxes, nx, ny);
  const newBoxes = state.boxes.map((b) => ({ ...b }));

  if (boxIdx !== -1) {
    const bx = nx + dir.x;
    const by = ny + dir.y;

    if (isWall(state.grid, bx, by)) return state;
    if (findBoxIndex(newBoxes, bx, by) !== -1) return state;

    newBoxes[boxIdx] = { x: bx, y: by };
  }

  const newState: GameState = {
    grid: state.grid,
    player: { x: nx, y: ny },
    boxes: newBoxes,
    targets: state.targets,
    steps: state.steps + 1,
    isWin: false,
  };

  newState.isWin = checkWin(newState);
  return newState;
}

export function checkWin(state: GameState): boolean {
  if (state.boxes.length !== state.targets.length) return false;
  return state.targets.every((t) =>
    state.boxes.some((b) => b.x === t.x && b.y === t.y),
  );
}

export function getCellAt(state: GameState, x: number, y: number): CellType {
  if (y < 0 || y >= state.grid.length || x < 0 || x >= state.grid[0].length) {
    return CellType.WALL;
  }
  const base = state.grid[y][x];
  const hasPlayer = state.player.x === x && state.player.y === y;
  const hasBox = state.boxes.some((b) => b.x === x && b.y === y);

  if (hasPlayer) {
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
