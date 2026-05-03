export type PokemonType = 
  | 'normal' 
  | 'fire' 
  | 'water' 
  | 'electric' 
  | 'grass' 
  | 'ice' 
  | 'fighting' 
  | 'poison' 
  | 'ground' 
  | 'flying' 
  | 'psychic' 
  | 'bug' 
  | 'rock' 
  | 'ghost' 
  | 'dragon' 
  | 'dark' 
  | 'steel' 
  | 'fairy';

export type MoveCategory = 'physical' | 'special' | 'status';

export type ItemType = 'heal' | 'buff_attack' | 'buff_defense' | 'buff_evasion' | 'damage';

export type ShapeType = 'pikachu' | 'charmander' | 'squirtle' | 'bulbasaur' | 'pidgey' | 'raichu' | 'clefairy' | 'zubat' | 'psyduck' | 'poliwag';

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface MoveData {
  name: string;
  type: PokemonType;
  power: number;
  accuracy: number;
  pp: number;
  category: MoveCategory;
  description: string;
}

export interface PokemonMove extends MoveData {
  id: string;
  currentPp: number;
}

export interface PokemonDataType {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: Stats;
  moves: string[];
  color: [number, number, number, number];
  secondaryColor: [number, number, number, number];
  description: string;
  shape: ShapeType;
}

export interface ItemData {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  price: number;
  value: number;
  icon: string;
  color: string;
}

export interface Item extends ItemData {
  quantity: number;
}

export interface PlayerBuffs {
  attackBoost: number;
  defenseBoost: number;
  evasionBoost: number;
}

export interface BattleLogEntry {
  message: string;
  turn: number;
}

export interface BattleState {
  turn: number;
  isPlayerTurn: boolean;
  battleOver: boolean;
  winner: 'player' | 'enemy' | null;
  playerTeam: TeamPokemon[];
  enemyTeam: TeamPokemon[];
  activePlayerIndex: number;
  activeEnemyIndex: number;
  playerPokemon: ActivePokemonState;
  enemyPokemon: ActivePokemonState;
  playerBackpack: Record<string, Item>;
  battleLog: string[];
}

export interface TeamPokemon {
  id: number;
  name: string;
  currentHp: number;
  maxHp: number;
  types: PokemonType[];
  color: [number, number, number, number];
  secondaryColor: [number, number, number, number];
  shape: ShapeType;
  isActive: boolean;
  isFainted: boolean;
}

export interface ActivePokemonState {
  name: string;
  currentHp: number;
  maxHp: number;
  types: PokemonType[];
  moves?: ActiveMove[];
}

export interface ActiveMove {
  name: string;
  type: PokemonType;
  power: number;
  currentPp: number;
  maxPp: number;
}

export interface DamageResult {
  damage: number;
  effectiveness: number;
  critical: boolean;
  missed: boolean;
  evaded?: boolean;
}

export interface MoveResult extends DamageResult {
  message: string;
  move: PokemonMove;
}

export interface SwitchResult {
  success: boolean;
  message: string;
  oldPokemon?: Pokemon;
  newPokemon?: Pokemon;
}

export interface ItemResult {
  success: boolean;
  message: string;
  item?: Item;
  healAmount?: number;
  buffType?: 'attack' | 'defense' | 'evasion';
  damage?: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  level: number;
  baseStats: Stats;
  moves: PokemonMove[];
  color: [number, number, number, number];
  secondaryColor: [number, number, number, number];
  description: string;
  shape: ShapeType;
  currentHp: number;
  maxHp: number;
  stats: Stats;
  calculateStats(): void;
  takeDamage(damage: number): number;
  heal(amount: number): number;
  isFainted(): boolean;
  restorePp(): void;
  getAvailableMoves(): PokemonMove[];
}