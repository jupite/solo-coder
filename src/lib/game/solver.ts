import { CellType, Direction, GameState, LevelData, Position } from './types';
import { createGameState, movePlayer } from './engine';

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

export function solveLevel(
  levelData: LevelData,
  maxIterations: number = 500000,
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

  while (queue.length > 0 && iterations < maxIterations) {
    iterations++;
    const current = queue.shift()!;

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

      queue.push({ state: nextState, moves: newMoves });
    }
  }

  return null;
}
