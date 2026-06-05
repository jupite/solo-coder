import { CellType, DuoLevelData } from './types';

export const duoLevels: DuoLevelData[] = [
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
    boxes: [

    ],
    targets: [
      { x: 5, y: 1 },
      { x: 5, y: 5 },
    ],
    redGates: [

    ],
    switches: [

    ],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 5 },
    blueMaxSteps: 40,
    redMaxSteps: 40,
    boxes: [

    ],
    targets: [
      { x: 6, y: 1 },
      { x: 6, y: 5 },
    ],
    redGates: [

    ],
    switches: [

    ],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 5 },
    blueMaxSteps: 50,
    redMaxSteps: 50,
    boxes: [
      { x: 3, y: 3 }
    ],
    targets: [
      { x: 6, y: 1 },
      { x: 6, y: 5 },
    ],
    redGates: [

    ],
    switches: [

    ],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 5 },
    blueMaxSteps: 60,
    redMaxSteps: 60,
    boxes: [
      { x: 3, y: 2 },
      { x: 3, y: 4 }
    ],
    targets: [
      { x: 7, y: 1 },
      { x: 7, y: 5 },
    ],
    redGates: [

    ],
    switches: [

    ],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 6 },
    blueMaxSteps: 80,
    redMaxSteps: 80,
    boxes: [
      { x: 4, y: 3 },
      { x: 4, y: 4 },
    ],
    targets: [
      { x: 8, y: 1 },
      { x: 8, y: 6 },
    ],
    redGates: [],
    switches: [],
  },
];

export function getDuoLevel(index: number): DuoLevelData {
  return duoLevels[Math.max(0, Math.min(index, duoLevels.length - 1))];
}
