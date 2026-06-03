import {
  CellType,
  Direction,
  DuoGameState,
  DuoLevelData,
  DuoPlayerState,
  MoveHistoryEntry,
  OneWayBarrier,
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

const ADJACENT_DIRS: Position[] = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];

export function createDuoGameState(level: DuoLevelData): DuoGameState {
  const grid = level.grid.map((row) => row.slice());
  const blueOrigin = { ...level.bluePlayer };
  const redOrigin = { ...level.redPlayer };

  const bluePlayer: DuoPlayerState = {
    position: { ...level.bluePlayer },
    origin: blueOrigin,
    stepsRemaining: level.blueMaxSteps,
    maxSteps: level.blueMaxSteps,
    path: [{ ...level.bluePlayer }],
    isGone: false,
  };

  const redPlayer: DuoPlayerState = {
    position: { ...level.redPlayer },
    origin: redOrigin,
    stepsRemaining: level.redMaxSteps,
    maxSteps: level.redMaxSteps,
    path: [{ ...level.redPlayer }],
    isGone: false,
  };

  return {
    grid,
    bluePlayer,
    redPlayer,
    boxes: level.boxes.map((b) => ({ ...b })),
    targets: level.targets.map((t) => ({ ...t })),
    redGates: level.redGates.map((g) => ({ ...g })),
    switches: level.switches.map((s) => ({ ...s })),
    oneWayBarriers: [],
    activeSwitches: new Set<string>(),
    currentTurn: 'blue',
    steps: 0,
    isWin: false,
    history: [],
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

function isGateBlocked(
  x: number,
  y: number,
  redGates: RedGate[],
  activeSwitches: Set<string>,
): boolean {
  const gate = findGateAt(redGates, x, y);
  if (!gate) return false;
  return !isGateOpen(gate, activeSwitches);
}

function isPositionInPath(path: Position[], x: number, y: number): boolean {
  return path.some((p) => p.x === x && p.y === y);
}

function getOppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
}

function findBarrierAt(
  barriers: OneWayBarrier[],
  x: number,
  y: number,
): OneWayBarrier | undefined {
  return barriers.find((b) => b.x === x && b.y === y);
}

function canEnterCell(
  barriers: OneWayBarrier[],
  x: number,
  y: number,
  enterFrom: Direction,
  playerColor: PlayerColor,
): boolean {
  const barrier = findBarrierAt(barriers, x, y);
  if (!barrier) return true;
  if (barrier.color !== playerColor) return false;
  return barrier.exitDirection === enterFrom;
}

function isAdjacentToSwitch(
  playerPos: Position,
  switchPos: Position,
): boolean {
  return ADJACENT_DIRS.some(
    (d) => playerPos.x + d.x === switchPos.x && playerPos.y + d.y === switchPos.y,
  );
}

export function isSwitchClickable(
  state: DuoGameState,
  switchX: number,
  switchY: number,
  playerColor: PlayerColor,
): boolean {
  const player = playerColor === 'blue' ? state.bluePlayer : state.redPlayer;
  if (player.isGone) return false;

  const sw = findSwitchAt(state.switches, switchX, switchY);
  if (!sw) return false;

  return isAdjacentToSwitch(player.position, { x: switchX, y: switchY });
}

export function toggleSwitch(
  state: DuoGameState,
  switchX: number,
  switchY: number,
  playerColor: PlayerColor,
): DuoGameState {
  if (state.isWin) return state;
  if (!isSwitchClickable(state, switchX, switchY, playerColor)) return state;

  const sw = findSwitchAt(state.switches, switchX, switchY);
  if (!sw) return state;

  const newActiveSwitches = new Set(state.activeSwitches);
  if (newActiveSwitches.has(sw.gateId)) {
    newActiveSwitches.delete(sw.gateId);
  } else {
    newActiveSwitches.add(sw.gateId);
  }

  return {
    ...state,
    activeSwitches: newActiveSwitches,
  };
}

export function moveDuoPlayer(
  state: DuoGameState,
  color: PlayerColor,
  direction: Direction,
): DuoGameState {
  if (state.isWin) return state;

  const player = color === 'blue' ? state.bluePlayer : state.redPlayer;
  const otherPlayer = color === 'blue' ? state.redPlayer : state.bluePlayer;

  if (player.isGone) return state;

  const dir = DIRS[direction];
  const nx = player.position.x + dir.x;
  const ny = player.position.y + dir.y;

  if (isWall(state.grid, nx, ny)) return state;

  if (findSwitchAt(state.switches, nx, ny)) {
    return state;
  }

  if (!otherPlayer.isGone && otherPlayer.position.x === nx && otherPlayer.position.y === ny) {
    return state;
  }

  if (isGateBlocked(nx, ny, state.redGates, state.activeSwitches)) {
    return state;
  }

  const enterFrom = getOppositeDirection(direction);
  if (!canEnterCell(state.oneWayBarriers, nx, ny, enterFrom, color)) {
    return state;
  }

  const target = state.targets[0];
  const reachedTarget = target && nx === target.x && ny === target.y;

  const isBacktracking =
    player.path.length >= 2 &&
    player.path[player.path.length - 2].x === nx &&
    player.path[player.path.length - 2].y === ny;

  const playerBarriers = state.oneWayBarriers.filter((b) => b.color === color);
  const canCreateNewBarrier = player.stepsRemaining > 0;

  if (!isBacktracking && !reachedTarget && !canCreateNewBarrier) {
    return state;
  }

  if (!isBacktracking && !reachedTarget && isPositionInPath(otherPlayer.path, nx, ny) && !otherPlayer.isGone) {
    return state;
  }

  const boxIdx = findBoxIndex(state.boxes, nx, ny);
  const newBoxes = state.boxes.map((b) => ({ ...b }));

  if (boxIdx !== -1) {
    const bx = nx + dir.x;
    const by = ny + dir.y;

    if (isWall(state.grid, bx, by)) return state;
    if (findBoxIndex(newBoxes, bx, by) !== -1) return state;
    if (findSwitchAt(state.switches, bx, by)) return state;
    if (isGateBlocked(bx, by, state.redGates, state.activeSwitches)) {
      return state;
    }

    newBoxes[boxIdx] = { x: bx, y: by };
  }

  let newStepsRemaining = player.stepsRemaining;
  let newPath: Position[];
  let pathTruncated = false;
  let newBarriers = [...state.oneWayBarriers];
  let barrierCreated: OneWayBarrier | undefined;
  let barrierRemoved: OneWayBarrier | undefined;

  if (isBacktracking) {
    newStepsRemaining = Math.min(player.maxSteps, player.stepsRemaining + 1);
    newPath = player.path.slice(0, -1);
    pathTruncated = true;

    const barrierToRemove = findBarrierAt(newBarriers, nx, ny);
    if (barrierToRemove) {
      newBarriers = newBarriers.filter(
        (b) => !(b.x === barrierToRemove.x && b.y === barrierToRemove.y),
      );
      barrierRemoved = barrierToRemove;
    }
  } else {
    newStepsRemaining = player.stepsRemaining - 1;
    newPath = [...player.path, { x: nx, y: ny }];

    if (!reachedTarget) {
      const newBarrier: OneWayBarrier = {
        x: player.position.x,
        y: player.position.y,
        color,
        exitDirection: direction,
      };
      newBarriers = [...newBarriers, newBarrier];
      barrierCreated = newBarrier;
    }
  }

  const newPlayer: DuoPlayerState = {
    ...player,
    position: { x: nx, y: ny },
    stepsRemaining: newStepsRemaining,
    path: newPath,
    isGone: reachedTarget,
  };

  const newHistory: MoveHistoryEntry = {
    color,
    from: { ...player.position },
    to: { x: nx, y: ny },
    boxPushed: boxIdx !== -1 ? { from: { x: nx, y: ny }, to: newBoxes[boxIdx] } : undefined,
    switchesToggledOn: [],
    switchesToggledOff: [],
    wasGone: player.isGone,
    pathTruncated,
    barrierCreated,
    barrierRemoved,
  };

  const newState: DuoGameState = {
    ...state,
    bluePlayer: color === 'blue' ? newPlayer : state.bluePlayer,
    redPlayer: color === 'red' ? newPlayer : state.redPlayer,
    boxes: newBoxes,
    oneWayBarriers: newBarriers,
    currentTurn: color === 'blue' ? 'red' : 'blue',
    steps: state.steps + 1,
    isWin: false,
    history: [...state.history, newHistory],
  };

  newState.isWin = checkDuoWin(newState);
  return newState;
}

export function undoDuoMove(state: DuoGameState): DuoGameState {
  if (state.history.length === 0 || state.isWin) return state;

  const lastMove = state.history[state.history.length - 1];
  const newHistory = state.history.slice(0, -1);

  const color = lastMove.color;
  const player = color === 'blue' ? state.bluePlayer : state.redPlayer;

  const newPath = lastMove.pathTruncated
    ? [...player.path, lastMove.to]
    : player.path.slice(0, -1);

  const newStepsRemaining = lastMove.pathTruncated
    ? Math.max(0, player.stepsRemaining - 1)
    : Math.min(player.maxSteps, player.stepsRemaining + 1);

  let newBarriers = [...state.oneWayBarriers];
  if (lastMove.barrierCreated) {
    newBarriers = newBarriers.filter(
      (b) => !(b.x === lastMove.barrierCreated!.x && b.y === lastMove.barrierCreated!.y),
    );
  }
  if (lastMove.barrierRemoved) {
    newBarriers = [...newBarriers, lastMove.barrierRemoved];
  }

  const newPlayer: DuoPlayerState = {
    ...player,
    position: { ...lastMove.from },
    stepsRemaining: newStepsRemaining,
    path: newPath,
    isGone: lastMove.wasGone,
  };

  let newBoxes = state.boxes.map((b) => ({ ...b }));
  if (lastMove.boxPushed) {
    const boxIdx = findBoxIndex(newBoxes, lastMove.boxPushed.to.x, lastMove.boxPushed.to.y);
    if (boxIdx !== -1) {
      newBoxes[boxIdx] = { ...lastMove.boxPushed.from };
    }
  }

  const newActiveSwitches = new Set(state.activeSwitches);
  for (const gateId of lastMove.switchesToggledOn) {
    newActiveSwitches.delete(gateId);
  }
  for (const gateId of lastMove.switchesToggledOff) {
    newActiveSwitches.add(gateId);
  }

  const otherColor: PlayerColor = color === 'blue' ? 'red' : 'blue';

  return {
    ...state,
    bluePlayer: color === 'blue' ? newPlayer : state.bluePlayer,
    redPlayer: color === 'red' ? newPlayer : state.redPlayer,
    boxes: newBoxes,
    oneWayBarriers: newBarriers,
    activeSwitches: newActiveSwitches,
    currentTurn: otherColor,
    steps: state.steps - 1,
    isWin: false,
    history: newHistory,
  };
}

export function checkDuoWin(state: DuoGameState): boolean {
  return state.bluePlayer.isGone && state.redPlayer.isGone;
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
    !state.bluePlayer.isGone &&
    state.bluePlayer.position.x === x &&
    state.bluePlayer.position.y === y;
  const hasRed =
    !state.redPlayer.isGone &&
    state.redPlayer.position.x === x &&
    state.redPlayer.position.y === y;
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