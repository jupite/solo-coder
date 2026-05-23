export type Direction = 'up' | 'down' | 'left' | 'right';

export enum CellType {
  FLOOR = 0,
  WALL = 1,
  TARGET = 2,
  BOX = 3,
  PLAYER = 4,
  BOX_ON_TARGET = 5,
  PLAYER_ON_TARGET = 6,
}

export interface Position {
  x: number;
  y: number;
}

export interface LevelData {
  grid: CellType[][];
  player: Position;
  boxes: Position[];
  targets: Position[];
}

export interface GameState {
  grid: CellType[][];
  player: Position;
  boxes: Position[];
  targets: Position[];
  steps: number;
  isWin: boolean;
}
