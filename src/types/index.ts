export enum PokemonType {
    NORMAL = 'normal',
    FIRE = 'fire',
    WATER = 'water',
    ELECTRIC = 'electric',
    GRASS = 'grass',
    ICE = 'ice',
    FIGHTING = 'fighting',
    POISON = 'poison',
    GROUND = 'ground',
    FLYING = 'flying',
    PSYCHIC = 'psychic',
    BUG = 'bug',
    ROCK = 'rock',
    GHOST = 'ghost',
    DRAGON = 'dragon',
    DARK = 'dark',
    STEEL = 'steel',
    FAIRY = 'fairy'
}

export enum MoveCategory {
    PHYSICAL = 'physical',
    SPECIAL = 'special',
    STATUS = 'status'
}

export enum ItemType {
    HEAL = 'heal',
    BUFF = 'buff',
    DAMAGE = 'damage'
}

export interface BaseStats {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
}

export interface MoveData {
    id: string;
    name: string;
    type: PokemonType;
    power: number;
    accuracy: number;
    pp: number;
    category: MoveCategory;
    description: string;
    currentPp?: number;
}

export interface PokemonData {
    id: number;
    name: string;
    types: PokemonType[];
    baseStats: BaseStats;
    moves: string[];
    color: number[];
    secondaryColor: number[];
    description: string;
    shape: string;
}

export interface ItemData {
    id: string;
    name: string;
    description: string;
    price: number;
    type: ItemType;
    effect: number;
    stat?: string;
    quantity?: number;
}

export interface Stats {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
}

export interface PokemonState {
    id: number;
    name: string;
    level?: number;
    currentHp: number;
    maxHp: number;
    types: PokemonType[];
    color?: number[];
    secondaryColor?: number[];
    shape?: string;
    moves?: Array<{
        name: string;
        type: PokemonType;
        power: number;
        currentPp: number;
        maxPp: number;
    }>;
    stats?: Stats;
    isActive?: boolean;
    isFainted?: boolean;
}

export interface BattleState {
    turn: number;
    isPlayerTurn: boolean;
    battleOver: boolean;
    winner: 'player' | 'enemy' | null;
    playerTeam: PokemonState[];
    enemyTeam: PokemonState[];
    activePlayerIndex: number;
    activeEnemyIndex: number;
    playerPokemon: PokemonState;
    enemyPokemon: PokemonState;
    playerBackpack: ItemData[];
    battleLog: string[];
}

export interface DamageResult {
    damage: number;
    effectiveness: number;
    critical: boolean;
    missed: boolean;
}

export interface MoveResult extends DamageResult {
    message: string;
    move: MoveData;
}

export interface ItemResult {
    message: string;
    damage: number;
    missed: boolean;
    item?: ItemData;
}

export interface SwitchResult {
    success: boolean;
    message: string;
    oldPokemon?: PokemonState;
    newPokemon?: PokemonState;
}

export const TypeColors: Record<PokemonType, number[]> = {
    [PokemonType.NORMAL]: [0.659, 0.659, 0.471, 1.0],
    [PokemonType.FIRE]: [0.941, 0.502, 0.188, 1.0],
    [PokemonType.WATER]: [0.408, 0.565, 0.941, 1.0],
    [PokemonType.ELECTRIC]: [0.973, 0.816, 0.188, 1.0],
    [PokemonType.GRASS]: [0.469, 0.784, 0.314, 1.0],
    [PokemonType.ICE]: [0.596, 0.847, 0.847, 1.0],
    [PokemonType.FIGHTING]: [0.753, 0.188, 0.157, 1.0],
    [PokemonType.POISON]: [0.627, 0.251, 0.627, 1.0],
    [PokemonType.GROUND]: [0.878, 0.753, 0.408, 1.0],
    [PokemonType.FLYING]: [0.659, 0.565, 0.941, 1.0],
    [PokemonType.PSYCHIC]: [0.973, 0.345, 0.533, 1.0],
    [PokemonType.BUG]: [0.659, 0.722, 0.125, 1.0],
    [PokemonType.ROCK]: [0.722, 0.627, 0.220, 1.0],
    [PokemonType.GHOST]: [0.439, 0.345, 0.596, 1.0],
    [PokemonType.DRAGON]: [0.439, 0.220, 0.973, 1.0],
    [PokemonType.DARK]: [0.439, 0.345, 0.282, 1.0],
    [PokemonType.STEEL]: [0.722, 0.722, 0.816, 1.0],
    [PokemonType.FAIRY]: [0.933, 0.600, 0.675, 1.0]
};

const TypeEffectiveness: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
    [PokemonType.NORMAL]: {
        [PokemonType.ROCK]: 0.5,
        [PokemonType.GHOST]: 0,
        [PokemonType.STEEL]: 0.5
    },
    [PokemonType.FIRE]: {
        [PokemonType.FIRE]: 0.5,
        [PokemonType.WATER]: 0.5,
        [PokemonType.GRASS]: 2,
        [PokemonType.ICE]: 2,
        [PokemonType.BUG]: 2,
        [PokemonType.ROCK]: 0.5,
        [PokemonType.DRAGON]: 0.5,
        [PokemonType.STEEL]: 2
    },
    [PokemonType.WATER]: {
        [PokemonType.FIRE]: 2,
        [PokemonType.WATER]: 0.5,
        [PokemonType.GRASS]: 0.5,
        [PokemonType.GROUND]: 2,
        [PokemonType.ROCK]: 2,
        [PokemonType.DRAGON]: 0.5
    },
    [PokemonType.ELECTRIC]: {
        [PokemonType.WATER]: 2,
        [PokemonType.ELECTRIC]: 0.5,
        [PokemonType.GRASS]: 0.5,
        [PokemonType.GROUND]: 0,
        [PokemonType.FLYING]: 2,
        [PokemonType.DRAGON]: 0.5
    },
    [PokemonType.GRASS]: {
        [PokemonType.FIRE]: 0.5,
        [PokemonType.WATER]: 2,
        [PokemonType.GRASS]: 0.5,
        [PokemonType.POISON]: 0.5,
        [PokemonType.GROUND]: 2,
        [PokemonType.FLYING]: 0.5,
        [PokemonType.BUG]: 0.5,
        [PokemonType.ROCK]: 2,
        [PokemonType.DRAGON]: 0.5
    },
    [PokemonType.ICE]: {
        [PokemonType.FIRE]: 0.5,
        [PokemonType.WATER]: 0.5,
        [PokemonType.GRASS]: 2,
        [PokemonType.ICE]: 0.5,
        [PokemonType.GROUND]: 2,
        [PokemonType.FLYING]: 2,
        [PokemonType.DRAGON]: 2,
        [PokemonType.STEEL]: 0.5
    },
    [PokemonType.FIGHTING]: {
        [PokemonType.NORMAL]: 2,
        [PokemonType.ICE]: 2,
        [PokemonType.POISON]: 0.5,
        [PokemonType.FLYING]: 0.5,
        [PokemonType.PSYCHIC]: 0.5,
        [PokemonType.BUG]: 0.5,
        [PokemonType.ROCK]: 2,
        [PokemonType.GHOST]: 0,
        [PokemonType.DARK]: 2,
        [PokemonType.STEEL]: 2,
        [PokemonType.FAIRY]: 0.5
    },
    [PokemonType.POISON]: {
        [PokemonType.GRASS]: 2,
        [PokemonType.POISON]: 0.5,
        [PokemonType.GROUND]: 0.5,
        [PokemonType.ROCK]: 0.5,
        [PokemonType.GHOST]: 0.5,
        [PokemonType.STEEL]: 0,
        [PokemonType.FAIRY]: 2
    },
    [PokemonType.GROUND]: {
        [PokemonType.FIRE]: 2,
        [PokemonType.ELECTRIC]: 2,
        [PokemonType.GRASS]: 0.5,
        [PokemonType.POISON]: 2,
        [PokemonType.FLYING]: 0,
        [PokemonType.BUG]: 0.5,
        [PokemonType.ROCK]: 2,
        [PokemonType.STEEL]: 2
    },
    [PokemonType.FLYING]: {
        [PokemonType.GRASS]: 2,
        [PokemonType.FIGHTING]: 2,
        [PokemonType.BUG]: 2,
        [PokemonType.ROCK]: 0.5,
        [PokemonType.STEEL]: 0.5
    },
    [PokemonType.PSYCHIC]: {
        [PokemonType.FIGHTING]: 2,
        [PokemonType.POISON]: 2,
        [PokemonType.PSYCHIC]: 0.5,
        [PokemonType.DARK]: 0,
        [PokemonType.STEEL]: 0.5
    },
    [PokemonType.BUG]: {
        [PokemonType.FIRE]: 0.5,
        [PokemonType.GRASS]: 2,
        [PokemonType.FIGHTING]: 0.5,
        [PokemonType.POISON]: 0.5,
        [PokemonType.FLYING]: 0.5,
        [PokemonType.PSYCHIC]: 2,
        [PokemonType.GHOST]: 0.5,
        [PokemonType.DARK]: 2,
        [PokemonType.STEEL]: 0.5,
        [PokemonType.FAIRY]: 0.5
    },
    [PokemonType.ROCK]: {
        [PokemonType.FIRE]: 2,
        [PokemonType.ICE]: 2,
        [PokemonType.FIGHTING]: 0.5,
        [PokemonType.GROUND]: 0.5,
        [PokemonType.FLYING]: 2,
        [PokemonType.BUG]: 2,
        [PokemonType.STEEL]: 0.5
    },
    [PokemonType.GHOST]: {
        [PokemonType.NORMAL]: 0,
        [PokemonType.PSYCHIC]: 2,
        [PokemonType.GHOST]: 2,
        [PokemonType.DARK]: 0.5
    },
    [PokemonType.DRAGON]: {
        [PokemonType.DRAGON]: 2,
        [PokemonType.STEEL]: 0.5,
        [PokemonType.FAIRY]: 0
    },
    [PokemonType.DARK]: {
        [PokemonType.FIGHTING]: 0.5,
        [PokemonType.PSYCHIC]: 2,
        [PokemonType.GHOST]: 2,
        [PokemonType.DARK]: 0.5,
        [PokemonType.FAIRY]: 0.5
    },
    [PokemonType.STEEL]: {
        [PokemonType.FIRE]: 0.5,
        [PokemonType.WATER]: 0.5,
        [PokemonType.ELECTRIC]: 0.5,
        [PokemonType.ICE]: 2,
        [PokemonType.ROCK]: 2,
        [PokemonType.STEEL]: 0.5,
        [PokemonType.FAIRY]: 2
    },
    [PokemonType.FAIRY]: {
        [PokemonType.FIRE]: 0.5,
        [PokemonType.FIGHTING]: 2,
        [PokemonType.POISON]: 0.5,
        [PokemonType.DRAGON]: 2,
        [PokemonType.DARK]: 2,
        [PokemonType.STEEL]: 0.5
    }
};

export function getTypeEffectiveness(moveType: PokemonType, defenderType: PokemonType): number {
    if (!TypeEffectiveness[moveType]) {
        return 1;
    }
    
    const effectiveness = TypeEffectiveness[moveType][defenderType];
    return effectiveness !== undefined ? effectiveness : 1;
}

export function getStab(moveType: PokemonType, pokemonTypes: PokemonType[]): number {
    return pokemonTypes.includes(moveType) ? 1.5 : 1;
}

export function getMoveColor(moveType: PokemonType): number[] {
    return TypeColors[moveType] || TypeColors[PokemonType.NORMAL];
}