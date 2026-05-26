import {
  CellType,
  Direction,
  DuoGameState,
  DuoLevelData,
  DuoPlayerState,
  PlayerColor,
  Position,
  RedGate,
  SwitchItem,
} from './types';

const DIRS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function createDuoGameState(level: DuoLevelData): DuoGameState {
  const grid = level.grid.map((row) => row.slice());
  const blueOrigin = { ...level.bluePlayer };
  const redOrigin = { ...level.redPlayer };

  const bluePlayer: DuoPlayerState = {
    position: { ...level.bluePlayer },
    origin: blueOrigin,
    stepsRemaining: level.blueMaxSteps,
    maxSteps: level.blueMaxSteps,
  };

  const redPlayer: DuoPlayerState = {
    position: { ...level.redPlayer },
    origin: redOrigin,
    stepsRemaining: level.redMaxSteps,
    maxSteps: level.redMaxSteps,
  };

  return {
    grid,
    bluePlayer,
    redPlayer,
    boxes: level.boxes.map((b) => ({ ...b })),
    targets: level.targets.map((t) => ({ ...t })),
    redGates: level.redGates.map((g) => ({ ...g })),
    switches: level.switches.map((s) => ({ ...s })),
    activeSwitches: new Set<string>(),
    currentTurn: 'blue',
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

function findGateAt(
  gates: RedGate[],
  x: number,
  y: number,
): RedGate | undefined {
  return gates.find((g) => g.x === x && g.y === y);
}

function findSwitchAt(
  switches: SwitchItem[],
  x: number,
  y: number,
): SwitchItem | undefined {
  return switches.find((s) => s.x === x && s.y === y);
}

function isGateOpen(
  gate: RedGate,
  activeSwitches: Set<string>,
): boolean {
  return activeSwitches.has(gate.switchId);
}

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function moveDuoPlayer(
  state: DuoGameState,
  color: PlayerColor,
  direction: Direction,
): DuoGameState {
  if (state.isWin) return state;

  const player = color === 'blue' ? state.bluePlayer : state.redPlayer;
  const otherPlayer = color === 'blue' ? state.redPlayer : state.bluePlayer;

  const dir = DIRS[direction];
  const nx = player.position.x + dir.x;
  const ny = player.position.y + dir.y;

  if (isWall(state.grid, nx, ny)) return state;

  if (otherPlayer.position.x === nx && otherPlayer.position.y === ny) {
    return state;
  }

  const gate = findGateAt(state.redGates, nx, ny);
  if (gate) {
    if (color === 'red') {
      if (!isGateOpen(gate, state.activeSwitches)) return state;
    }
  }

  const boxIdx = findBoxIndex(state.boxes, nx, ny);
  const newBoxes = state.boxes.map((b) => ({ ...b }));
  const newActiveSwitches = new Set(state.activeSwitches);

  if (boxIdx !== -1) {
    const bx = nx + dir.x;
    const by = ny + dir.y;

    if (isWall(state.grid, bx, by)) return state;
    if (findBoxIndex(newBoxes, bx, by) !== -1) return state;

    const pushedIntoGate = findGateAt(state.redGates, bx, by);
    if (pushedIntoGate) {
      if (color === 'red') {
        if (!isGateOpen(pushedIntoGate, newActiveSwitches)) return state;
      }
    }

    newBoxes[boxIdx] = { x: bx, y: by };

    const pressedSwitch = findSwitchAt(state.switches, bx, by);
    if (pressedSwitch) {
      newActiveSwitches.add(pressedSwitch.gateId);
    }

    const leftSwitch = findSwitchAt(state.switches, nx, ny);
    if (leftSwitch) {
      const stillPressed = newBoxes.some(
        (b) => b.x === leftSwitch.x && b.y === leftSwitch.y,
      );
      if (!stillPressed) {
        newActiveSwitches.delete(leftSwitch.gateId);
      }
    }
  }

  const newStepsRemaining = player.stepsRemaining - 1;
  if (newStepsRemaining < 0) return state;

  const newPlayer: DuoPlayerState = {
    ...player,
    position: { x: nx, y: ny },
    stepsRemaining: newStepsRemaining,
  };

  const distToOrigin = manhattanDistance(newPlayer.position, newPlayer.origin);
  const recoverableSteps = Math.max(0, newPlayer.maxSteps - distToOrigin);
  newPlayer.stepsRemaining = Math.max(
    newPlayer.stepsRemaining,
    recoverableSteps,
  );

  const newState: DuoGameState = {
    ...state,
    bluePlayer: color === 'blue' ? newPlayer : state.bluePlayer,
    redPlayer: color === 'red' ? newPlayer : state.redPlayer,
    boxes: newBoxes,
    activeSwitches: newActiveSwitches,
    currentTurn: color === 'blue' ? 'red' : 'blue',
    steps: state.steps + 1,
    isWin: false,
  };

  newState.isWin = checkDuoWin(newState);
  return newState;
}

export function checkDuoWin(state: DuoGameState): boolean {
  if (state.boxes.length !== state.targets.length) return false;

  const allBoxesOnTargets = state.targets.every((t) =>
    state.boxes.some((b) => b.x === t.x && b.y === t.y),
  );

  if (!allBoxesOnTargets) return false;

  const blueOnTarget = state.targets.some(
    (t) =>
      t.x === state.bluePlayer.position.x &&
      t.y === state.bluePlayer.position.y,
  );
  const redOnTarget = state.targets.some(
    (t) =>
      t.x === state.redPlayer.position.x &&
      t.y === state.redPlayer.position.y,
  );

  return blueOnTarget && redOnTarget;
}

export function getDuoCellAt(
  state: DuoGameState,
  x: number,
  y: number,
): CellType {
  if (y < 0 || y >= state.grid.length || x < 0 || x >= state.grid[0].length) {
    return CellType.WALL;
  }
  const base = state.grid[y][x];

  if (base === CellType.WALL) return CellType.WALL;

  const gate = findGateAt(state.redGates, x, y);
  if (gate) {
    if (isGateOpen(gate, state.activeSwitches)) {
      return CellType.FLOOR;
    }
    return CellType.RED_GATE;
  }

  const sw = findSwitchAt(state.switches, x, y);
  if (sw) {
    return state.activeSwitches.has(sw.gateId)
      ? CellType.SWITCH_ON
      : CellType.SWITCH_OFF;
  }

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