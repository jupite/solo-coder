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
    blueMaxSteps: 20,
    redMaxSteps: 20,
    boxes: [],
    targets: [
      { x: 5, y: 1 },
      { x: 5, y: 5 },
    ],
    redGates: [],
    switches: [],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 5 },
    blueMaxSteps: 25,
    redMaxSteps: 25,
    boxes: [],
    targets: [
      { x: 6, y: 2 },
      { x: 6, y: 4 },
    ],
    redGates: [
      { x: 4, y: 2, switchId: 'pair-0' },
      { x: 4, y: 4, switchId: 'pair-0' },
    ],
    switches: [
      { x: 1, y: 3, gateId: 'pair-0' },
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
    blueMaxSteps: 40,
    redMaxSteps: 40,
    boxes: [
      { x: 3, y: 2 },
      { x: 3, y: 4 },
    ],
    targets: [
      { x: 7, y: 2 },
      { x: 7, y: 4 },
    ],
    redGates: [],
    switches: [],
  },
];

export function getDuoLevel(index: number): DuoLevelData {
  return duoLevels[Math.max(0, Math.min(index, duoLevels.length - 1))];
}
