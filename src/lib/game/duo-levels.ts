import { CellType, DuoLevelData } from './types';

export const duoLevels: DuoLevelData[] = [
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 2 },
    blueMaxSteps: 20,
    redMaxSteps: 20,
    boxes: [{ x: 3, y: 3 }],
    targets: [
      { x: 5, y: 4 },
      { x: 5, y: 5 },
    ],
    redGates: [],
    switches: [],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 2, 1],
      [1, 0, 0, 0, 1, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 2 },
    blueMaxSteps: 25,
    redMaxSteps: 25,
    boxes: [
      { x: 2, y: 4 },
      { x: 3, y: 4 },
    ],
    targets: [
      { x: 6, y: 4 },
      { x: 6, y: 5 },
    ],
    redGates: [
      { x: 4, y: 3, switchId: 'sw1' },
    ],
    switches: [
      { x: 3, y: 5, gateId: 'sw1' },
    ],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 2 },
    blueMaxSteps: 30,
    redMaxSteps: 30,
    boxes: [
      { x: 5, y: 1 },
      { x: 5, y: 2 },
    ],
    targets: [
      { x: 7, y: 5 },
      { x: 7, y: 6 },
    ],
    redGates: [
      { x: 6, y: 4, switchId: 'sw1' },
    ],
    switches: [
      { x: 2, y: 6, gateId: 'sw1' },
    ],
  },
];

export function getDuoLevel(index: number): DuoLevelData {
  return duoLevels[Math.max(0, Math.min(index, duoLevels.length - 1))];
}