import * as THREE from 'three';

const POKEMON_DATA = [
  {
    id: 1,
    name: '皮卡丘',
    emoji: '⚡',
    types: ['electric'],
    color: 0xffd700,
    maxHp: 100,
    attack: 55,
    defense: 40,
    speed: 90,
    moves: [
      { name: '十万伏特', type: 'electric', power: 90, pp: 15 },
      { name: '电光一闪', type: 'normal', power: 40, pp: 30 },
      { name: '铁尾', type: 'steel', power: 100, pp: 10 },
      { name: '伏特攻击', type: 'electric', power: 120, pp: 10 }
    ]
  },
  {
    id: 2,
    name: '喷火龙',
    emoji: '🔥',
    types: ['fire', 'flying'],
    color: 0xff6347,
    maxHp: 78,
    attack: 84,
    defense: 78,
    speed: 100,
    moves: [
      { name: '火焰放射', type: 'fire', power: 90, pp: 15 },
      { name: '龙之怒', type: 'dragon', power: 60, pp: 10 },
      { name: '空气砍', type: 'flying', power: 75, pp: 20 },
      { name: '爆炎电击', type: 'fire', power: 120, pp: 10 }
    ]
  },
  {
    id: 3,
    name: '水箭龟',
    emoji: '💧',
    types: ['water'],
    color: 0x4169e1,
    maxHp: 79,
    attack: 83,
    defense: 100,
    speed: 78,
    moves: [
      { name: '水炮', type: 'water', power: 110, pp: 10 },
      { name: '冰冻光束', type: 'ice', power: 90, pp: 10 },
      { name: '火箭头槌', type: 'normal', power: 80, pp: 15 },
      { name: '加农水炮', type: 'water', power: 120, pp: 5 }
    ]
  },
  {
    id: 4,
    name: '妙蛙花',
    emoji: '🌿',
    types: ['grass', 'poison'],
    color: 0x32cd32,
    maxHp: 80,
    attack: 82,
    defense: 83,
    speed: 80,
    moves: [
      { name: '藤鞭', type: 'grass', power: 45, pp: 25 },
      { name: '飞叶快刀', type: 'grass', power: 55, pp: 25 },
      { name: '毒粉', type: 'poison', power: 50, pp: 20 },
      { name: '阳光烈焰', type: 'grass', power: 120, pp: 10 }
    ]
  },
  {
    id: 5,
    name: '卡比兽',
    emoji: '😴',
    types: ['normal'],
    color: 0x8b4513,
    maxHp: 160,
    attack: 110,
    defense: 65,
    speed: 30,
    moves: [
      { name: '撞击', type: 'normal', power: 50, pp: 35 },
      { name: '泰山压顶', type: 'normal', power: 85, pp: 15 },
      { name: '地震', type: 'ground', power: 100, pp: 10 },
      { name: '睡眠', type: 'psychic', power: 0, pp: 10 }
    ]
  },
  {
    id: 6,
    name: '耿鬼',
    emoji: '👻',
    types: ['ghost', 'poison'],
    color: 0x9932cc,
    maxHp: 60,
    attack: 65,
    defense: 60,
    speed: 110,
    moves: [
      { name: '影子球', type: 'ghost', power: 80, pp: 15 },
      { name: '毒击', type: 'poison', power: 65, pp: 20 },
      { name: '奇异之光', type: 'ghost', power: 30, pp: 20 },
      { name: '同命', type: 'ghost', power: 0, pp: 5 }
    ]
  },
  {
    id: 7,
    name: '路卡利欧',
    emoji: '🔵',
    types: ['fighting', 'steel'],
    color: 0x4682b4,
    maxHp: 70,
    attack: 110,
    defense: 70,
    speed: 90,
    moves: [
      { name: '波导弹', type: 'fighting', power: 80, pp: 20 },
      { name: '骨棒乱打', type: 'ground', power: 25, pp: 10 },
      { name: '近身战', type: 'fighting', power: 120, pp: 5 },
      { name: '剑舞', type: 'normal', power: 0, pp: 20 }
    ]
  },
  {
    id: 8,
    name: '沙奈朵',
    emoji: '💖',
    types: ['psychic', 'fairy'],
    color: 0xffc0cb,
    maxHp: 68,
    attack: 65,
    defense: 65,
    speed: 80,
    moves: [
      { name: '精神强念', type: 'psychic', power: 90, pp: 10 },
      { name: '月亮之力', type: 'fairy', power: 95, pp: 15 },
      { name: '治愈波动', type: 'psychic', power: 0, pp: 10 },
      { name: '冥想', type: 'psychic', power: 0, pp: 20 }
    ]
  },
  {
    id: 9,
    name: '暴鲤龙',
    emoji: '🐉',
    types: ['water', 'flying'],
    color: 0x00bfff,
    maxHp: 95,
    attack: 125,
    defense: 79,
    speed: 81,
    moves: [
      { name: '水炮', type: 'water', power: 110, pp: 10 },
      { name: '龙之舞', type: 'dragon', power: 0, pp: 20 },
      { name: '破坏光线', type: 'normal', power: 150, pp: 5 },
      { name: '咬碎', type: 'dark', power: 80, pp: 15 }
    ]
  }
];

const TYPE_CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

const ITEMS = [
  { id: 'potion', name: '药水', description: '恢复50点HP', effect: 'heal', value: 50, count: 3 },
  { id: 'super_potion', name: '高级药水', description: '恢复100点HP', effect: 'heal', value: 100, count: 2 },
  { id: 'revive', name: '元气药片', description: '复活一只倒下的宝可梦，恢复50%HP', effect: 'revive', value: 0.5, count: 1 },
  { id: 'x_attack', name: '攻击增强剂', description: '攻击提升1级', effect: 'boost', stat: 'attack', value: 1, count: 2 }
];

class Pokemon {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.emoji = data.emoji;
    this.types = [...data.types];
    this.color = data.color;
    this.maxHp = data.maxHp;
    this.currentHp = data.maxHp;
    this.attack = data.attack;
    this.defense = data.defense;
    this.speed = data.speed;
    this.moves = data.moves.map(m => ({ ...m, currentPp: m.pp }));
    this.isFainted = false;
    this.statBoosts = {
      attack: 0,
      defense: 0,
      speed: 0,
      evasion: 0,
      accuracy: 0
    };
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - amount);
    if (this.currentHp <= 0) {
      this.isFainted = true;
    }
    return amount;
  }

  heal(amount) {
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    return amount;
  }

  revive(percent) {
    this.isFainted = false;
    this.currentHp = Math.floor(this.maxHp * percent);
  }

  getEffectiveStat(stat) {
    const boost = this.statBoosts[stat] || 0;
    if (boost >= 0) {
      return this[stat] * (1 + boost * 0.5);
    } else {
      return this[stat] / (1 + Math.abs(boost) * 0.5);
    }
  }

  resetBoosts() {
    this.statBoosts = {
      attack: 0,
      defense: 0,
      speed: 0,
      evasion: 0,
      accuracy: 0
    };
  }
}

class BattleState {
  constructor() {
    this.playerTeam = [];
    this.enemyTeam = [];
    this.currentPlayerIndex = 0;
    this.currentEnemyIndex = 0;
    this.isPlayerTurn = true;
    this.battleActive = false;
    this.isProcessing = false;
    this.items = ITEMS.map(item => ({ ...item }));
  }

  get currentPlayerPokemon() {
    return this.playerTeam[this.currentPlayerIndex];
  }

  get currentEnemyPokemon() {
    return this.enemyTeam[this.currentEnemyIndex];
  }
}

class AIController {
  constructor(battleState) {
    this.battleState = battleState;
  }

  calculateTypeEffectiveness(moveType, defenderTypes) {
    let effectiveness = 1;
    defenderTypes.forEach(defType => {
      const chart = TYPE_CHART[moveType];
      if (chart && chart[defType] !== undefined) {
        effectiveness *= chart[defType];
      }
    });
    return effectiveness;
  }

  evaluateMove(move, attacker, defender) {
    if (move.power === 0) return -10;
    const effectiveness = this.calculateTypeEffectiveness(move.type, defender.types);
    const stabBonus = attacker.types.includes(move.type) ? 1.5 : 1;
    const ppRatio = move.currentPp / move.pp;
    return move.power * effectiveness * stabBonus * ppRatio;
  }

  shouldSwitch(currentPokemon, team) {
    const hpRatio = currentPokemon.currentHp / currentPokemon.maxHp;
    if (hpRatio < 0.3) {
      const availablePokemon = team.filter(p => !p.isFainted);
      if (availablePokemon.length > 1) {
        return true;
      }
    }
    return false;
  }

  getBestSwitch(team, enemyPokemon) {
    const availablePokemon = team.filter(p => !p.isFainted);
    let bestPokemon = availablePokemon[0];
    let bestScore = -Infinity;
    availablePokemon.forEach(pokemon => {
      if (pokemon === this.battleState.currentEnemyPokemon) return;
      let score = pokemon.currentHp / pokemon.maxHp;
      pokemon.moves.forEach(move => {
        if (move.power > 0) {
          score += this.evaluateMove(move, pokemon, enemyPokemon) * 0.1;
        }
      });
      if (score > bestScore) {
        bestScore = score;
        bestPokemon = pokemon;
      }
    });
    return team.indexOf(bestPokemon);
  }

  chooseAction() {
    const currentPokemon = this.battleState.currentEnemyPokemon;
    const playerPokemon = this.battleState.currentPlayerPokemon;
    if (this.shouldSwitch(currentPokemon, this.battleState.enemyTeam)) {
      const switchIndex = this.getBestSwitch(this.battleState.enemyTeam, playerPokemon);
      if (switchIndex !== this.battleState.currentEnemyIndex) {
        return { type: 'switch', index: switchIndex };
      }
    }
    let bestMove = currentPokemon.moves[0];
    let bestScore = -Infinity;
    currentPokemon.moves.forEach(move => {
      if (move.currentPp > 0) {
        const score = this.evaluateMove(move, currentPokemon, playerPokemon);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    });
    return { type: 'attack', move: bestMove };
  }
}

class BattleEngine {
  calculateDamage(attacker, defender, move) {
    if (move.power === 0) return 0;
    const effectiveness = this.getTypeEffectiveness(move.type, defender.types);
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const atkStat = attacker.getEffectiveStat('attack');
    const defStat = defender.getEffectiveStat('defense');
    const random = 0.85 + Math.random() * 0.15;
    const damage = Math.floor((((42 * move.power * (atkStat / defStat)) / 50) + 2) * stab * effectiveness * random);
    return Math.max(1, damage);
  }

  getTypeEffectiveness(moveType, defenderTypes) {
    let effectiveness = 1;
    defenderTypes.forEach(defType => {
      const chart = TYPE_CHART[moveType];
      if (chart && chart[defType] !== undefined) {
        effectiveness *= chart[defType];
      }
    });
    return effectiveness;
  }

  getEffectivenessText(effectiveness) {
    if (effectiveness >= 2) return '效果拔群！';
    if (effectiveness <= 0.5) return '效果不佳...';
    if (effectiveness === 0) return '没有效果...';
    return '';
  }
}

class PokemonModelBuilder {
  static getBasicMaterials() {
    return {
      white: new THREE.MeshStandardMaterial({ color: 0xffffff }),
      black: new THREE.MeshStandardMaterial({ color: 0x000000 }),
      red: new THREE.MeshStandardMaterial({ color: 0xff3333 }),
      pink: new THREE.MeshStandardMaterial({ color: 0xff8080 }),
      yellow: new THREE.MeshStandardMaterial({ color: 0xffd700 }),
      orange: new THREE.MeshStandardMaterial({ color: 0xff6600 }),
      blue: new THREE.MeshStandardMaterial({ color: 0x4169e1 }),
      green: new THREE.MeshStandardMaterial({ color: 0x32cd32 }),
      brown: new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
      cream: new THREE.MeshStandardMaterial({ color: 0xfff0d5 }),
      darkPurple: new THREE.MeshStandardMaterial({ color: 0x660066 }),
      lightBlue: new THREE.MeshStandardMaterial({ color: 0x87ceeb }),
      darkGreen: new THREE.MeshStandardMaterial({ color: 0x006400 }),
      gray: new THREE.MeshStandardMaterial({ color: 0x708090 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.5 }),
      steel: new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.6, roughness: 0.4 })
    };
  }

  static createEyes(group, headY, zOffset = 0.4, size = 0.2, spacing = 0.6) {
    const eyeGeom = new THREE.SphereGeometry(size, 16, 16);
    const pupilGeom = new THREE.SphereGeometry(size * 0.5, 8, 8);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const eye1 = new THREE.Mesh(eyeGeom, whiteMat);
    eye1.position.set(-spacing / 2, headY, zOffset);
    eye1.castShadow = true;
    group.add(eye1);

    const eye2 = new THREE.Mesh(eyeGeom, whiteMat);
    eye2.position.set(spacing / 2, headY, zOffset);
    eye2.castShadow = true;
    group.add(eye2);

    const pupil1 = new THREE.Mesh(pupilGeom, blackMat);
    pupil1.position.set(-spacing / 2, headY - size * 0.2, zOffset + size * 0.6);
    pupil1.castShadow = true;
    group.add(pupil1);

    const pupil2 = new THREE.Mesh(pupilGeom, blackMat);
    pupil2.position.set(spacing / 2, headY - size * 0.2, zOffset + size * 0.6);
    pupil2.castShadow = true;
    group.add(pupil2);
  }

  static createPikachu(group, materials) {
    const yellow = new THREE.MeshStandardMaterial({ color: 0xffd700 });
    const black = materials.black;
    const red = materials.red;

    const bodyGeom = new THREE.SphereGeometry(1.2, 32, 32);
    const body = new THREE.Mesh(bodyGeom, yellow);
    body.position.y = 1.8;
    body.scale.set(1.3, 0.9, 1);
    body.castShadow = true;
    group.add(body);

    const headGeom = new THREE.SphereGeometry(1.1, 32, 32);
    const head = new THREE.Mesh(headGeom, yellow);
    head.position.y = 3.2;
    head.castShadow = true;
    group.add(head);

    const earGeom = new THREE.ConeGeometry(0.4, 1.5, 8);
    const ear1 = new THREE.Mesh(earGeom, yellow);
    ear1.position.set(-0.5, 4.3, 0);
    ear1.rotation.z = 0.3;
    ear1.castShadow = true;
    group.add(ear1);

    const ear1Tip = new THREE.Mesh(earGeom, black);
    ear1Tip.position.set(-0.5, 4.8, 0);
    ear1Tip.rotation.z = 0.3;
    ear1Tip.scale.set(0.6, 0.5, 0.6);
    ear1Tip.castShadow = true;
    group.add(ear1Tip);

    const ear2 = new THREE.Mesh(earGeom, yellow);
    ear2.position.set(0.5, 4.3, 0);
    ear2.rotation.z = -0.3;
    ear2.castShadow = true;
    group.add(ear2);

    const ear2Tip = new THREE.Mesh(earGeom, black);
    ear2Tip.position.set(0.5, 4.8, 0);
    ear2Tip.rotation.z = -0.3;
    ear2Tip.scale.set(0.6, 0.5, 0.6);
    ear2Tip.castShadow = true;
    group.add(ear2Tip);

    this.createEyes(group, 3.3, 0.7, 0.18, 0.5);

    const cheekGeom = new THREE.SphereGeometry(0.25, 16, 16);
    const cheek1 = new THREE.Mesh(cheekGeom, red);
    cheek1.position.set(-0.7, 3.1, 0.6);
    cheek1.castShadow = true;
    group.add(cheek1);

    const cheek2 = new THREE.Mesh(cheekGeom, red);
    cheek2.position.set(0.7, 3.1, 0.6);
    cheek2.castShadow = true;
    group.add(cheek2);

    const armGeom = new THREE.CylinderGeometry(0.2, 0.15, 0.8, 8);
    const arm1 = new THREE.Mesh(armGeom, yellow);
    arm1.position.set(-1.1, 1.8, 0.5);
    arm1.rotation.z = 0.5;
    arm1.castShadow = true;
    group.add(arm1);

    const arm2 = new THREE.Mesh(armGeom, yellow);
    arm2.position.set(1.1, 1.8, 0.5);
    arm2.rotation.z = -0.5;
    arm2.castShadow = true;
    group.add(arm2);

    const legGeom = new THREE.CylinderGeometry(0.25, 0.2, 0.7, 8);
    const leg1 = new THREE.Mesh(legGeom, yellow);
    leg1.position.set(-0.5, 0.35, 0);
    leg1.castShadow = true;
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeom, yellow);
    leg2.position.set(0.5, 0.35, 0);
    leg2.castShadow = true;
    group.add(leg2);

    const tailPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.5, 0.3, -0.3),
      new THREE.Vector3(-1, 0.5, -0.1),
      new THREE.Vector3(-1.3, 1, 0.2),
      new THREE.Vector3(-0.8, 1.2, 0.4),
      new THREE.Vector3(-0.3, 0.8, 0.1)
    ];
    const tailGeom = new THREE.CatmullRomCurve3(tailPoints);
    const tailTube = new THREE.TubeGeometry(tailGeom, 16, 0.15, 8, false);
    const tail = new THREE.Mesh(tailTube, yellow);
    tail.position.set(0.8, 1.5, 0);
    tail.rotation.y = 0.3;
    tail.castShadow = true;
    group.add(tail);
  }

  static createCharizard(group, materials) {
    const orange = new THREE.MeshStandardMaterial({ color: 0xff6347 });
    const cream = materials.cream;
    const green = materials.green;
    const red = materials.red;

    const bodyGeom = new THREE.SphereGeometry(1.4, 32, 32);
    const body = new THREE.Mesh(bodyGeom, orange);
    body.position.y = 2.2;
    body.scale.set(1.1, 0.9, 1.3);
    body.castShadow = true;
    group.add(body);

    const bellyGeom = new THREE.SphereGeometry(0.8, 32, 32);
    const belly = new THREE.Mesh(bellyGeom, cream);
    belly.position.y = 1.9;
    belly.position.z = 0.4;
    belly.scale.set(0.9, 0.7, 0.8);
    belly.castShadow = true;
    group.add(belly);

    const headGeom = new THREE.SphereGeometry(1.1, 32, 32);
    const head = new THREE.Mesh(headGeom, orange);
    head.position.y = 3.8;
    head.position.z = 0.3;
    head.castShadow = true;
    group.add(head);

    const hornGeom = new THREE.ConeGeometry(0.2, 0.8, 8);
    const horn1 = new THREE.Mesh(hornGeom, orange);
    horn1.position.set(-0.5, 4.7, 0.2);
    horn1.rotation.z = 0.3;
    horn1.castShadow = true;
    group.add(horn1);

    const horn2 = new THREE.Mesh(hornGeom, orange);
    horn2.position.set(0.5, 4.7, 0.2);
    horn2.rotation.z = -0.3;
    horn2.castShadow = true;
    group.add(horn2);

    this.createEyes(group, 4, 0.9, 0.15, 0.4);

    const neckGeom = new THREE.CylinderGeometry(0.5, 0.6, 0.8, 16);
    const neck = new THREE.Mesh(neckGeom, orange);
    neck.position.y = 3;
    neck.position.z = 0.1;
    neck.castShadow = true;
    group.add(neck);

    const wingGeom = new THREE.BoxGeometry(0.1, 1.5, 2.5);
    const wing1 = new THREE.Mesh(wingGeom, green);
    wing1.position.set(-1.5, 2.2, 0.3);
    wing1.rotation.x = 0.3;
    wing1.rotation.z = 0.2;
    wing1.castShadow = true;
    group.add(wing1);

    const wing2 = new THREE.Mesh(wingGeom, green);
    wing2.position.set(1.5, 2.2, 0.3);
    wing2.rotation.x = 0.3;
    wing2.rotation.z = -0.2;
    wing2.castShadow = true;
    group.add(wing2);

    const legGeom = new THREE.CylinderGeometry(0.3, 0.35, 1.2, 8);
    const leg1 = new THREE.Mesh(legGeom, orange);
    leg1.position.set(-0.6, 0.6, 0);
    leg1.castShadow = true;
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeom, orange);
    leg2.position.set(0.6, 0.6, 0);
    leg2.castShadow = true;
    group.add(leg2);

    const tailBaseGeom = new THREE.CylinderGeometry(0.4, 0.5, 1.5, 8);
    const tailBase = new THREE.Mesh(tailBaseGeom, orange);
    tailBase.position.set(0.3, 1.8, -1.2);
    tailBase.rotation.x = 0.5;
    tailBase.castShadow = true;
    group.add(tailBase);

    const flameGeom = new THREE.ConeGeometry(0.3, 0.8, 8);
    const flame = new THREE.Mesh(flameGeom, red);
    flame.position.set(0, 2.8, -1.5);
    flame.rotation.x = -Math.PI / 2;
    flame.castShadow = true;
    group.add(flame);
  }

  static createBlastoise(group, materials) {
    const blue = new THREE.MeshStandardMaterial({ color: 0x4169e1 });
    const darkBlue = new THREE.MeshStandardMaterial({ color: 0x1e3a5f });
    const cream = materials.cream;
    const brown = materials.brown;
    const steel = materials.steel;

    const bodyGeom = new THREE.SphereGeometry(1.6, 32, 32);
    const body = new THREE.Mesh(bodyGeom, darkBlue);
    body.position.y = 2;
    body.scale.set(1, 0.8, 1.2);
    body.castShadow = true;
    group.add(body);

    const shellGeom = new THREE.SphereGeometry(1.7, 32, 32);
    const shell = new THREE.Mesh(shellGeom, brown);
    shell.position.y = 2.2;
    shell.scale.set(1.1, 0.7, 1.3);
    shell.castShadow = true;
    group.add(shell);

    const shellPattern1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), darkBlue);
    shellPattern1.position.set(0, 2.5, 0.8);
    shellPattern1.scale.set(2, 0.5, 0.8);
    shellPattern1.castShadow = true;
    group.add(shellPattern1);

    const cannonGeom = new THREE.CylinderGeometry(0.25, 0.35, 1.2, 12);
    const cannon1 = new THREE.Mesh(cannonGeom, steel);
    cannon1.position.set(-0.6, 2.8, 1.2);
    cannon1.rotation.x = -0.4;
    cannon1.castShadow = true;
    group.add(cannon1);

    const cannon2 = new THREE.Mesh(cannonGeom, steel);
    cannon2.position.set(0.6, 2.8, 1.2);
    cannon2.rotation.x = -0.4;
    cannon2.castShadow = true;
    group.add(cannon2);

    const headGeom = new THREE.SphereGeometry(0.9, 32, 32);
    const head = new THREE.Mesh(headGeom, blue);
    head.position.y = 2.8;
    head.position.z = 0.8;
    head.castShadow = true;
    group.add(head);

    this.createEyes(group, 3, 1.5, 0.12, 0.4);

    const legGeom = new THREE.CylinderGeometry(0.35, 0.4, 1, 8);
    const leg1 = new THREE.Mesh(legGeom, blue);
    leg1.position.set(-0.7, 0.5, 0.3);
    leg1.castShadow = true;
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeom, blue);
    leg2.position.set(0.7, 0.5, 0.3);
    leg2.castShadow = true;
    group.add(leg2);

    const armGeom = new THREE.CylinderGeometry(0.25, 0.3, 0.6, 8);
    const arm1 = new THREE.Mesh(armGeom, blue);
    arm1.position.set(-1.1, 1.6, 0.6);
    arm1.rotation.z = 0.4;
    arm1.castShadow = true;
    group.add(arm1);

    const arm2 = new THREE.Mesh(armGeom, blue);
    arm2.position.set(1.1, 1.6, 0.6);
    arm2.rotation.z = -0.4;
    arm2.castShadow = true;
    group.add(arm2);
  }

  static createVenusaur(group, materials) {
    const darkGreen = materials.darkGreen;
    const blueGreen = new THREE.MeshStandardMaterial({ color: 0x20b2aa });
    const yellow = materials.yellow;

    const bodyGeom = new THREE.SphereGeometry(1.5, 32, 32);
    const body = new THREE.Mesh(bodyGeom, blueGreen);
    body.position.y = 1.8;
    body.scale.set(1.2, 0.8, 1.3);
    body.castShadow = true;
    group.add(body);

    const plantBulbGeom = new THREE.SphereGeometry(1.2, 32, 32);
    const plantBulb = new THREE.Mesh(plantBulbGeom, darkGreen);
    plantBulb.position.y = 2.5;
    plantBulb.position.z = -0.3;
    plantBulb.scale.set(1.1, 0.9, 1.1);
    plantBulb.castShadow = true;
    group.add(plantBulb);

    const petalGeom = new THREE.ConeGeometry(0.8, 1.5, 8);
    const petalColors = [0xff69b4, 0xff1493, 0xff6347, 0xff4500];
    for (let i = 0; i < 8; i++) {
      const petal = new THREE.Mesh(
        petalGeom,
        new THREE.MeshStandardMaterial({ color: petalColors[i % petalColors.length] })
      );
      const angle = (i / 8) * Math.PI * 2;
      petal.position.y = 3.5;
      petal.position.z = Math.cos(angle) * 0.4 - 0.3;
      petal.position.x = Math.sin(angle) * 0.4;
      petal.rotation.x = Math.cos(angle) * 0.5;
      petal.rotation.z = Math.sin(angle) * 0.5;
      petal.castShadow = true;
      group.add(petal);
    }

    const centerGeom = new THREE.SphereGeometry(0.4, 16, 16);
    const center = new THREE.Mesh(centerGeom, yellow);
    center.position.y = 3.3;
    center.position.z = -0.3;
    center.castShadow = true;
    group.add(center);

    const headGeom = new THREE.SphereGeometry(0.85, 32, 32);
    const head = new THREE.Mesh(headGeom, blueGreen);
    head.position.y = 2.6;
    head.position.z = 0.9;
    head.castShadow = true;
    group.add(head);

    const earGeom = new THREE.ConeGeometry(0.2, 0.6, 8);
    const ear1 = new THREE.Mesh(earGeom, darkGreen);
    ear1.position.set(-0.5, 3.3, 0.7);
    ear1.rotation.z = 0.3;
    ear1.castShadow = true;
    group.add(ear1);

    const ear2 = new THREE.Mesh(earGeom, darkGreen);
    ear2.position.set(0.5, 3.3, 0.7);
    ear2.rotation.z = -0.3;
    ear2.castShadow = true;
    group.add(ear2);

    this.createEyes(group, 2.7, 1.5, 0.1, 0.35);

    const legGeom = new THREE.CylinderGeometry(0.3, 0.35, 0.9, 8);
    const leg1 = new THREE.Mesh(legGeom, blueGreen);
    leg1.position.set(-0.7, 0.45, 0.4);
    leg1.castShadow = true;
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeom, blueGreen);
    leg2.position.set(0.7, 0.45, 0.4);
    leg2.castShadow = true;
    group.add(leg2);

    const leg3 = new THREE.Mesh(legGeom, blueGreen);
    leg3.position.set(-0.7, 0.45, -0.6);
    leg3.castShadow = true;
    group.add(leg3);

    const leg4 = new THREE.Mesh(legGeom, blueGreen);
    leg4.position.set(0.7, 0.45, -0.6);
    leg4.castShadow = true;
    group.add(leg4);
  }

  static createSnorlax(group, materials) {
    const brown = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const cream = materials.cream;
    const black = materials.black;
    const lightBlue = materials.lightBlue;

    const bodyGeom = new THREE.SphereGeometry(2, 32, 32);
    const body = new THREE.Mesh(bodyGeom, brown);
    body.position.y = 2;
    body.scale.set(1.3, 1, 1.2);
    body.castShadow = true;
    group.add(body);

    const bellyGeom = new THREE.SphereGeometry(1.4, 32, 32);
    const belly = new THREE.Mesh(bellyGeom, cream);
    belly.position.y = 1.8;
    belly.position.z = 0.3;
    belly.scale.set(0.9, 0.8, 0.8);
    belly.castShadow = true;
    group.add(belly);

    const headGeom = new THREE.SphereGeometry(1.3, 32, 32);
    const head = new THREE.Mesh(headGeom, brown);
    head.position.y = 3.8;
    head.castShadow = true;
    group.add(head);

    const faceGeom = new THREE.SphereGeometry(0.9, 32, 32);
    const face = new THREE.Mesh(faceGeom, cream);
    face.position.y = 3.6;
    face.position.z = 0.7;
    face.scale.set(1, 0.8, 0.7);
    face.castShadow = true;
    group.add(face);

    const eyeGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const eye1 = new THREE.Mesh(eyeGeom, black);
    eye1.position.set(-0.4, 3.7, 1.35);
    group.add(eye1);

    const eye2 = new THREE.Mesh(eyeGeom, black);
    eye2.position.set(0.4, 3.7, 1.35);
    group.add(eye2);

    const mouthGeom = new THREE.SphereGeometry(0.15, 16, 16);
    const mouth = new THREE.Mesh(mouthGeom, black);
    mouth.position.y = 3.3;
    mouth.position.z = 1.3;
    group.add(mouth);

    const armGeom = new THREE.CylinderGeometry(0.4, 0.35, 1, 8);
    const arm1 = new THREE.Mesh(armGeom, brown);
    arm1.position.set(-1.4, 1.8, 0.5);
    arm1.rotation.z = 0.3;
    arm1.castShadow = true;
    group.add(arm1);

    const arm2 = new THREE.Mesh(armGeom, brown);
    arm2.position.set(1.4, 1.8, 0.5);
    arm2.rotation.z = -0.3;
    arm2.castShadow = true;
    group.add(arm2);

    const legGeom = new THREE.CylinderGeometry(0.5, 0.55, 0.8, 8);
    const leg1 = new THREE.Mesh(legGeom, brown);
    leg1.position.set(-0.8, 0.4, 0);
    leg1.castShadow = true;
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeom, brown);
    leg2.position.set(0.8, 0.4, 0);
    leg2.castShadow = true;
    group.add(leg2);

    const zGeom = new THREE.SphereGeometry(0.15, 16, 16);
    const zMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb });
    const z1 = new THREE.Mesh(zGeom, zMat);
    z1.position.set(-1.2, 4.5, 0.5);
    group.add(z1);

    const z2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), zMat);
    z2.position.set(-1.5, 4.8, 0.2);
    group.add(z2);
  }

  static createGengar(group, materials) {
    const purple = new THREE.MeshStandardMaterial({ color: 0x9932cc });
    const darkPurple = materials.darkPurple;
    const red = materials.red;
    const pink = materials.pink;
    const white = materials.white;

    const bodyGeom = new THREE.SphereGeometry(1.8, 32, 32);
    const body = new THREE.Mesh(bodyGeom, purple);
    body.position.y = 2.2;
    body.scale.set(1.1, 0.9, 1.2);
    body.castShadow = true;
    group.add(body);

    const headGeom = new THREE.SphereGeometry(1.5, 32, 32);
    const head = new THREE.Mesh(headGeom, purple);
    head.position.y = 4;
    head.castShadow = true;
    group.add(head);

    const spikeGeom = new THREE.ConeGeometry(0.25, 0.6, 8);
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(spikeGeom, darkPurple);
      const angle = (i / 5) * Math.PI * 2;
      spike.position.y = 4.8;
      spike.position.x = Math.cos(angle) * 0.8;
      spike.position.z = Math.sin(angle) * 0.8;
      spike.rotation.x = Math.cos(angle) * 0.5;
      spike.rotation.z = Math.sin(angle) * 0.5;
      spike.castShadow = true;
      group.add(spike);
    }

    const eyeGeom = new THREE.SphereGeometry(0.25, 16, 16);
    const eye1 = new THREE.Mesh(eyeGeom, red);
    eye1.position.set(-0.45, 4.2, 0.8);
    eye1.castShadow = true;
    group.add(eye1);

    const eye2 = new THREE.Mesh(eyeGeom, red);
    eye2.position.set(0.45, 4.2, 0.8);
    eye2.castShadow = true;
    group.add(eye2);

    const pupilGeom = new THREE.SphereGeometry(0.1, 8, 8);
    const pupil1 = new THREE.Mesh(pupilGeom, white);
    pupil1.position.set(-0.45, 4.25, 0.95);
    group.add(pupil1);

    const pupil2 = new THREE.Mesh(pupilGeom, white);
    pupil2.position.set(0.45, 4.25, 0.95);
    group.add(pupil2);

    const mouthGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const mouth = new THREE.Mesh(mouthGeom, pink);
    mouth.position.y = 3.5;
    mouth.position.z = 1;
    mouth.scale.set(1.5, 0.6, 0.8);
    mouth.castShadow = true;
    group.add(mouth);

    const toothGeom = new THREE.ConeGeometry(0.08, 0.2, 4);
    for (let i = 0; i < 3; i++) {
      const tooth = new THREE.Mesh(toothGeom, white);
      tooth.position.y = 3.55;
      tooth.position.z = 1.1;
      tooth.position.x = -0.3 + i * 0.3;
      tooth.rotation.x = Math.PI;
      group.add(tooth);
    }

    const armGeom = new THREE.CylinderGeometry(0.25, 0.35, 1.2, 8);
    const arm1 = new THREE.Mesh(armGeom, purple);
    arm1.position.set(-1.3, 1.8, 0.3);
    arm1.rotation.z = 0.4;
    arm1.castShadow = true;
    group.add(arm1);

    const arm2 = new THREE.Mesh(armGeom, purple);
    arm2.position.set(1.3, 1.8, 0.3);
    arm2.rotation.z = -0.4;
    arm2.castShadow = true;
    group.add(arm2);

    const tailGeom = new THREE.ConeGeometry(0.4, 0.8, 8);
    const tail = new THREE.Mesh(tailGeom, purple);
    tail.position.set(0, 1.2, -1.5);
    tail.rotation.x = 0.8;
    tail.castShadow = true;
    group.add(tail);
  }

  static createLucario(group, materials) {
    const blue = new THREE.MeshStandardMaterial({ color: 0x4682b4 });
    const darkBlue = new THREE.MeshStandardMaterial({ color: 0x2c5282 });
    const cream = materials.cream;

    const bodyGeom = new THREE.SphereGeometry(1.1, 32, 32);
    const body = new THREE.Mesh(bodyGeom, blue);
    body.position.y = 2.2;
    body.scale.set(0.9, 0.9, 1.1);
    body.castShadow = true;
    group.add(body);

    const chestGeom = new THREE.SphereGeometry(0.6, 32, 32);
    const chest = new THREE.Mesh(chestGeom, cream);
    chest.position.y = 2.1;
    chest.position.z = 0.5;
    chest.scale.set(0.8, 0.7, 0.6);
    chest.castShadow = true;
    group.add(chest);

    const headGeom = new THREE.SphereGeometry(0.95, 32, 32);
    const head = new THREE.Mesh(headGeom, blue);
    head.position.y = 3.8;
    head.castShadow = true;
    group.add(head);

    const earGeom = new THREE.ConeGeometry(0.25, 1.2, 8);
    const ear1 = new THREE.Mesh(earGeom, darkBlue);
    ear1.position.set(-0.4, 4.6, 0);
    ear1.rotation.z = 0.2;
    ear1.castShadow = true;
    group.add(ear1);

    const ear2 = new THREE.Mesh(earGeom, darkBlue);
    ear2.position.set(0.4, 4.6, 0);
    ear2.rotation.z = -0.2;
    ear2.castShadow = true;
    group.add(ear2);

    this.createEyes(group, 3.9, 0.7, 0.12, 0.45);

    const auraGeom = new THREE.SphereGeometry(0.15, 16, 16);
    const auraMat = new THREE.MeshStandardMaterial({ color: 0x4169e1, emissive: 0x4169e1, emissiveIntensity: 0.5 });
    const aura1 = new THREE.Mesh(auraGeom, auraMat);
    aura1.position.set(-0.8, 3.6, 0.4);
    group.add(aura1);

    const aura2 = new THREE.Mesh(auraGeom, auraMat);
    aura2.position.set(0.8, 3.6, 0.4);
    group.add(aura2);

    const armGeom = new THREE.CylinderGeometry(0.25, 0.2, 1.1, 8);
    const arm1 = new THREE.Mesh(armGeom, blue);
    arm1.position.set(-1, 2, 0.4);
    arm1.rotation.z = 0.3;
    arm1.castShadow = true;
    group.add(arm1);

    const arm2 = new THREE.Mesh(armGeom, blue);
    arm2.position.set(1, 2, 0.4);
    arm2.rotation.z = -0.3;
    arm2.castShadow = true;
    group.add(arm2);

    const boneGeom = new THREE.BoxGeometry(0.15, 0.15, 0.6);
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });
    const bone1 = new THREE.Mesh(boneGeom, boneMat);
    bone1.position.set(-1.3, 1.6, 0.6);
    bone1.rotation.z = 0.5;
    group.add(bone1);

    const bone2 = new THREE.Mesh(boneGeom, boneMat);
    bone2.position.set(1.3, 1.6, 0.6);
    bone2.rotation.z = -0.5;
    group.add(bone2);

    const legGeom = new THREE.CylinderGeometry(0.28, 0.32, 1.3, 8);
    const leg1 = new THREE.Mesh(legGeom, blue);
    leg1.position.set(-0.5, 0.65, 0);
    leg1.castShadow = true;
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeom, blue);
    leg2.position.set(0.5, 0.65, 0);
    leg2.castShadow = true;
    group.add(leg2);

    const neckGeom = new THREE.CylinderGeometry(0.2, 0.25, 0.5, 8);
    const neck = new THREE.Mesh(neckGeom, blue);
    neck.position.y = 3.1;
    neck.castShadow = true;
    group.add(neck);

    const tailGeom = new THREE.CylinderGeometry(0.2, 0.3, 1, 8);
    const tail = new THREE.Mesh(tailGeom, darkBlue);
    tail.position.set(0, 1.8, -1.2);
    tail.rotation.x = 0.6;
    tail.castShadow = true;
    group.add(tail);
  }

  static createGardevoir(group, materials) {
    const lightPink = new THREE.MeshStandardMaterial({ color: 0xffe4e1 });
    const green = materials.green;
    const red = materials.red;
    const white = materials.white;

    const bodyGeom = new THREE.SphereGeometry(1, 32, 32);
    const body = new THREE.Mesh(bodyGeom, white);
    body.position.y = 2.2;
    body.scale.set(0.8, 1, 0.9);
    body.castShadow = true;
    group.add(body);

    const dressGeom = new THREE.ConeGeometry(1.5, 2.5, 16);
    const dress = new THREE.Mesh(dressGeom, lightPink);
    dress.position.y = 1.8;
    dress.position.z = 0.2;
    dress.rotation.x = Math.PI;
    dress.castShadow = true;
    group.add(dress);

    const headGeom = new THREE.SphereGeometry(0.85, 32, 32);
    const head = new THREE.Mesh(headGeom, white);
    head.position.y = 3.8;
    head.castShadow = true;
    group.add(head);

    const hornGeom = new THREE.ConeGeometry(0.2, 0.8, 8);
    const horn1 = new THREE.Mesh(hornGeom, green);
    horn1.position.set(-0.5, 4.5, 0.3);
    horn1.rotation.z = 0.4;
    horn1.castShadow = true;
    group.add(horn1);

    const horn2 = new THREE.Mesh(hornGeom, green);
    horn2.position.set(0.5, 4.5, 0.3);
    horn2.rotation.z = -0.4;
    horn2.castShadow = true;
    group.add(horn2);

    this.createEyes(group, 3.9, 0.7, 0.12, 0.4);

    const neckGeom = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8);
    const neck = new THREE.Mesh(neckGeom, white);
    neck.position.y = 3.3;
    neck.castShadow = true;
    group.add(neck);

    const armGeom = new THREE.CylinderGeometry(0.18, 0.15, 1.2, 8);
    const arm1 = new THREE.Mesh(armGeom, green);
    arm1.position.set(-0.9, 2.2, 0.3);
    arm1.rotation.z = 0.4;
    arm1.castShadow = true;
    group.add(arm1);

    const arm2 = new THREE.Mesh(armGeom, green);
    arm2.position.set(0.9, 2.2, 0.3);
    arm2.rotation.z = -0.4;
    arm2.castShadow = true;
    group.add(arm2);

    const handGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const hand1 = new THREE.Mesh(handGeom, white);
    hand1.position.set(-1.3, 1.7, 0.4);
    hand1.castShadow = true;
    group.add(hand1);

    const hand2 = new THREE.Mesh(handGeom, white);
    hand2.position.set(1.3, 1.7, 0.4);
    hand2.castShadow = true;
    group.add(hand2);

    const chestGemGeom = new THREE.SphereGeometry(0.15, 16, 16);
    const chestGem = new THREE.Mesh(chestGemGeom, red);
    chestGem.position.y = 2.5;
    chestGem.position.z = 0.7;
    group.add(chestGem);
  }

  static createGyarados(group, materials) {
    const blue = new THREE.MeshStandardMaterial({ color: 0x00bfff });
    const darkBlue = new THREE.MeshStandardMaterial({ color: 0x0066cc });
    const yellow = materials.yellow;
    const red = materials.red;
    const white = materials.white;

    const segments = 6;
    const segmentGeom = new THREE.SphereGeometry(0.7, 16, 16);
    for (let i = 0; i < segments; i++) {
      const seg = new THREE.Mesh(segmentGeom, i % 2 === 0 ? blue : darkBlue);
      seg.position.y = 1.5 + i * 0.4;
      seg.position.z = i * 0.15;
      seg.scale.set(0.9, 0.8, 1.1);
      seg.castShadow = true;
      group.add(seg);
    }

    const headGeom = new THREE.SphereGeometry(0.9, 32, 32);
    const head = new THREE.Mesh(headGeom, blue);
    head.position.y = 4;
    head.position.z = 0.8;
    head.scale.set(1, 0.9, 1.3);
    head.castShadow = true;
    group.add(head);

    const jawGeom = new THREE.BoxGeometry(1.2, 0.3, 1.5);
    const jaw = new THREE.Mesh(jawGeom, white);
    jaw.position.y = 3.7;
    jaw.position.z = 1.4;
    jaw.castShadow = true;
    group.add(jaw);

    const eyeGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const eye1 = new THREE.Mesh(eyeGeom, red);
    eye1.position.set(-0.4, 4.1, 1.3);
    eye1.castShadow = true;
    group.add(eye1);

    const eye2 = new THREE.Mesh(eyeGeom, red);
    eye2.position.set(0.4, 4.1, 1.3);
    eye2.castShadow = true;
    group.add(eye2);

    const hornGeom = new THREE.ConeGeometry(0.25, 1, 8);
    const horn1 = new THREE.Mesh(hornGeom, yellow);
    horn1.position.set(-0.5, 4.7, 0.5);
    horn1.rotation.z = 0.3;
    horn1.castShadow = true;
    group.add(horn1);

    const horn2 = new THREE.Mesh(hornGeom, yellow);
    horn2.position.set(0.5, 4.7, 0.5);
    horn2.rotation.z = -0.3;
    horn2.castShadow = true;
    group.add(horn2);

    const whiskerGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 4);
    const whisker1 = new THREE.Mesh(whiskerGeom, white);
    whisker1.position.set(-0.5, 3.9, 1.4);
    whisker1.rotation.x = 0.5;
    whisker1.castShadow = true;
    group.add(whisker1);

    const whisker2 = new THREE.Mesh(whiskerGeom, white);
    whisker2.position.set(0.5, 3.9, 1.4);
    whisker2.rotation.x = 0.5;
    whisker2.castShadow = true;
    group.add(whisker2);

    const finGeom = new THREE.BoxGeometry(0.1, 0.6, 1);
    const fin1 = new THREE.Mesh(finGeom, darkBlue);
    fin1.position.set(0, 2, -0.8);
    fin1.rotation.x = 0.3;
    fin1.castShadow = true;
    group.add(fin1);

    const tailGeom = new THREE.BoxGeometry(0.1, 1, 1.5);
    const tail = new THREE.Mesh(tailGeom, darkBlue);
    tail.position.set(0, 0.8, -1.5);
    tail.rotation.x = 0.5;
    tail.castShadow = true;
    group.add(tail);
  }

  static buildPokemonModel(pokemon) {
    const group = new THREE.Group();
    const materials = this.getBasicMaterials();

    switch (pokemon.name) {
      case '皮卡丘':
        this.createPikachu(group, materials);
        break;
      case '喷火龙':
        this.createCharizard(group, materials);
        break;
      case '水箭龟':
        this.createBlastoise(group, materials);
        break;
      case '妙蛙花':
        this.createVenusaur(group, materials);
        break;
      case '卡比兽':
        this.createSnorlax(group, materials);
        break;
      case '耿鬼':
        this.createGengar(group, materials);
        break;
      case '路卡利欧':
        this.createLucario(group, materials);
        break;
      case '沙奈朵':
        this.createGardevoir(group, materials);
        break;
      case '暴鲤龙':
        this.createGyarados(group, materials);
        break;
      default:
        this.createPikachu(group, materials);
    }

    return group;
  }
}

class PreviewScene3D {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.pokemonModel = null;
    this.animationId = null;
    this.init();
  }

  init() {
    const canvas = document.getElementById('preview-canvas');
    if (!canvas) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 2, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(200, 200);
    this.renderer.setPixelRatio(2);
    this.renderer.shadowMap.enabled = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);

    this.startAnimation();
  }

  setPokemon(pokemon) {
    if (this.pokemonModel) {
      this.scene.remove(this.pokemonModel);
      this.pokemonModel.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }

    const group = PokemonModelBuilder.buildPokemonModel(pokemon);
    group.scale.set(0.75, 0.75, 0.75);
    group.position.y = 0.5;

    this.pokemonModel = group;
    this.scene.add(group);
    this.renderer.render(this.scene, this.camera);
  }

  startAnimation() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      if (this.pokemonModel) {
        this.pokemonModel.rotation.y += 0.01;
        const time = Date.now() * 0.001;
        this.pokemonModel.position.y = 0.5 + Math.sin(time * 2) * 0.1;
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

class Scene3D {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.playerPokemonModel = null;
    this.enemyPokemonModel = null;
    this.animations = [];
    this.init();
  }

  init() {
    const canvas = document.getElementById('game-canvas');
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-25, 10, 0);
    this.camera.lookAt(0, 3, 0);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.setupLights();
    this.createEnvironment();
    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(0, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    this.scene.add(directionalLight);
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(-10, 10, -10);
    this.scene.add(fillLight);
  }

  createEnvironment() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d8b40,
      roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    const platformGeometry = new THREE.BoxGeometry(15, 0.5, 8);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.8
    });
    const playerPlatform = new THREE.Mesh(platformGeometry, platformMaterial);
    playerPlatform.position.set(-6, 0, 0);
    playerPlatform.receiveShadow = true;
    this.scene.add(playerPlatform);
    const enemyPlatform = new THREE.Mesh(platformGeometry, platformMaterial);
    enemyPlatform.position.set(6, 0, 0);
    enemyPlatform.receiveShadow = true;
    this.scene.add(enemyPlatform);
    this.createTrees();
    this.createSkyDome();
  }

  createTrees() {
    const positions = [
      [-20, 0, 15], [-18, 0, -12], [22, 0, 18], [20, 0, -15],
      [-15, 0, 20], [18, 0, -10], [-22, 0, -8], [25, 0, 8]
    ];
    positions.forEach(pos => {
      this.createTree(pos[0], pos[1], pos[2]);
    });
  }

  createTree(x, y, z) {
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, y + 1.5, z);
    trunk.castShadow = true;
    this.scene.add(trunk);
    const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.set(x, y + 5, z);
    foliage.castShadow = true;
    this.scene.add(foliage);
  }

  createSkyDome() {
    const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);
  }

  createPokemonModel(pokemon, isPlayer) {
    const group = PokemonModelBuilder.buildPokemonModel(pokemon);

    const x = isPlayer ? -6 : 6;
    const y = 0.25;
    group.position.set(x, y, 0);
    if (isPlayer) {
      group.rotation.y = Math.PI / 2;
    } else {
      group.rotation.y = -Math.PI / 2;
    }
    this.scene.add(group);
    return group;
  }

  setPlayerPokemon(pokemon) {
    if (this.playerPokemonModel) {
      this.scene.remove(this.playerPokemonModel);
      this.playerPokemonModel.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }
    this.playerPokemonModel = this.createPokemonModel(pokemon, true);
  }

  setEnemyPokemon(pokemon) {
    if (this.enemyPokemonModel) {
      this.scene.remove(this.enemyPokemonModel);
      this.enemyPokemonModel.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }
    this.enemyPokemonModel = this.createPokemonModel(pokemon, false);
  }

  playAttackAnimation(isPlayer, onComplete) {
    const model = isPlayer ? this.playerPokemonModel : this.enemyPokemonModel;
    if (!model) {
      if (onComplete) onComplete();
      return;
    }
    const startPos = { x: model.position.x, y: model.position.y };
    const targetX = isPlayer ? model.position.x + 3 : model.position.x - 3;
    const startTime = Date.now();
    const duration = 400;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      if (progress < 0.5) {
        const forwardProgress = progress * 2;
        model.position.x = startPos.x + (targetX - startPos.x) * forwardProgress;
        model.position.y = startPos.y + Math.sin(forwardProgress * Math.PI) * 0.5;
      } else {
        const backwardProgress = (progress - 0.5) * 2;
        model.position.x = targetX - (targetX - startPos.x) * backwardProgress;
        model.position.y = startPos.y + Math.sin((1 - backwardProgress) * Math.PI) * 0.5;
      }
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        model.position.x = startPos.x;
        model.position.y = startPos.y;
        if (onComplete) onComplete();
      }
    };
    animate();
  }

  playDamageAnimation(isPlayer, onComplete) {
    const model = isPlayer ? this.playerPokemonModel : this.enemyPokemonModel;
    if (!model) {
      if (onComplete) onComplete();
      return;
    }
    const startTime = Date.now();
    const duration = 500;
    const flashInterval = 100;
    let currentFlash = 0;
    const originalMaterials = [];
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => originalMaterials.push({ mesh: child, material: m.clone() }));
        } else {
          originalMaterials.push({ mesh: child, material: child.material.clone() });
        }
      }
    });
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newFlash = Math.floor(elapsed / flashInterval);
      if (newFlash !== currentFlash) {
        currentFlash = newFlash;
        const isWhite = currentFlash % 2 === 0;
        originalMaterials.forEach(({ mesh }) => {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.color.setHex(isWhite ? 0xffffff : 0x333333));
          } else {
            mesh.material.color.setHex(isWhite ? 0xffffff : 0x333333);
          }
        });
      }
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        originalMaterials.forEach(({ mesh, material }) => {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m, i) => {
              if (material[i]) m.color.copy(material[i].color);
            });
          } else {
            mesh.material.color.copy(material.color);
          }
        });
        if (onComplete) onComplete();
      }
    };
    animate();
  }

  playSwitchAnimation(oldModel, newPokemon, isPlayer, onComplete) {
    if (!oldModel) {
      if (isPlayer) {
        this.setPlayerPokemon(newPokemon);
      } else {
        this.setEnemyPokemon(newPokemon);
      }
      if (onComplete) onComplete();
      return;
    }
    const startTime = Date.now();
    const fadeDuration = 300;
    const animateOut = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / fadeDuration, 1);
      oldModel.scale.set(1 - progress, 1 - progress, 1 - progress);
      oldModel.rotation.y += 0.1;
      if (progress < 1) {
        requestAnimationFrame(animateOut);
      } else {
        if (isPlayer) {
          this.setPlayerPokemon(newPokemon);
        } else {
          this.setEnemyPokemon(newPokemon);
        }
        const newModel = isPlayer ? this.playerPokemonModel : this.enemyPokemonModel;
        if (newModel) {
          newModel.scale.set(0, 0, 0);
          const inStartTime = Date.now();
          const animateIn = () => {
            const inElapsed = Date.now() - inStartTime;
            const inProgress = Math.min(inElapsed / fadeDuration, 1);
            newModel.scale.set(inProgress, inProgress, inProgress);
            if (inProgress < 1) {
              requestAnimationFrame(animateIn);
            } else {
              if (onComplete) onComplete();
            }
          };
          animateIn();
        } else if (onComplete) {
          onComplete();
        }
      }
    };
    animateOut();
  }

  playFaintAnimation(isPlayer, onComplete) {
    const model = isPlayer ? this.playerPokemonModel : this.enemyPokemonModel;
    if (!model) {
      if (onComplete) onComplete();
      return;
    }
    const startTime = Date.now();
    const duration = 800;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      model.position.y = 0.25 - progress * 2;
      model.rotation.x = progress * Math.PI;
      model.scale.set(1 - progress * 0.3, 1 - progress * 0.3, 1 - progress * 0.3);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };
    animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const time = Date.now() * 0.001;
    if (this.playerPokemonModel && !this.playerPokemonModel.isAnimating) {
      this.playerPokemonModel.position.y = 0.25 + Math.sin(time * 2) * 0.1;
    }
    if (this.enemyPokemonModel && !this.enemyPokemonModel.isAnimating) {
      this.enemyPokemonModel.position.y = 0.25 + Math.sin(time * 2 + Math.PI) * 0.1;
    }
    this.renderer.render(this.scene, this.camera);
  }
}

class Game {
  constructor() {
    this.battleState = new BattleState();
    this.aiController = null;
    this.battleEngine = new BattleEngine();
    this.scene3D = null;
    this.previewScene = null;
    this.selectedPokemonIds = [];
    this.currentPreviewId = null;
    this.init();
  }

  init() {
    this.createParticles();
    this.renderPokemonSelection();
    this.initPreviewScene();
    window.startGame = () => this.startGame();
    window.selectPokemon = (id) => this.selectPokemon(id);
    window.hoverPokemon = (id) => this.hoverPokemon(id);
    window.startBattle = () => this.startBattle();
    window.showMoves = () => this.showMoves();
    window.hideMoves = () => this.hideMoves();
    window.showSwitchPanel = () => this.showSwitchPanel();
    window.hideSwitchPanel = () => this.hideSwitchPanel();
    window.showItems = () => this.showItems();
    window.hideItems = () => this.hideItems();
    window.useMove = (index) => this.useMove(index);
    window.switchPokemon = (index) => this.switchPokemon(index);
    window.useItem = (itemId) => this.useItem(itemId);
    window.addLog = (msg) => this.addLog(msg);
  }

  initPreviewScene() {
    setTimeout(() => {
      this.previewScene = new PreviewScene3D();
    }, 100);
  }

  createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (10 + Math.random() * 10) + 's';
      container.appendChild(particle);
    }
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  startGame() {
    this.showScreen('selection-screen');
  }

  renderPokemonSelection() {
    const grid = document.getElementById('pokemon-grid');
    grid.innerHTML = '';
    POKEMON_DATA.forEach(pokemon => {
      const card = document.createElement('div');
      card.className = 'pokemon-card';
      card.id = `pokemon-card-${pokemon.id}`;
      card.onclick = () => this.selectPokemon(pokemon.id);
      card.onmouseenter = () => this.hoverPokemon(pokemon.id);
      const typesHtml = pokemon.types.map(t => 
        `<span class="pokemon-type type-${t}">${t}</span>`
      ).join('');
      card.innerHTML = `
        <div class="pokemon-model" style="background: #${pokemon.color.toString(16).padStart(6, '0')}33; border: 3px solid #${pokemon.color.toString(16).padStart(6, '0')}">
          ${pokemon.emoji}
        </div>
        <div class="pokemon-name">${pokemon.name}</div>
        <div>${typesHtml}</div>
        <div style="color: #aaa; font-size: 0.85rem; margin-top: 8px;">
          HP: ${pokemon.maxHp} | ATK: ${pokemon.attack} | DEF: ${pokemon.defense}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  hoverPokemon(id) {
    this.currentPreviewId = id;
    const pokemon = POKEMON_DATA.find(p => p.id === id);
    if (pokemon && this.previewScene) {
      this.previewScene.setPokemon(pokemon);
      const nameEl = document.getElementById('preview-name');
      if (nameEl) {
        const typesHtml = pokemon.types.map(t => 
          `<span class="pokemon-type type-${t}" style="display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; color: white; margin: 0 3px;">${t}</span>`
        ).join('');
        nameEl.innerHTML = `
          ${pokemon.emoji} ${pokemon.name}<br>
          <div style="margin-top: 8px;">${typesHtml}</div>
          <div style="font-size: 0.9rem; color: #aaa; margin-top: 8px;">
            HP: ${pokemon.maxHp} | ATK: ${pokemon.attack} | DEF: ${pokemon.defense} | SPD: ${pokemon.speed}
          </div>
        `;
      }
    }
  }

  selectPokemon(id) {
    const index = this.selectedPokemonIds.indexOf(id);
    if (index > -1) {
      this.selectedPokemonIds.splice(index, 1);
    } else if (this.selectedPokemonIds.length < 3) {
      this.selectedPokemonIds.push(id);
    }
    this.updateSelectionUI();
  }

  updateSelectionUI() {
    document.getElementById('selected-count').textContent = this.selectedPokemonIds.length;
    POKEMON_DATA.forEach(pokemon => {
      const card = document.getElementById(`pokemon-card-${pokemon.id}`);
      if (card) {
        card.classList.remove('selected', 'disabled');
        if (this.selectedPokemonIds.includes(pokemon.id)) {
          card.classList.add('selected');
        } else if (this.selectedPokemonIds.length >= 3) {
          card.classList.add('disabled');
        }
      }
    });
    const selectedContainer = document.getElementById('selected-pokemons');
    selectedContainer.innerHTML = '';
    this.selectedPokemonIds.forEach(id => {
      const pokemon = POKEMON_DATA.find(p => p.id === id);
      if (pokemon) {
        const div = document.createElement('div');
        div.className = 'selected-pokemon';
        div.style.background = `#${pokemon.color.toString(16).padStart(6, '0')}33`;
        div.textContent = pokemon.emoji;
        selectedContainer.appendChild(div);
      }
    });
    document.getElementById('start-battle-btn').disabled = this.selectedPokemonIds.length !== 3;
  }

  startBattle() {
    this.battleState.playerTeam = this.selectedPokemonIds.map(id => 
      new Pokemon(POKEMON_DATA.find(p => p.id === id))
    );
    const availableIds = POKEMON_DATA.filter(p => !this.selectedPokemonIds.includes(p.id)).map(p => p.id);
    const enemyIds = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * availableIds.length);
      enemyIds.push(availableIds.splice(randomIndex, 1)[0]);
    }
    this.battleState.enemyTeam = enemyIds.map(id => 
      new Pokemon(POKEMON_DATA.find(p => p.id === id))
    );
    this.aiController = new AIController(this.battleState);
    this.scene3D = new Scene3D();
    this.scene3D.setPlayerPokemon(this.battleState.currentPlayerPokemon);
    this.scene3D.setEnemyPokemon(this.battleState.currentEnemyPokemon);
    this.showScreen('battle-screen');
    this.battleState.battleActive = true;
    this.updateUI();
    this.addLog('野生训练家向你发起挑战！');
    this.addLog(`对方派出了 ${this.battleState.currentEnemyPokemon.name}！`);
    this.addLog(`去吧，${this.battleState.currentPlayerPokemon.name}！`);
  }

  updateUI() {
    const playerPokemon = this.battleState.currentPlayerPokemon;
    const enemyPokemon = this.battleState.currentEnemyPokemon;
    document.getElementById('player-name').textContent = playerPokemon.name;
    document.getElementById('enemy-name').textContent = enemyPokemon.name;
    const playerHpPercent = (playerPokemon.currentHp / playerPokemon.maxHp) * 100;
    const enemyHpPercent = (enemyPokemon.currentHp / enemyPokemon.maxHp) * 100;
    const playerHpFill = document.getElementById('player-hp-fill');
    const enemyHpFill = document.getElementById('enemy-hp-fill');
    playerHpFill.style.width = playerHpPercent + '%';
    enemyHpFill.style.width = enemyHpPercent + '%';
    playerHpFill.classList.remove('low', 'medium');
    enemyHpFill.classList.remove('low', 'medium');
    if (playerHpPercent <= 20) playerHpFill.classList.add('low');
    else if (playerHpPercent <= 50) playerHpFill.classList.add('medium');
    if (enemyHpPercent <= 20) enemyHpFill.classList.add('low');
    else if (enemyHpPercent <= 50) enemyHpFill.classList.add('medium');
    document.getElementById('player-hp-text').textContent = 
      `HP: ${playerPokemon.currentHp}/${playerPokemon.maxHp}`;
    document.getElementById('enemy-hp-text').textContent = 
      `HP: ${enemyPokemon.currentHp}/${enemyPokemon.maxHp}`;
  }

  addLog(message) {
    const logContent = document.getElementById('log-content');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `> ${message}`;
    logContent.insertBefore(entry, logContent.firstChild);
    while (logContent.children.length > 20) {
      logContent.removeChild(logContent.lastChild);
    }
  }

  showMoves() {
    if (this.battleState.isProcessing) return;
    const movesGrid = document.getElementById('moves-grid');
    movesGrid.innerHTML = '';
    const pokemon = this.battleState.currentPlayerPokemon;
    pokemon.moves.forEach((move, index) => {
      const btn = document.createElement('button');
      btn.className = 'move-btn';
      btn.disabled = move.currentPp <= 0;
      btn.innerHTML = `
        <div>${move.name}</div>
        <div style="font-size: 0.8rem; opacity: 0.7;">
          威力: ${move.power || '-'} | PP: ${move.currentPp}/${move.pp}
        </div>
      `;
      btn.onclick = () => this.useMove(index);
      movesGrid.appendChild(btn);
    });
    document.getElementById('action-panel').style.display = 'none';
    document.getElementById('moves-panel').classList.add('active');
  }

  hideMoves() {
    document.getElementById('moves-panel').classList.remove('active');
    document.getElementById('action-panel').style.display = 'block';
  }

  showItems() {
    if (this.battleState.isProcessing) return;
    const itemsGrid = document.getElementById('items-grid');
    itemsGrid.innerHTML = '';
    this.battleState.items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'item-btn';
      btn.disabled = item.count <= 0;
      btn.innerHTML = `
        <div>🎒 ${item.name}</div>
        <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 3px;">${item.description}</div>
        <div class="item-count">剩余: ${item.count}</div>
      `;
      btn.onclick = () => this.useItem(item.id);
      itemsGrid.appendChild(btn);
    });
    document.getElementById('action-panel').style.display = 'none';
    document.getElementById('items-panel').classList.add('active');
  }

  hideItems() {
    document.getElementById('items-panel').classList.remove('active');
    document.getElementById('action-panel').style.display = 'block';
  }

  showSwitchPanel() {
    if (this.battleState.isProcessing) return;
    const switchGrid = document.getElementById('switch-grid');
    switchGrid.innerHTML = '';
    this.battleState.playerTeam.forEach((pokemon, index) => {
      const card = document.createElement('div');
      card.className = 'switch-card';
      if (index === this.battleState.currentPlayerIndex) card.classList.add('current');
      if (pokemon.isFainted) card.classList.add('fainted');
      const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
      card.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 8px;">${pokemon.emoji}</div>
        <div class="switch-name">${pokemon.name}</div>
        <div style="color: #aaa; font-size: 0.85rem;">
          ${pokemon.currentHp}/${pokemon.maxHp} HP
        </div>
        <div class="switch-hp">
          <div class="switch-hp-fill" style="width: ${hpPercent}%; background: ${hpPercent <= 20 ? '#e74c3c' : hpPercent <= 50 ? '#f39c12' : '#2ecc71'}"></div>
        </div>
      `;
      card.onclick = () => this.switchPokemon(index);
      switchGrid.appendChild(card);
    });
    document.getElementById('action-panel').style.display = 'none';
    document.getElementById('switch-panel').classList.add('active');
  }

  hideSwitchPanel() {
    document.getElementById('switch-panel').classList.remove('active');
    document.getElementById('action-panel').style.display = 'block';
  }

  async useItem(itemId) {
    if (this.battleState.isProcessing) return;
    const item = this.battleState.items.find(i => i.id === itemId);
    if (!item || item.count <= 0) {
      this.addLog('没有这个道具了！');
      return;
    }
    this.battleState.isProcessing = true;
    this.hideItems();
    const pokemon = this.battleState.currentPlayerPokemon;
    let used = false;
    if (item.effect === 'heal') {
      if (pokemon.isFainted) {
        this.addLog(`${pokemon.name} 已经倒下了！`);
      } else if (pokemon.currentHp >= pokemon.maxHp) {
        this.addLog(`${pokemon.name} 的HP已经是满的！`);
      } else {
        const actualHeal = pokemon.heal(item.value);
        this.addLog(`使用了${item.name}！${pokemon.name} 恢复了 ${actualHeal} HP！`);
        used = true;
      }
    } else if (item.effect === 'revive') {
      const fainted = this.battleState.playerTeam.filter(p => p.isFainted);
      if (fainted.length > 0) {
        this.showRevivePanel(item);
        return;
      } else {
        this.addLog('没有倒下的宝可梦！');
      }
    } else if (item.effect === 'boost') {
      if (pokemon.isFainted) {
        this.addLog(`${pokemon.name} 已经倒下了！`);
      } else {
        pokemon.statBoosts[item.stat] = Math.min(6, pokemon.statBoosts[item.stat] + item.value);
        this.addLog(`使用了${item.name}！${pokemon.name} 的${item.stat === 'attack' ? '攻击' : '能力'}提升了！`);
        used = true;
      }
    }
    if (used) {
      item.count--;
      this.updateUI();
      await this.delay(1000);
      this.battleState.isProcessing = false;
      await this.enemyTurn();
      this.checkBattleEnd();
    } else {
      this.battleState.isProcessing = false;
    }
  }

  showRevivePanel(item) {
    const itemsGrid = document.getElementById('items-grid');
    itemsGrid.innerHTML = '';
    this.battleState.playerTeam.forEach((pokemon, index) => {
      if (pokemon.isFainted) {
        const btn = document.createElement('button');
        btn.className = 'item-btn';
        btn.innerHTML = `
          <div>${pokemon.emoji} ${pokemon.name}</div>
          <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 3px;">复活并恢复50%HP</div>
        `;
        btn.onclick = async () => {
          this.battleState.isProcessing = true;
          this.hideItems();
          pokemon.revive(item.value);
          item.count--;
          this.addLog(`使用了${item.name}！${pokemon.name} 复活了！`);
          await this.delay(1000);
          this.battleState.isProcessing = false;
          await this.enemyTurn();
          this.checkBattleEnd();
        };
        itemsGrid.appendChild(btn);
      }
    });
  }

  async useMove(moveIndex) {
    if (this.battleState.isProcessing) return;
    this.battleState.isProcessing = true;
    this.hideMoves();
    const move = this.battleState.currentPlayerPokemon.moves[moveIndex];
    if (move.currentPp <= 0) {
      this.addLog(`${move.name} 的PP已经用完了！`);
      this.battleState.isProcessing = false;
      return;
    }
    move.currentPp--;
    const playerSpeed = this.battleState.currentPlayerPokemon.getEffectiveStat('speed');
    const enemySpeed = this.battleState.currentEnemyPokemon.getEffectiveStat('speed');
    if (playerSpeed >= enemySpeed) {
      await this.executeMove(this.battleState.currentPlayerPokemon, this.battleState.currentEnemyPokemon, move, true);
      if (this.checkBattleEnd()) return;
      if (!this.battleState.currentEnemyPokemon.isFainted) {
        await this.enemyTurn();
      }
    } else {
      await this.enemyTurn();
      if (this.checkBattleEnd()) return;
      if (!this.battleState.currentPlayerPokemon.isFainted) {
        await this.executeMove(this.battleState.currentPlayerPokemon, this.battleState.currentEnemyPokemon, move, true);
      }
    }
    this.checkBattleEnd();
  }

  async executeMove(attacker, defender, move, isPlayerAttacking) {
    this.addLog(`${attacker.name} 使用了 ${move.name}！`);
    await this.scene3D.playAttackAnimation(isPlayerAttacking);
    if (move.power > 0) {
      const damage = this.battleEngine.calculateDamage(attacker, defender, move);
      const effectiveness = this.battleEngine.getTypeEffectiveness(move.type, defender.types);
      const effectText = this.battleEngine.getEffectivenessText(effectiveness);
      if (effectText) this.addLog(effectText);
      defender.takeDamage(damage);
      await this.scene3D.playDamageAnimation(!isPlayerAttacking);
      this.addLog(`${defender.name} 受到了 ${damage} 点伤害！`);
      this.updateUI();
      if (defender.isFainted) {
        await this.scene3D.playFaintAnimation(!isPlayerAttacking);
        this.addLog(`${defender.name} 倒下了！`);
      }
    } else {
      this.addLog(`${attacker.name} 的能力提升了！`);
      attacker.statBoosts.attack = Math.min(6, attacker.statBoosts.attack + 1);
      attacker.statBoosts.defense = Math.min(6, attacker.statBoosts.defense + 1);
    }
    await this.delay(500);
  }

  async enemyTurn() {
    if (!this.battleState.battleActive) return;
    if (this.battleState.currentEnemyPokemon.isFainted) {
      const nextEnemy = this.findNextPokemon(this.battleState.enemyTeam, this.battleState.currentEnemyIndex);
      if (nextEnemy !== -1) {
        await this.forceSwitchEnemy(nextEnemy);
      }
      return;
    }
    const action = this.aiController.chooseAction();
    if (action.type === 'switch') {
      await this.forceSwitchEnemy(action.index);
    } else {
      await this.executeMove(
        this.battleState.currentEnemyPokemon,
        this.battleState.currentPlayerPokemon,
        action.move,
        false
      );
    }
  }

  findNextPokemon(team, currentIndex) {
    for (let i = 0; i < team.length; i++) {
      if (i !== currentIndex && !team[i].isFainted) {
        return i;
      }
    }
    return -1;
  }

  async switchPokemon(index) {
    if (this.battleState.isProcessing) return;
    if (index === this.battleState.currentPlayerIndex) {
      this.addLog('不能选择当前出战的宝可梦！');
      return;
    }
    if (this.battleState.playerTeam[index].isFainted) {
      this.addLog('这只宝可梦已经倒下了！');
      return;
    }
    this.battleState.isProcessing = true;
    this.hideSwitchPanel();
    const oldPokemon = this.battleState.currentPlayerPokemon;
    this.addLog(`回来吧，${oldPokemon.name}！`);
    await this.delay(500);
    this.battleState.currentPlayerIndex = index;
    const newPokemon = this.battleState.currentPlayerPokemon;
    await this.scene3D.playSwitchAnimation(this.scene3D.playerPokemonModel, newPokemon, true);
    this.addLog(`去吧，${newPokemon.name}！`);
    this.updateUI();
    this.battleState.isProcessing = false;
    await this.enemyTurn();
    this.checkBattleEnd();
  }

  async forceSwitchEnemy(index) {
    const oldPokemon = this.battleState.currentEnemyPokemon;
    this.battleState.currentEnemyIndex = index;
    const newPokemon = this.battleState.currentEnemyPokemon;
    await this.scene3D.playSwitchAnimation(this.scene3D.enemyPokemonModel, newPokemon, false);
    this.addLog(`对方派出了 ${newPokemon.name}！`);
    this.updateUI();
  }

  async forceSwitchPlayer(index) {
    const oldPokemon = this.battleState.currentPlayerPokemon;
    this.battleState.currentPlayerIndex = index;
    const newPokemon = this.battleState.currentPlayerPokemon;
    await this.scene3D.playSwitchAnimation(this.scene3D.playerPokemonModel, newPokemon, true);
    this.addLog(`去吧，${newPokemon.name}！`);
    this.updateUI();
    this.battleState.isProcessing = false;
  }

  checkBattleEnd() {
    const playerAlive = this.battleState.playerTeam.some(p => !p.isFainted);
    const enemyAlive = this.battleState.enemyTeam.some(p => !p.isFainted);
    if (!playerAlive) {
      this.battleState.battleActive = false;
      this.battleState.isProcessing = true;
      this.addLog('你的所有宝可梦都倒下了...');
      this.showGameOver(false);
      return true;
    }
    if (!enemyAlive) {
      this.battleState.battleActive = false;
      this.battleState.isProcessing = true;
      this.addLog('对方的所有宝可梦都倒下了！');
      this.addLog('你赢得了这场战斗！');
      this.showGameOver(true);
      return true;
    }
    if (this.battleState.currentPlayerPokemon.isFainted) {
      this.battleState.isProcessing = true;
      this.forcePlayerSwitch();
      return true;
    }
    if (this.battleState.currentEnemyPokemon.isFainted) {
      this.handleEnemyFainted();
      return true;
    }
    this.battleState.isProcessing = false;
    return false;
  }

  async handleEnemyFainted() {
    this.battleState.isProcessing = true;
    await this.delay(500);
    const nextEnemy = this.findNextPokemon(this.battleState.enemyTeam, this.battleState.currentEnemyIndex);
    if (nextEnemy !== -1) {
      await this.forceSwitchEnemy(nextEnemy);
    }
    this.battleState.isProcessing = false;
  }

  async forcePlayerSwitch() {
    this.addLog('请选择下一只宝可梦！');
    const availableIndices = this.battleState.playerTeam
      .map((p, i) => !p.isFainted ? i : -1)
      .filter(i => i !== -1);
    if (availableIndices.length > 0) {
      this.showSwitchPanel();
      const checkSwitch = async () => {
        if (!this.battleState.currentPlayerPokemon.isFainted) {
          await this.enemyTurn();
          this.checkBattleEnd();
        } else {
          setTimeout(checkSwitch, 200);
        }
      };
      checkSwitch();
    }
  }

  showGameOver(isWin) {
    const screen = document.getElementById('game-over-screen');
    const title = document.getElementById('game-over-title');
    title.textContent = isWin ? '🏆 胜利！' : '💔 失败...';
    title.className = `game-over-title ${isWin ? 'win' : 'lose'}`;
    screen.classList.add('active');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

new Game();
