import { solveLevel } from '../src/lib/game/solver';
import { solveDuoLevel } from '../src/lib/game/duo-solver';
import { LevelData, DuoLevelData, CellType } from '../src/lib/game/types';

const testSoloLevels: LevelData[] = [
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    player: { x: 1, y: 1 },
    boxes: [{ x: 3, y: 3 }],
    targets: [{ x: 5, y: 5 }],
  },
];

console.log('Testing solo levels...');
for (let i = 0; i < testSoloLevels.length; i++) {
  const solution = solveLevel(testSoloLevels[i], 100000);
  console.log(`Level ${i + 1}: ${solution ? `Solved in ${solution.length} steps` : 'No solution'}`);
  if (solution) {
    console.log(`  Solution: ${solution.join(' -> ')}`);
  }
}

const testDuoLevels: DuoLevelData[] = [
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 5 },
    blueMaxSteps: 30,
    redMaxSteps: 30,
    boxes: [],
    targets: [
      { x: 5, y: 1 },
      { x: 5, y: 5 },
    ],
    redGates: [],
    switches: [],
  },
];

console.log('\nTesting duo levels...');
for (let i = 0; i < testDuoLevels.length; i++) {
  const solution = solveDuoLevel(testDuoLevels[i], 100000);
  console.log(`Level ${i + 1}: ${solution ? `Solved in ${solution.length} steps` : 'No solution'}`);
  if (solution) {
    console.log(`  Solution: ${solution.map(s => `${s.color}:${s.direction}`).join(' -> ')}`);
  }
}
