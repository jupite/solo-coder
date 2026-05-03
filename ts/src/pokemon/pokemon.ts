import type { PokemonDataType, PokemonMove, Stats, PokemonType, ShapeType, Pokemon } from '../types';
import { getMove } from './moves';
import { PokemonTypes } from './types';

export const PokemonData: PokemonDataType[] = [
  {
    id: 1,
    name: '皮卡丘',
    types: [PokemonTypes.ELECTRIC],
    baseStats: {
      hp: 35,
      attack: 55,
      defense: 40,
      specialAttack: 50,
      specialDefense: 50,
      speed: 90
    },
    moves: ['quickAttack', 'thunderShock', 'thunderbolt', 'ironTail'],
    color: [1.0, 0.9, 0.0, 1.0],
    secondaryColor: [0.8, 0.6, 0.0, 1.0],
    description: '电气鼠宝可梦，尾巴末端有一个黄色的闪电形状。',
    shape: 'pikachu'
  },
  {
    id: 4,
    name: '小火龙',
    types: [PokemonTypes.FIRE],
    baseStats: {
      hp: 39,
      attack: 52,
      defense: 43,
      specialAttack: 60,
      specialDefense: 50,
      speed: 65
    },
    moves: ['scratch', 'ember', 'flamethrower', 'fireBlast'],
    color: [1.0, 0.5, 0.0, 1.0],
    secondaryColor: [0.9, 0.7, 0.5, 1.0],
    description: '蜥蜴宝可梦，尾巴上燃烧着小火焰。',
    shape: 'charmander'
  },
  {
    id: 7,
    name: '杰尼龟',
    types: [PokemonTypes.WATER],
    baseStats: {
      hp: 44,
      attack: 48,
      defense: 65,
      specialAttack: 50,
      specialDefense: 64,
      speed: 43
    },
    moves: ['tackle', 'waterGun', 'surf', 'hydroPump'],
    color: [0.2, 0.6, 0.9, 1.0],
    secondaryColor: [0.8, 0.8, 0.7, 1.0],
    description: '龟甲宝可梦，背着坚硬的蓝色龟壳。',
    shape: 'squirtle'
  },
  {
    id: 10,
    name: '妙蛙种子',
    types: [PokemonTypes.GRASS, PokemonTypes.POISON],
    baseStats: {
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45
    },
    moves: ['tackle', 'vineWhip', 'razorLeaf', 'solarBeam'],
    color: [0.3, 0.7, 0.3, 1.0],
    secondaryColor: [0.1, 0.5, 0.1, 1.0],
    description: '种子宝可梦，背上有一个巨大的种子。',
    shape: 'bulbasaur'
  },
  {
    id: 16,
    name: '波波',
    types: [PokemonTypes.NORMAL, PokemonTypes.FLYING],
    baseStats: {
      hp: 40,
      attack: 45,
      defense: 40,
      specialAttack: 35,
      specialDefense: 35,
      speed: 56
    },
    moves: ['tackle', 'quickAttack', 'bite', 'wingAttack'],
    color: [0.8, 0.6, 0.4, 1.0],
    secondaryColor: [1.0, 0.9, 0.8, 1.0],
    description: '小鸟宝可梦，有着棕色的羽毛和蓝色的翅膀。',
    shape: 'pidgey'
  },
  {
    id: 25,
    name: '雷丘',
    types: [PokemonTypes.ELECTRIC],
    baseStats: {
      hp: 60,
      attack: 90,
      defense: 55,
      specialAttack: 90,
      specialDefense: 80,
      speed: 110
    },
    moves: ['quickAttack', 'thunderbolt', 'ironTail', 'thunder'],
    color: [1.0, 0.85, 0.0, 1.0],
    secondaryColor: [0.9, 0.7, 0.0, 1.0],
    description: '鼠标宝可梦，是皮卡丘的进化型，尾巴上有闪电形状。',
    shape: 'raichu'
  },
  {
    id: 35,
    name: '皮皮',
    types: [PokemonTypes.FAIRY],
    baseStats: {
      hp: 70,
      attack: 45,
      defense: 48,
      specialAttack: 60,
      specialDefense: 65,
      speed: 35
    },
    moves: ['tackle', 'sing', 'moonblast', 'playRough'],
    color: [1.0, 0.8, 0.9, 1.0],
    secondaryColor: [0.9, 0.7, 0.8, 1.0],
    description: '妖精宝可梦，有着可爱的粉红色外表。',
    shape: 'clefairy'
  },
  {
    id: 41,
    name: '超音蝠',
    types: [PokemonTypes.POISON, PokemonTypes.FLYING],
    baseStats: {
      hp: 40,
      attack: 45,
      defense: 35,
      specialAttack: 30,
      specialDefense: 40,
      speed: 55
    },
    moves: ['bite', 'supersonic', 'wingAttack', 'poisonFang'],
    color: [0.3, 0.1, 0.4, 1.0],
    secondaryColor: [0.5, 0.2, 0.6, 1.0],
    description: '蝙蝠宝可梦，有着紫色的外表和大翅膀。',
    shape: 'zubat'
  },
  {
    id: 54,
    name: '可达鸭',
    types: [PokemonTypes.WATER],
    baseStats: {
      hp: 50,
      attack: 52,
      defense: 48,
      specialAttack: 65,
      specialDefense: 50,
      speed: 55
    },
    moves: ['scratch', 'waterGun', 'confusion', 'psychic'],
    color: [1.0, 0.9, 0.5, 1.0],
    secondaryColor: [0.9, 0.5, 0.0, 1.0],
    description: '鸭宝可梦，总是抱着头，看起来很痛苦的样子。',
    shape: 'psyduck'
  },
  {
    id: 60,
    name: '蚊香蝌蚪',
    types: [PokemonTypes.WATER],
    baseStats: {
      hp: 40,
      attack: 50,
      defense: 40,
      specialAttack: 40,
      specialDefense: 40,
      speed: 90
    },
    moves: ['waterGun', 'bubble', 'hypnosis', 'doubleSlap'],
    color: [0.0, 0.5, 0.8, 1.0],
    secondaryColor: [0.9, 0.9, 0.8, 1.0],
    description: '蝌蚪宝可梦，有着透明的蓝色身体和白色的腹部。',
    shape: 'poliwag'
  }
];

export class PokemonClass implements Pokemon {
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

  constructor(pokemonData: PokemonDataType, level: number = 50) {
    this.id = pokemonData.id;
    this.name = pokemonData.name;
    this.types = pokemonData.types;
    this.level = level;
    this.baseStats = pokemonData.baseStats;
    this.color = pokemonData.color;
    this.secondaryColor = pokemonData.secondaryColor;
    this.description = pokemonData.description;
    this.shape = pokemonData.shape;
    this.currentHp = 0;
    this.maxHp = 0;
    this.stats = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };

    this.moves = pokemonData.moves.map(moveId => {
      const move = getMove(moveId);
      if (!move) {
        console.error(`招式 ${moveId} 未定义，使用默认招式`);
        return {
          name: '撞击',
          type: PokemonTypes.NORMAL,
          power: 40,
          accuracy: 100,
          pp: 35,
          category: 'physical',
          description: '用整个身体撞击对手。',
          id: 'tackle',
          currentPp: 35
        };
      }
      return {
        ...move,
        id: moveId,
        currentPp: move.pp
      };
    });

    this.calculateStats();
  }

  calculateStats(): void {
    this.maxHp = Math.floor((2 * this.baseStats.hp * this.level / 100) + this.level + 10);
    this.currentHp = this.maxHp;

    this.stats = {
      hp: this.maxHp,
      attack: Math.floor((2 * this.baseStats.attack * this.level / 100) + 5),
      defense: Math.floor((2 * this.baseStats.defense * this.level / 100) + 5),
      specialAttack: Math.floor((2 * this.baseStats.specialAttack * this.level / 100) + 5),
      specialDefense: Math.floor((2 * this.baseStats.specialDefense * this.level / 100) + 5),
      speed: Math.floor((2 * this.baseStats.speed * this.level / 100) + 5)
    };
  }

  takeDamage(damage: number): number {
    this.currentHp = Math.max(0, this.currentHp - damage);
    return this.currentHp;
  }

  heal(amount: number): number {
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    return this.currentHp;
  }

  isFainted(): boolean {
    return this.currentHp <= 0;
  }

  restorePp(): void {
    for (const move of this.moves) {
      move.currentPp = move.pp;
    }
  }

  getAvailableMoves(): PokemonMove[] {
    return this.moves.filter(move => move.currentPp > 0);
  }
}

export function createPokemon(pokemonId: number, level: number = 50): Pokemon {
  const pokemonData = PokemonData.find(p => p.id === pokemonId);
  if (!pokemonData) {
    throw new Error(`找不到ID为 ${pokemonId} 的宝可梦`);
  }
  return new PokemonClass(pokemonData, level);
}

export function createRandomPokemon(level: number = 50): Pokemon {
  const randomIndex = Math.floor(Math.random() * PokemonData.length);
  return createPokemon(PokemonData[randomIndex].id, level);
}

export function getAllPokemonData(): PokemonDataType[] {
  return [...PokemonData];
}