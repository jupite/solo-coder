import { CellType, DuoGravityLevelData } from './types';

export const duoGravityLevels: DuoGravityLevelData[] = [
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 8, y: 1 },
    boxes: [
      { x: 4, y: 5 },
      { x: 5, y: 5 },
    ],
    targets: [
      { x: 1, y: 6 },
      { x: 8, y: 6 },
    ],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 8, y: 1 },
    boxes: [
      { x: 3, y: 5 },
      { x: 6, y: 5 },
      { x: 5, y: 5 },
    ],
    targets: [
      { x: 1, y: 6 },
      { x: 8, y: 6 },
    ],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 9, y: 1 },
    boxes: [
      { x: 2, y: 6 },
      { x: 3, y: 6 },
      { x: 7, y: 6 },
      { x: 8, y: 6 },
      { x: 5, y: 6 },
    ],
    targets: [
      { x: 1, y: 7 },
      { x: 9, y: 7 },
    ],
  },
];

export function getDuoGravityLevel(index: number): DuoGravityLevelData {
  return duoGravityLevels[Math.max(0, Math.min(index, duoGravityLevels.length - 1))];
}
