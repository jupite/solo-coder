import {
  Direction,
  DuoGameState,
  DuoLevelData,
  PlayerColor,
  Position,
} from './types';
import { createDuoGameState, moveDuoPlayer, toggleSwitch } from './duo-engine';

const MAX_STEPS = 200;
const MAX_ITERATIONS = 100000;
const MAX_HEAP_SIZE = 30000;

export interface DuoSolveStep {
  color: PlayerColor;
  direction: Direction;
  isSwitchToggle?: boolean;
  switchX?: number;
  switchY?: number;
}

interface BFSNode {
  state: DuoGameState;
  moves: DuoSolveStep[];
  priority: number;
}

function compactHash(state: DuoGameState): string {
  const bp = state.bluePlayer;
  const rp = state.redPlayer;

  const boxesKey = state.boxes
    .slice()
    .sort((a, b) => a.x - b.x || a.y - b.y)
    .map(b => `${b.x},${b.y}`)
    .join(';');

  const barriersKey = state.oneWayBarriers
    .slice()
    .sort((a, b) => a.x - b.x || a.y - b.y || a.color.localeCompare(b.color) || a.exitDirection.localeCompare(b.exitDirection))
    .map(b => `${b.x},${b.y},${b.color},${b.exitDirection}`)
    .join(';');

  const activeSw = [...state.activeSwitches].sort().join(',');

  return (
    `${bp.position.x},${bp.position.y},${bp.isGone},${bp.stepsRemaining}|` +
    `${rp.position.x},${rp.position.y},${rp.isGone},${rp.stepsRemaining}|` +
    `${boxesKey}|${barriersKey}|${activeSw}`
  );
}

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function findNearestTarget(playerPos: Position, targets: Position[], otherPlayerGone: boolean, otherPlayerPos: Position): number {
  let minDist = Infinity;
  for (const t of targets) {
    if (!otherPlayerGone && t.x === otherPlayerPos.x && t.y === otherPlayerPos.y) continue;
    const d = manhattanDistance(playerPos, t);
    if (d < minDist) minDist = d;
  }
  return minDist === Infinity ? 0 : minDist;
}

function heuristic(state: DuoGameState): number {
  const targets = state.targets;
  const bp = state.bluePlayer;
  const rp = state.redPlayer;

  let h = 0;

  if (!bp.isGone) {
    h += findNearestTarget(bp.position, targets, rp.isGone, rp.position);
  }
  if (!rp.isGone) {
    h += findNearestTarget(rp.position, targets, bp.isGone, bp.position);
  }

  const unfinishedPlayers = (bp.isGone ? 0 : 1) + (rp.isGone ? 0 : 1);
  h += unfinishedPlayers * 2;
  return h;
}

function isDeadlock(state: DuoGameState): boolean {
  const bp = state.bluePlayer;
  const rp = state.redPlayer;
  const directions: Direction[] = ['up', 'down', 'left', 'right'];

  if (!bp.isGone) {
    let hasValidMove = false;
    for (const dir of directions) {
      const next = moveDuoPlayer(state, 'blue', dir);
      if (next !== state) {
        hasValidMove = true;
        break;
      }
    }
    if (!hasValidMove && bp.stepsRemaining <= 0) {
      return true;
    }
  }

  if (!rp.isGone) {
    let hasValidMove = false;
    for (const dir of directions) {
      const next = moveDuoPlayer(state, 'red', dir);
      if (next !== state) {
        hasValidMove = true;
        break;
      }
    }
    if (!hasValidMove && rp.stepsRemaining <= 0) {
      return true;
    }
  }

  const targets = state.targets;

  if (!bp.isGone) {
    let canReachAny = false;
    for (const t of targets) {
      if (!rp.isGone && t.x === rp.position.x && t.y === rp.position.y) continue;
      const dist = manhattanDistance(bp.position, t);
      if (dist <= bp.stepsRemaining + 10) {
        canReachAny = true;
        break;
      }
    }
    if (!canReachAny) return true;
  }

  if (!rp.isGone) {
    let canReachAny = false;
    for (const t of targets) {
      if (!bp.isGone && t.x === bp.position.x && t.y === bp.position.y) continue;
      const dist = manhattanDistance(rp.position, t);
      if (dist <= rp.stepsRemaining + 10) {
        canReachAny = true;
        break;
      }
    }
    if (!canReachAny) return true;
  }

  return false;
}

function comparePriority(a: BFSNode, b: BFSNode): number {
  return a.priority - b.priority;
}

export function solveDuoLevel(
  levelData: DuoLevelData,
  maxSteps: number = MAX_STEPS,
): DuoSolveStep[] | null {
  const initialState = createDuoGameState(levelData);
  return solveDuoFromState(initialState, maxSteps);
}

export function solveDuoFromState(
  startState: DuoGameState,
  maxSteps: number = MAX_STEPS,
): DuoSolveStep[] | null {
  if (startState.isWin) {
    return [];
  }

  const startH = heuristic(startState);

  const heap: BFSNode[] = [{ state: startState, moves: [], priority: startH }];
  const visited = new Map<string, number>();
  visited.set(compactHash(startState), startH);

  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  let iterations = 0;

  while (heap.length > 0) {
    iterations++;

    if (iterations > MAX_ITERATIONS || heap.length > MAX_HEAP_SIZE) {
      return null;
    }

    heap.sort(comparePriority);
    const current = heap.shift()!;

    if (current.moves.length >= maxSteps) {
      continue;
    }

    if (current.state.isWin) {
      return current.moves;
    }

    if (isDeadlock(current.state)) {
      continue;
    }

    const activeColors: PlayerColor[] = [];
    if (!current.state.bluePlayer.isGone) activeColors.push('blue');
    if (!current.state.redPlayer.isGone) activeColors.push('red');

    for (const color of activeColors) {
      for (const dir of directions) {
        iterations++;
        if (iterations > MAX_ITERATIONS) return null;

        const nextState = moveDuoPlayer(current.state, color, dir);
        if (nextState === current.state) continue;

        const hash = compactHash(nextState);
        const nextMoves = [...current.moves, { color, direction: dir }];
        
        if (nextMoves.length >= maxSteps) {
          if (nextState.isWin) {
            return nextMoves;
          }
          continue;
        }

        const nextH = heuristic(nextState);
        const nextPriority = nextMoves.length + nextH;

        const existing = visited.get(hash);
        if (existing !== undefined && existing <= nextPriority) {
          continue;
        }
        visited.set(hash, nextPriority);

        if (nextState.isWin) {
          return nextMoves;
        }

        heap.push({ state: nextState, moves: nextMoves, priority: nextPriority });
      }
    }

    for (const sw of current.state.switches) {
      for (const color of activeColors) {
        const player = color === 'blue' ? current.state.bluePlayer : current.state.redPlayer;
        const dx = Math.abs(player.position.x - sw.x);
        const dy = Math.abs(player.position.y - sw.y);
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
          iterations++;
          if (iterations > MAX_ITERATIONS) return null;

          const nextState = toggleSwitch(current.state, sw.x, sw.y, color);
          if (nextState === current.state) continue;

          const hash = compactHash(nextState);
          const nextMoves = [...current.moves, { color, direction: 'up' as Direction, isSwitchToggle: true, switchX: sw.x, switchY: sw.y }];
          
          if (nextMoves.length >= maxSteps) {
            continue;
          }

          const nextH = heuristic(nextState);
          const nextPriority = nextMoves.length + nextH;

          const existing = visited.get(hash);
          if (existing !== undefined && existing <= nextPriority) {
            continue;
          }
          visited.set(hash, nextPriority);

          heap.push({ state: nextState, moves: nextMoves, priority: nextPriority });
        }
      }
    }
  }

  return null;
}
