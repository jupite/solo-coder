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
    this.camera.position.set(0, 8, 25);
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
    directionalLight.position.set(10, 20, 10);
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
    const group = new THREE.Group();
    const bodyColor = pokemon.color;
    const bodyGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 2.5;
    body.castShadow = true;
    group.add(body);
    const headGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 4.5;
    head.castShadow = true;
    group.add(head);
    const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const eyeOffset = isPlayer ? 0.4 : -0.4;
    const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye1.position.set(-0.35, 4.6, eyeOffset);
    group.add(eye1);
    const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye2.position.set(0.35, 4.6, eyeOffset);
    group.add(eye2);
    const pupil1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), pupilMaterial);
    pupil1.position.set(-0.35, 4.55, eyeOffset + 0.1);
    group.add(pupil1);
    const pupil2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), pupilMaterial);
    pupil2.position.set(0.35, 4.55, eyeOffset + 0.1);
    group.add(pupil2);
    const armGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const armMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
    const arm1 = new THREE.Mesh(armGeometry, armMaterial);
    arm1.position.set(-1.5, 2.5, 0);
    arm1.castShadow = true;
    group.add(arm1);
    const arm2 = new THREE.Mesh(armGeometry, armMaterial);
    arm2.position.set(1.5, 2.5, 0);
    arm2.castShadow = true;
    group.add(arm2);
    const legGeometry = new THREE.CylinderGeometry(0.3, 0.35, 1.2, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(-0.7, 0.6, 0);
    leg1.castShadow = true;
    group.add(leg1);
    const leg2 = new THREE.Mesh(legGeometry, legMaterial);
    leg2.position.set(0.7, 0.6, 0);
    leg2.castShadow = true;
    group.add(leg2);
    const x = isPlayer ? -6 : 6;
    const y = 0.25;
    group.position.set(x, y, 0);
    if (!isPlayer) {
      group.rotation.y = Math.PI;
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
      model.rotation.z = progress * Math.PI;
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
    this.selectedPokemonIds = [];
    this.init();
  }

  init() {
    this.createParticles();
    this.renderPokemonSelection();
    window.startGame = () => this.startGame();
    window.selectPokemon = (id) => this.selectPokemon(id);
    window.startBattle = () => this.startBattle();
    window.showMoves = () => this.showMoves();
    window.hideMoves = () => this.hideMoves();
    window.showSwitchPanel = () => this.showSwitchPanel();
    window.hideSwitchPanel = () => this.hideSwitchPanel();
    window.useMove = (index) => this.useMove(index);
    window.switchPokemon = (index) => this.switchPokemon(index);
    window.useItem = () => this.useItem();
    window.addLog = (msg) => this.addLog(msg);
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

  async useItem() {
    if (this.battleState.isProcessing) return;
    const pokemon = this.battleState.currentPlayerPokemon;
    if (pokemon.currentHp >= pokemon.maxHp) {
      this.addLog(`${pokemon.name} 的HP已经是满的！`);
      return;
    }
    this.battleState.isProcessing = true;
    const healAmount = Math.floor(pokemon.maxHp * 0.3);
    const actualHeal = pokemon.heal(healAmount);
    this.addLog(`使用了药水！${pokemon.name} 恢复了 ${actualHeal} HP！`);
    this.updateUI();
    await this.delay(1000);
    this.battleState.isProcessing = false;
    await this.enemyTurn();
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
      this.forcePlayerSwitch();
      return true;
    }
    if (this.battleState.currentEnemyPokemon.isFainted) {
      this.battleState.isProcessing = false;
      return true;
    }
    this.battleState.isProcessing = false;
    return false;
  }

  async forcePlayerSwitch() {
    this.addLog('请选择下一只宝可梦！');
    const availableIndices = this.battleState.playerTeam
      .map((p, i) => !p.isFainted ? i : -1)
      .filter(i => i !== -1);
    if (availableIndices.length > 0) {
      this.showSwitchPanel();
      const checkInterval = setInterval(() => {
        if (!this.battleState.currentPlayerPokemon.isFainted) {
          clearInterval(checkInterval);
          this.battleState.isProcessing = false;
        }
      }, 100);
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
