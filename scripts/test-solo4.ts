import { LevelData, GameState, Direction, Position } from '../src/lib/game/types';
import { createGameState, movePlayer } from '../src/lib/game/engine';

const MAX_STEPS = 200;
const MAX_ITERATIONS = 100000;
const MAX_QUEUE_SIZE = 50000;

const DIRS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

interface BFSNode {
  state: GameState;
  moves: Direction[];
}

function stateHash(state: GameState): string {
  const sortedBoxes = [...state.boxes]
    .sort((a, b) => a.x - b.x || a.y - b.y)
    .map((b) => `${b.x},${b.y}`)
    .join(';');
  return `${state.player.x},${state.player.y}|${sortedBoxes}`;
}

function solveLevelNoDeadlock(
  levelData: LevelData,
  maxSteps: number = MAX_STEPS,
): Direction[] | null {
  const initialState = createGameState(levelData);

  if (initialState.isWin) {
    return [];
  }

  const queue: BFSNode[] = [{ state: initialState, moves: [] }];
  const visited = new Set<string>();
  visited.add(stateHash(initialState));

  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  let iterations = 0;

  while (queue.length > 0) {
    iterations++;
    
    if (iterations > MAX_ITERATIONS || queue.length > MAX_QUEUE_SIZE) {
      console.log(`Limit reached after ${iterations} iterations, queue size: ${queue.length}`);
      return null;
    }

    const current = queue.shift()!;
    
    if (current.moves.length >= maxSteps) {
      continue;
    }

    for (const dir of directions) {
      const nextState = movePlayer(current.state, dir);

      if (nextState === current.state) continue;

      const hash = stateHash(nextState);
      if (visited.has(hash)) continue;

      visited.add(hash);

      const newMoves = [...current.moves, dir];

      if (nextState.isWin) {
        return newMoves;
      }

      if (newMoves.length < maxSteps) {
        queue.push({ state: nextState, moves: newMoves });
      }
    }
  }

  return null;
}

const testLevel: LevelData = {
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  player: { x: 1, y: 1 },
  boxes: [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }],
  targets: [{ x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }],
};

console.log('Testing 4-box level (even smaller, no deadlock detection)...');
const solution = solveLevelNoDeadlock(testLevel, 200);
if (solution) {
  console.log(`✓ Solution found in ${solution.length} steps`);
} else {
  console.log('✗ NO SOLUTION');
}
