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
    redPlayer: { x: 1, y: 2 },
    blueMaxSteps: 15,
    redMaxSteps: 15,
    boxes: [],
    targets: [
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
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 2 },
    blueMaxSteps: 20,
    redMaxSteps: 20,
    boxes: [],
    targets: [
      { x: 6, y: 5 },
    ],
    redGates: [
      { x: 4, y: 3, switchId: 'sw1' },
    ],
    switches: [
      { x: 2, y: 5, gateId: 'sw1' },
    ],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 2 },
    blueMaxSteps: 25,
    redMaxSteps: 25,
    boxes: [],
    targets: [
      { x: 7, y: 5 },
    ],
    redGates: [
      { x: 6, y: 4, switchId: 'sw1' },
    ],
    switches: [
      { x: 2, y: 5, gateId: 'sw1' },
    ],
  },
];

export function getDuoLevel(index: number): DuoLevelData {
  return duoLevels[Math.max(0, Math.min(index, duoLevels.length - 1))];
}