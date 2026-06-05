export type Direction = 'up' | 'down' | 'left' | 'right';

export type PlayerColor = 'blue' | 'red';

export enum CellType {
  FLOOR = 0,
  WALL = 1,
  TARGET = 2,
  BOX = 3,
  PLAYER = 4,
  BOX_ON_TARGET = 5,
  PLAYER_ON_TARGET = 6,
  RED_GATE = 7,
  SWITCH_OFF = 8,
  SWITCH_ON = 9,
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

export interface RedGate {
  x: number;
  y: number;
  switchId: string | number;
}

export interface SwitchItem {
  x: number;
  y: number;
  id?: string | number;
  gateId?: string | number;
}

export interface OneWayBarrier {
  x: number;
  y: number;
  color: PlayerColor;
  exitDirection: Direction;
}

export interface DuoLevelData {
  grid: CellType[][];
  bluePlayer: Position;
  redPlayer: Position;
  blueMaxSteps: number;
  redMaxSteps: number;
  boxes: Position[];
  targets: Position[];
  redGates: RedGate[];
  switches: SwitchItem[];
}

export interface DuoPlayerState {
  position: Position;
  origin: Position;
  stepsRemaining: number;
  maxSteps: number;
  path: Position[];
  isGone: boolean;
}

export interface MoveHistoryEntry {
  color: PlayerColor;
  from: Position;
  to: Position;
  boxPushed?: { from: Position; to: Position };
  switchesToggledOn: (string | number)[];
  switchesToggledOff: (string | number)[];
  wasGone: boolean;
  pathTruncated?: boolean;
  barrierCreated?: OneWayBarrier;
  barrierRemoved?: OneWayBarrier;
}

export interface DuoGameState {
  grid: CellType[][];
  bluePlayer: DuoPlayerState;
  redPlayer: DuoPlayerState;
  boxes: Position[];
  targets: Position[];
  redGates: RedGate[];
  switches: SwitchItem[];
  oneWayBarriers: OneWayBarrier[];
  activeSwitches: Set<string | number>;
  currentTurn: PlayerColor;
  steps: number;
  isWin: boolean;
  history: MoveHistoryEntry[];
}

export interface DuoGravityLevelData {
  name?: string;
  grid: CellType[][];
  bluePlayer: Position;
  redPlayer: Position;
  boxes: Position[];
  targets: Position[];
}

export interface DuoGravityPlayerState {
  position: Position;
  origin: Position;
  onTarget: boolean;
}

export interface DuoGravityMoveHistoryEntry {
  color: PlayerColor;
  from: Position;
  to: Position;
  boxesMoved: { from: Position; to: Position }[];
  blueOnTarget: boolean;
  redOnTarget: boolean;
}

export interface DuoGravityGameState {
  grid: CellType[][];
  bluePlayer: DuoGravityPlayerState;
  redPlayer: DuoGravityPlayerState;
  boxes: Position[];
  initialBoxes: Position[];
  targets: Position[];
  currentTurn: PlayerColor;
  steps: number;
  isWin: boolean;
  history: DuoGravityMoveHistoryEntry[];
}