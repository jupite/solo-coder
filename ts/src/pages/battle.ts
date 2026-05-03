import type { Item, BattleState, Pokemon, PokemonMove } from '../types';
import { BattleSystem } from '../game/battle';
import { PokemonAI } from '../game/ai';
import { WebGLRenderer } from '../webgl/renderer';
import { Sphere, Cone, Cube } from '../webgl/shapes';
import type { PokemonGame } from '../app';

export class BattlePage {
  game: PokemonGame;
  battleSystem: BattleSystem | null;
  renderer: WebGLRenderer | null;
  animationTime: number;
  is3DAnimating: boolean;
  isBattleProcessing: boolean;
  playerTeam: Pokemon[];
  enemyTeam: Pokemon[];
  activePlayerIndex: number;
  activeEnemyIndex: number;
  playerShake: { x: number; y: number; z: number };
  enemyShake: { x: number; y: number; z: number };
  isSwitchModalOpen: boolean;
  isForcedSwitch: boolean;
  isBackpackModalOpen: boolean;
  playerActiveRenderer: WebGLRenderer | null;
  enemyActiveRenderer: WebGLRenderer | null;

  battleCanvas: HTMLCanvasElement | null;
  playerActiveCanvas: HTMLCanvasElement | null;
  enemyActiveCanvas: HTMLCanvasElement | null;
  playerActiveName: HTMLHeadingElement | null;
  enemyActiveName: HTMLHeadingElement | null;
  playerActiveHpBar: HTMLDivElement | null;
  enemyActiveHpBar: HTMLDivElement | null;
  playerActiveHpText: HTMLDivElement | null;
  enemyActiveHpText: HTMLDivElement | null;
  moveButtons: HTMLButtonElement[];
  battleMessage: HTMLDivElement | null;
  playerTeamList: HTMLDivElement | null;
  enemyTeamList: HTMLDivElement | null;
  switchPokemonBtn: HTMLButtonElement | null;
  backpackBtn: HTMLButtonElement | null;
  switchModal: HTMLDivElement | null;
  switchModalTitle: HTMLHeadingElement | null;
  switchOptions: HTMLDivElement | null;
  cancelSwitchBtn: HTMLButtonElement | null;
  backpackModal: HTMLDivElement | null;
  backpackItemsModal: HTMLDivElement | null;
  cancelBackpackBtn: HTMLButtonElement | null;

  constructor(game: PokemonGame) {
    this.game = game;
    this.battleSystem = null;
    this.renderer = null;
    this.animationTime = 0;
    this.is3DAnimating = false;
    this.isBattleProcessing = false;
    this.playerTeam = [];
    this.enemyTeam = [];
    this.activePlayerIndex = 0;
    this.activeEnemyIndex = 0;
    this.playerShake = { x: 0, y: 0, z: 0 };
    this.enemyShake = { x: 0, y: 0, z: 0 };
    this.isSwitchModalOpen = false;
    this.isForcedSwitch = false;
    this.isBackpackModalOpen = false;
    this.playerActiveRenderer = null;
    this.enemyActiveRenderer = null;

    this.moveButtons = [];

    this.battleCanvas = null;
    this.playerActiveCanvas = null;
    this.enemyActiveCanvas = null;
    this.playerActiveName = null;
    this.enemyActiveName = null;
    this.playerActiveHpBar = null;
    this.enemyActiveHpBar = null;
    this.playerActiveHpText = null;
    this.enemyActiveHpText = null;
    this.battleMessage = null;
    this.playerTeamList = null;
    this.enemyTeamList = null;
    this.switchPokemonBtn = null;
    this.backpackBtn = null;
    this.switchModal = null;
    this.switchModalTitle = null;
    this.switchOptions = null;
    this.cancelSwitchBtn = null;
    this.backpackModal = null;
    this.backpackItemsModal = null;
    this.cancelBackpackBtn = null;

    this.init();
  }

  get playerPokemon(): Pokemon | null {
    if (!this.battleSystem) return null;
    return this.battleSystem.playerPokemon;
  }

  get enemyPokemon(): Pokemon | null {
    if (!this.battleSystem) return null;
    return this.battleSystem.enemyPokemon;
  }

  init(): void {
    this.battleCanvas = document.getElementById('battle-canvas') as HTMLCanvasElement | null;
    this.playerActiveCanvas = document.getElementById('player-active-canvas') as HTMLCanvasElement | null;
    this.enemyActiveCanvas = document.getElementById('enemy-active-canvas') as HTMLCanvasElement | null;
    this.playerActiveName = document.getElementById('player-active-name') as HTMLHeadingElement | null;
    this.enemyActiveName = document.getElementById('enemy-active-name') as HTMLHeadingElement | null;
    this.playerActiveHpBar = document.getElementById('player-active-hp-bar') as HTMLDivElement | null;
    this.enemyActiveHpBar = document.getElementById('enemy-active-hp-bar') as HTMLDivElement | null;
    this.playerActiveHpText = document.getElementById('player-active-hp-text') as HTMLDivElement | null;
    this.enemyActiveHpText = document.getElementById('enemy-active-hp-text') as HTMLDivElement | null;
    this.moveButtons = Array.from(document.querySelectorAll('.move-btn'));
    this.battleMessage = document.getElementById('battle-message') as HTMLDivElement | null;
    this.playerTeamList = document.getElementById('player-team-list') as HTMLDivElement | null;
    this.enemyTeamList = document.getElementById('enemy-team-list') as HTMLDivElement | null;
    this.switchPokemonBtn = document.getElementById('switch-pokemon-btn') as HTMLButtonElement | null;
    this.backpackBtn = document.getElementById('backpack-btn') as HTMLButtonElement | null;
    this.switchModal = document.getElementById('switch-modal') as HTMLDivElement | null;
    this.switchModalTitle = document.getElementById('switch-modal-title') as HTMLHeadingElement | null;
    this.switchOptions = document.getElementById('switch-options') as HTMLDivElement | null;
    this.cancelSwitchBtn = document.getElementById('cancel-switch-btn') as HTMLButtonElement | null;
    this.backpackModal = document.getElementById('backpack-modal') as HTMLDivElement | null;
    this.backpackItemsModal = document.getElementById('backpack-items-modal') as HTMLDivElement | null;
    this.cancelBackpackBtn = document.getElementById('cancel-backpack-btn') as HTMLButtonElement | null;

    this.bindEvents();
  }

  bindEvents(): void {
    this.moveButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        if (this.isBattleProcessing || !this.battleSystem || !this.battleSystem.isPlayerTurn) return;
        if (this.isSwitchModalOpen || this.isBackpackModalOpen) return;

        const target = e.target as HTMLElement;
        const moveIndex = parseInt(target.dataset.move || '0');
        this.executePlayerMove(moveIndex);
      });
    });

    if (this.switchPokemonBtn) {
      this.switchPokemonBtn.addEventListener('click', () => {
        if (this.isBattleProcessing || !this.battleSystem || !this.battleSystem.isPlayerTurn) return;
        if (!this.battleSystem.canPlayerSwitch()) return;

        this.openSwitchModal(false);
      });
    }

    if (this.backpackBtn) {
      this.backpackBtn.addEventListener('click', () => {
        if (this.isBattleProcessing || !this.battleSystem || !this.battleSystem.isPlayerTurn) return;

        this.openBackpackModal();
      });
    }

    if (this.cancelSwitchBtn) {
      this.cancelSwitchBtn.addEventListener('click', () => {
        if (this.isForcedSwitch) return;
        this.closeSwitchModal();
      });
    }

    if (this.cancelBackpackBtn) {
      this.cancelBackpackBtn.addEventListener('click', () => {
        this.closeBackpackModal();
      });
    }
  }

  startBattle(playerPokemonIds: number[], enemyPokemonIds: number[], playerBackpack: Record<string, Item> = {}): void {
    const ai = new PokemonAI('medium');
    this.battleSystem = new BattleSystem(playerPokemonIds, enemyPokemonIds, ai, playerBackpack);

    this.updateUI();
    this.initRenderer();
    this.initSideRenderers();

    if (this.battleSystem.isPlayerTurn) {
      if (this.battleMessage) {
        this.battleMessage.textContent = `轮到 ${this.playerPokemon?.name} 行动！`;
      }
    } else {
      if (this.battleMessage) {
        this.battleMessage.textContent = `轮到 ${this.enemyPokemon?.name} 行动！`;
      }
      setTimeout(() => this.executeEnemyTurn(), 1000);
    }

    this.startAnimation();
  }

  initRenderer(): void {
    try {
      if (this.battleCanvas) {
        this.renderer = new WebGLRenderer(this.battleCanvas);
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
      }
    } catch (e) {
      console.error('无法创建 WebGL 上下文:', e);
    }
  }

  initSideRenderers(): void {
    try {
      if (this.playerActiveCanvas) {
        this.playerActiveRenderer = new WebGLRenderer(this.playerActiveCanvas);
      }
      if (this.enemyActiveCanvas) {
        this.enemyActiveRenderer = new WebGLRenderer(this.enemyActiveCanvas);
      }
    } catch (e) {
      console.error('无法创建侧边栏 WebGL 上下文:', e);
    }
  }

  resizeCanvas(): void {
    if (!this.renderer || !this.battleCanvas) return;

    const container = this.battleCanvas.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = 500;

    this.renderer.resize(width, height);
  }

  startAnimation(): void {
    this.is3DAnimating = true;

    const animate = () => {
      if (!this.battleSystem) {
        this.is3DAnimating = false;
        return;
      }

      this.animationTime = Date.now() * 0.001;

      this.playerShake.x *= 0.9;
      this.playerShake.y *= 0.9;
      this.playerShake.z *= 0.9;
      this.enemyShake.x *= 0.9;
      this.enemyShake.y *= 0.9;
      this.enemyShake.z *= 0.9;

      this.renderBattleScene();
      this.renderSidePokemon();

      requestAnimationFrame(animate);
    };

    animate();
  }

  renderSidePokemon(): void {
    if (this.playerActiveRenderer && this.playerPokemon) {
      this.renderMiniPokemon(this.playerActiveRenderer, this.playerPokemon, true);
    }
    if (this.enemyActiveRenderer && this.enemyPokemon) {
      this.renderMiniPokemon(this.enemyActiveRenderer, this.enemyPokemon, false);
    }
  }

  renderMiniPokemon(renderer: WebGLRenderer, pokemon: Pokemon, isPlayer: boolean): void {
    const canvas = renderer.canvas;
    const time = this.animationTime;

    renderer.clear(0.95, 0.95, 0.97, 1.0);
    renderer.setViewport(canvas.width, canvas.height);
    renderer.useProgram();

    const aspect = canvas.width / canvas.height;
    renderer.projectionMatrix = renderer.perspectiveMatrix(Math.PI / 4, aspect, 0.1, 100);
    renderer.modelViewMatrix = renderer.lookAt([0, 0, 2.5], [0, 0, 0], [0, 1, 0]);

    renderer.setLighting(
      [3, 3, 3],
      [1.0, 1.0, 1.0],
      0.3,
      0.6,
      0.3,
      32
    );

    this.drawMiniPokemonShape(renderer, pokemon, time, isPlayer);
  }

  drawMiniPokemonShape(renderer: WebGLRenderer, pokemon: Pokemon, time: number, isPlayer: boolean): void {
    const color = pokemon.color;
    const secondaryColor = pokemon.secondaryColor || color;

    const body = new Sphere(renderer, color, 0.4, 12);
    const head = new Sphere(renderer, color, 0.32, 12);
    const eyeWhite = new Sphere(renderer, [1.0, 1.0, 1.0, 1.0], 0.08, 6);
    const eyeBlack = new Sphere(renderer, [0.0, 0.0, 0.0, 1.0], 0.04, 6);

    const bobY = Math.sin(time * 2) * 0.03;
    const baseY = bobY;

    let bodyMatrix = renderer.translateMatrix(0, baseY, 0);
    bodyMatrix = renderer.multiplyMatrices(bodyMatrix, renderer.scaleMatrix(1.1, 1.1, 1.1));
    renderer.drawShape(body, bodyMatrix);

    let headMatrix = renderer.translateMatrix(0, baseY + 0.4, 0);
    headMatrix = renderer.multiplyMatrices(headMatrix, renderer.scaleMatrix(1.0, 1.0, 1.0));
    renderer.drawShape(head, headMatrix);

    const eyeOffsetX = isPlayer ? 0.1 : -0.1;

    let leftEyeMatrix = renderer.translateMatrix(-0.1 + eyeOffsetX * 0.5, baseY + 0.45, 0.25);
    renderer.drawShape(eyeWhite, leftEyeMatrix);

    let rightEyeMatrix = renderer.translateMatrix(0.1 + eyeOffsetX * 0.5, baseY + 0.45, 0.25);
    renderer.drawShape(eyeWhite, rightEyeMatrix);

    let leftPupilMatrix = renderer.translateMatrix(-0.08 + eyeOffsetX, baseY + 0.45, 0.3);
    renderer.drawShape(eyeBlack, leftPupilMatrix);

    let rightPupilMatrix = renderer.translateMatrix(0.12 + eyeOffsetX, baseY + 0.45, 0.3);
    renderer.drawShape(eyeBlack, rightPupilMatrix);

    if (pokemon.shape === 'pikachu' || pokemon.shape === 'raichu') {
      const ear = new Cone(renderer, secondaryColor, 0.1, 0.3, 6);

      let leftEarMatrix = renderer.translateMatrix(-0.15, baseY + 0.65, 0);
      leftEarMatrix = renderer.multiplyMatrices(leftEarMatrix, renderer.rotateZMatrix(-0.3));
      renderer.drawShape(ear, leftEarMatrix);

      let rightEarMatrix = renderer.translateMatrix(0.15, baseY + 0.65, 0);
      rightEarMatrix = renderer.multiplyMatrices(rightEarMatrix, renderer.rotateZMatrix(0.3));
      renderer.drawShape(ear, rightEarMatrix);
    }
  }

  renderBattleScene(): void {
    if (!this.renderer) return;

    const canvas = this.renderer.canvas;

    this.renderer.clear(0.3, 0.6, 0.9, 1.0);
    this.renderer.setViewport(canvas.width, canvas.height);
    this.renderer.useProgram();

    const aspect = canvas.width / canvas.height;
    this.renderer.projectionMatrix = this.renderer.perspectiveMatrix(Math.PI / 4, aspect, 0.1, 100);
    this.renderer.modelViewMatrix = this.renderer.lookAt([0, 2, 6], [0, 0.5, 0], [0, 1, 0]);

    this.renderer.setLighting(
      [5, 5, 5],
      [1.0, 1.0, 1.0],
      0.3,
      0.6,
      0.3,
      32
    );

    this.drawBattleGround();

    if (this.playerPokemon && !this.playerPokemon.isFainted()) {
      this.drawPokemon(this.playerPokemon, { x: -2, y: 0.3, z: 0 }, this.playerShake, true);
    }

    if (this.enemyPokemon && !this.enemyPokemon.isFainted()) {
      this.drawPokemon(this.enemyPokemon, { x: 2, y: 0.3, z: 0 }, this.enemyShake, false);
    }
  }

  drawBattleGround(): void {
    if (!this.renderer) return;

    const ground = new Cube(this.renderer, [0.4, 0.8, 0.4, 1.0], 1);

    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        let groundMatrix = this.renderer.translateMatrix(i * 0.9, -0.6, j * 0.9);
        groundMatrix = this.renderer.multiplyMatrices(groundMatrix, this.renderer.scaleMatrix(0.8, 0.2, 0.8));
        this.renderer.drawShape(ground, groundMatrix);
      }
    }
  }

  drawPokemon(pokemon: Pokemon, position: { x: number; y: number; z: number }, shake: { x: number; y: number; z: number }, isPlayer: boolean): void {
    if (!this.renderer) return;

    const color = pokemon.color;
    const secondaryColor = pokemon.secondaryColor || color;

    const body = new Sphere(this.renderer, color, 0.5, 16);
    const head = new Sphere(this.renderer, color, 0.4, 16);
    const eyeWhite = new Sphere(this.renderer, [1.0, 1.0, 1.0, 1.0], 0.1, 8);
    const eyeBlack = new Sphere(this.renderer, [0.0, 0.0, 0.0, 1.0], 0.05, 8);

    const bobY = Math.sin(this.animationTime * 2) * 0.05;
    const baseX = position.x + shake.x;
    const baseY = position.y + shake.y + bobY;
    const baseZ = position.z + shake.z;

    let bodyMatrix = this.renderer.translateMatrix(baseX, baseY, baseZ);
    bodyMatrix = this.renderer.multiplyMatrices(bodyMatrix, this.renderer.scaleMatrix(1.2, 1.2, 1.2));
    this.renderer.drawShape(body, bodyMatrix);

    let headMatrix = this.renderer.translateMatrix(baseX, baseY + 0.5, baseZ);
    headMatrix = this.renderer.multiplyMatrices(headMatrix, this.renderer.scaleMatrix(1.1, 1.1, 1.1));
    this.renderer.drawShape(head, headMatrix);

    const eyeOffsetX = isPlayer ? 0.12 : -0.12;

    let leftEyeMatrix = this.renderer.translateMatrix(baseX - 0.12 + eyeOffsetX * 0.5, baseY + 0.55, baseZ + 0.3);
    this.renderer.drawShape(eyeWhite, leftEyeMatrix);

    let rightEyeMatrix = this.renderer.translateMatrix(baseX + 0.12 + eyeOffsetX * 0.5, baseY + 0.55, baseZ + 0.3);
    this.renderer.drawShape(eyeWhite, rightEyeMatrix);

    let leftPupilMatrix = this.renderer.translateMatrix(baseX - 0.1 + eyeOffsetX, baseY + 0.55, baseZ + 0.35);
    this.renderer.drawShape(eyeBlack, leftPupilMatrix);

    let rightPupilMatrix = this.renderer.translateMatrix(baseX + 0.14 + eyeOffsetX, baseY + 0.55, baseZ + 0.35);
    this.renderer.drawShape(eyeBlack, rightPupilMatrix);

    if (pokemon.shape === 'pikachu' || pokemon.shape === 'raichu') {
      const ear = new Cone(this.renderer, secondaryColor, 0.12, 0.35, 8);

      let leftEarMatrix = this.renderer.translateMatrix(baseX - 0.2, baseY + 0.8, baseZ);
      leftEarMatrix = this.renderer.multiplyMatrices(leftEarMatrix, this.renderer.rotateZMatrix(-0.4));
      this.renderer.drawShape(ear, leftEarMatrix);

      let rightEarMatrix = this.renderer.translateMatrix(baseX + 0.2, baseY + 0.8, baseZ);
      rightEarMatrix = this.renderer.multiplyMatrices(rightEarMatrix, this.renderer.rotateZMatrix(0.4));
      this.renderer.drawShape(ear, rightEarMatrix);
    }
  }

  renderTeamSidebar(): void {
    if (!this.battleSystem) return;

    const state = this.battleSystem.getBattleState();

    this.renderPlayerTeamList(state.playerTeam);
    this.renderEnemyTeamList(state.enemyTeam);
  }

  renderPlayerTeamList(playerTeam: BattleState['playerTeam']): void {
    if (!this.playerTeamList) return;

    this.playerTeamList.innerHTML = '';

    playerTeam.forEach((pokemon, index) => {
      if (pokemon.isActive) return;

      const card = document.createElement('div');
      card.className = `team-pokemon-small ${pokemon.isFainted ? 'fainted' : ''}`;
      card.dataset.index = index.toString();

      const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
      const hpColor = hpPercent <= 20 ? 'critical' : hpPercent <= 50 ? 'low' : '';

      card.innerHTML = `
        <div class="team-name">${pokemon.name}</div>
        <div class="team-hp">
          <div class="team-hp-bar">
            <div class="team-hp-fill ${hpColor}" style="width: ${hpPercent}%"></div>
          </div>
          <div class="team-hp-text">${pokemon.currentHp}/${pokemon.maxHp}</div>
        </div>
      `;

      if (!pokemon.isFainted) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          if (this.isSwitchModalOpen || this.isBackpackModalOpen || this.isBattleProcessing || !this.battleSystem?.isPlayerTurn) return;
          if (!this.battleSystem?.canPlayerSwitch()) return;
          this.quickSwitchPokemon(index);
        });
      }

      this.playerTeamList?.appendChild(card);
    });
  }

  renderEnemyTeamList(enemyTeam: BattleState['enemyTeam']): void {
    if (!this.enemyTeamList) return;

    this.enemyTeamList.innerHTML = '';

    enemyTeam.forEach((pokemon, index) => {
      if (pokemon.isActive) return;

      const card = document.createElement('div');
      card.className = `team-pokemon-small ${pokemon.isFainted ? 'fainted' : ''}`;

      const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
      const hpColor = hpPercent <= 20 ? 'critical' : hpPercent <= 50 ? 'low' : '';

      card.innerHTML = `
        <div class="team-name">${pokemon.name}</div>
        <div class="team-hp">
          <div class="team-hp-bar">
            <div class="team-hp-fill ${hpColor}" style="width: ${hpPercent}%"></div>
          </div>
          <div class="team-hp-text">${pokemon.currentHp}/${pokemon.maxHp}</div>
        </div>
      `;

      this.enemyTeamList?.appendChild(card);
    });
  }

  openSwitchModal(isForced: boolean): void {
    if (!this.battleSystem || !this.switchOptions) return;

    this.isForcedSwitch = isForced;

    const state = this.battleSystem.getBattleState();
    this.switchOptions.innerHTML = '';

    if (isForced) {
      if (this.switchModalTitle) {
        this.switchModalTitle.textContent = `${this.playerPokemon?.name} 倒下了！请选择下一只宝可梦`;
      }
      if (this.cancelSwitchBtn) {
        this.cancelSwitchBtn.style.display = 'none';
      }
    } else {
      if (this.switchModalTitle) {
        this.switchModalTitle.textContent = '选择要切换的宝可梦';
      }
      if (this.cancelSwitchBtn) {
        this.cancelSwitchBtn.style.display = 'block';
      }
    }

    state.playerTeam.forEach((pokemon, index) => {
      if (pokemon.isActive || pokemon.isFainted) return;

      const option = document.createElement('div');
      option.className = 'switch-option';
      option.dataset.index = index.toString();

      const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
      const hpColor = hpPercent <= 20 ? 'critical' : hpPercent <= 50 ? 'low' : '';

      option.innerHTML = `
        <div class="switch-option-name">${pokemon.name}</div>
        <div class="switch-option-hp">
          <div class="switch-hp-bar-bg">
            <div class="switch-hp-bar-fill ${hpColor}" style="width: ${hpPercent}%"></div>
          </div>
          <div class="switch-hp-text">${pokemon.currentHp}/${pokemon.maxHp}</div>
        </div>
      `;

      option.addEventListener('click', () => {
        this.executePlayerSwitch(index);
      });

      this.switchOptions?.appendChild(option);
    });

    if (this.switchModal) {
      this.switchModal.style.display = 'block';
    }
    this.isSwitchModalOpen = true;
    this.disableMoveButtons();
  }

  closeSwitchModal(): void {
    if (this.switchModal) {
      this.switchModal.style.display = 'none';
    }
    this.isSwitchModalOpen = false;
    this.isForcedSwitch = false;
    this.enableMoveButtons();
  }

  openBackpackModal(): void {
    if (!this.battleSystem || !this.backpackItemsModal) return;

    const state = this.battleSystem.getBattleState();
    this.backpackItemsModal.innerHTML = '';

    const items = Object.values(state.playerBackpack);

    if (items.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.textContent = '背包是空的！';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#666';
      emptyMsg.style.gridColumn = '1 / -1';
      emptyMsg.style.padding = '20px';
      this.backpackItemsModal.appendChild(emptyMsg);
    } else {
      items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'backpack-item-modal';
        itemElement.dataset.itemId = item.id;

        itemElement.innerHTML = `
          <div class="backpack-item-modal-icon">${item.icon}</div>
          <div class="backpack-item-modal-name">${item.name}</div>
          <div class="backpack-item-modal-desc">${item.description}</div>
          <div class="backpack-item-modal-quantity">×${item.quantity}</div>
        `;

        itemElement.addEventListener('click', () => {
          this.executeUseItem(item.id);
        });

        this.backpackItemsModal?.appendChild(itemElement);
      });
    }

    if (this.backpackModal) {
      this.backpackModal.style.display = 'block';
    }
    this.isBackpackModalOpen = true;
    this.disableMoveButtons();
  }

  closeBackpackModal(): void {
    if (this.backpackModal) {
      this.backpackModal.style.display = 'none';
    }
    this.isBackpackModalOpen = false;
    this.enableMoveButtons();
  }

  quickSwitchPokemon(newIndex: number): void {
    if (!this.battleSystem || !this.battleSystem.isPlayerTurn) return;
    if (this.isBattleProcessing) return;
    if (!this.battleSystem.canPlayerSwitch()) return;

    this.isBattleProcessing = true;
    this.disableMoveButtons();

    const result = this.battleSystem.playerSwitchPokemon(newIndex);

    if (result.success) {
      this.activePlayerIndex = newIndex;
      if (this.battleMessage) {
        this.battleMessage.textContent = result.message;
      }
      this.updateUI();

      setTimeout(() => {
        if (this.battleMessage && this.enemyPokemon) {
          this.battleMessage.textContent = `轮到 ${this.enemyPokemon.name} 行动！`;
        }
        setTimeout(() => this.executeEnemyTurn(), 1000);
      }, 1500);
    } else {
      if (this.battleMessage) {
        this.battleMessage.textContent = result.message;
      }
      this.isBattleProcessing = false;
      this.enableMoveButtons();
    }
  }

  executePlayerSwitch(newIndex: number): void {
    this.closeSwitchModal();
    this.quickSwitchPokemon(newIndex);
  }

  executeUseItem(itemId: string): void {
    this.closeBackpackModal();

    if (!this.battleSystem || this.battleSystem.battleOver || !this.battleSystem.isPlayerTurn || this.isBattleProcessing) return;

    this.isBattleProcessing = true;
    this.disableMoveButtons();

    const result = this.battleSystem.useItem(itemId);

    if (result.success) {
      if (this.battleMessage) {
        this.battleMessage.textContent = result.message;
      }

      if (result.damage && result.damage > 0) {
        this.shakeEnemy();
      }

      this.updateUI();

      setTimeout(() => {
        if (this.battleSystem?.battleOver) {
          this.endBattle();
        } else {
          if (this.battleMessage && this.enemyPokemon) {
            this.battleMessage.textContent = `轮到 ${this.enemyPokemon.name} 行动！`;
          }
          setTimeout(() => this.executeEnemyTurn(), 1000);
        }
      }, 1500);
    } else {
      if (this.battleMessage) {
        this.battleMessage.textContent = result.message;
      }
      this.isBattleProcessing = false;
      this.enableMoveButtons();
    }
  }

  executePlayerMove(moveIndex: number): void {
    if (!this.battleSystem || this.battleSystem.battleOver || !this.battleSystem.isPlayerTurn || this.isBattleProcessing) return;

    const move = this.playerPokemon?.moves[moveIndex];
    if (!move || move.currentPp <= 0) {
      if (this.battleMessage) {
        this.battleMessage.textContent = `${move ? move.name : '该招式'} 的PP已用尽！`;
      }
      return;
    }

    this.isBattleProcessing = true;
    this.disableMoveButtons();
    if (this.switchPokemonBtn) {
      this.switchPokemonBtn.disabled = true;
    }

    const result = this.battleSystem.playerTurn(moveIndex);

    if (result) {
      if (this.battleMessage) {
        this.battleMessage.textContent = result.message;
      }

      if (!result.missed && result.damage > 0) {
        this.shakeEnemy();
      }

      this.updateUI();

      setTimeout(() => {
        if (this.battleSystem?.battleOver) {
          this.endBattle();
        } else {
          if (this.battleMessage && this.enemyPokemon) {
            this.battleMessage.textContent = `轮到 ${this.enemyPokemon.name} 行动！`;
          }
          setTimeout(() => this.executeEnemyTurn(), 1000);
        }
      }, 1500);
    }
  }

  executeEnemyTurn(): void {
    if (!this.battleSystem || this.battleSystem.battleOver || this.battleSystem.isPlayerTurn) return;

    const result = this.battleSystem.enemyTurn();

    if (result) {
      if (this.battleMessage) {
        this.battleMessage.textContent = result.message;
      }

      if ('isSwitch' in result && result.isSwitch) {
        this.activeEnemyIndex = this.battleSystem.activeEnemyIndex;
      } else if ('missed' in result && !result.missed && result.damage > 0) {
        this.shakePlayer();
      }

      this.updateUI();

      setTimeout(() => {
        if (this.battleSystem?.battleOver) {
          this.endBattle();
        } else if (this.playerPokemon?.isFainted()) {
          const availableIndices = this.battleSystem?.getPlayerAvailableIndices();
          if (availableIndices && availableIndices.length > 0) {
            if (this.battleMessage && this.playerPokemon) {
              this.battleMessage.textContent = `${this.playerPokemon.name} 倒下了！请选择下一只宝可梦！`;
            }
            this.openSwitchModal(true);
            this.isBattleProcessing = false;
          } else {
            this.endBattle();
          }
        } else {
          if (this.battleMessage && this.playerPokemon) {
            this.battleMessage.textContent = `轮到 ${this.playerPokemon.name} 行动！`;
          }
          this.isBattleProcessing = false;
          this.enableMoveButtons();
          this.updateSwitchButton();
        }
      }, 1500);
    }
  }

  shakePlayer(): void {
    this.playerShake.x = (Math.random() - 0.5) * 0.2;
    this.playerShake.y = (Math.random() - 0.5) * 0.2;
    this.playerShake.z = (Math.random() - 0.5) * 0.2;
  }

  shakeEnemy(): void {
    this.enemyShake.x = (Math.random() - 0.5) * 0.2;
    this.enemyShake.y = (Math.random() - 0.5) * 0.2;
    this.enemyShake.z = (Math.random() - 0.5) * 0.2;
  }

  updateUI(): void {
    if (!this.battleSystem) return;

    const state = this.battleSystem.getBattleState();

    this.activePlayerIndex = state.activePlayerIndex;
    this.activeEnemyIndex = state.activeEnemyIndex;

    if (this.playerActiveName) {
      this.playerActiveName.textContent = state.playerPokemon.name;
    }
    if (this.enemyActiveName) {
      this.enemyActiveName.textContent = state.enemyPokemon.name;
    }

    const playerHpPercent = (state.playerPokemon.currentHp / state.playerPokemon.maxHp) * 100;
    const enemyHpPercent = (state.enemyPokemon.currentHp / state.enemyPokemon.maxHp) * 100;

    if (this.playerActiveHpBar) {
      this.playerActiveHpBar.style.width = `${playerHpPercent}%`;
    }
    if (this.enemyActiveHpBar) {
      this.enemyActiveHpBar.style.width = `${enemyHpPercent}%`;
    }

    if (this.playerActiveHpText) {
      this.playerActiveHpText.textContent = `${state.playerPokemon.currentHp}/${state.playerPokemon.maxHp}`;
    }
    if (this.enemyActiveHpText) {
      this.enemyActiveHpText.textContent = `${state.enemyPokemon.currentHp}/${state.enemyPokemon.maxHp}`;
    }

    this.updateSmallHpBarColor(this.playerActiveHpBar, playerHpPercent);
    this.updateSmallHpBarColor(this.enemyActiveHpBar, enemyHpPercent);

    state.playerPokemon.moves?.forEach((move, index) => {
      if (index < this.moveButtons.length) {
        const button = this.moveButtons[index];
        button.textContent = `${move.name} (${move.currentPp}/${move.maxPp})`;
        button.style.backgroundColor = this.getTypeColor(move.type);
        button.disabled = move.currentPp <= 0;
      }
    });

    this.renderTeamSidebar();
    this.updateSwitchButton();
    this.updateBackpackButton();
  }

  updateBackpackButton(): void {
    if (!this.backpackBtn || !this.battleSystem) {
      if (this.backpackBtn) {
        this.backpackBtn.disabled = true;
      }
      return;
    }

    const state = this.battleSystem.getBattleState();
    const hasItems = Object.keys(state.playerBackpack).length > 0;
    this.backpackBtn.disabled = !hasItems || !this.battleSystem.isPlayerTurn || this.isBattleProcessing;

    if (this.backpackBtn.disabled) {
      this.backpackBtn.classList.add('disabled');
    } else {
      this.backpackBtn.classList.remove('disabled');
    }
  }

  updateSwitchButton(): void {
    if (!this.switchPokemonBtn || !this.battleSystem) {
      if (this.switchPokemonBtn) {
        this.switchPokemonBtn.disabled = true;
      }
      return;
    }

    const canSwitch = this.battleSystem.canPlayerSwitch();
    this.switchPokemonBtn.disabled = !canSwitch;

    if (canSwitch) {
      this.switchPokemonBtn.classList.remove('disabled');
    } else {
      this.switchPokemonBtn.classList.add('disabled');
    }
  }

  updateSmallHpBarColor(hpBar: HTMLDivElement | null, percent: number): void {
    if (!hpBar) return;

    hpBar.classList.remove('low', 'critical');

    if (percent <= 20) {
      hpBar.classList.add('critical');
    } else if (percent <= 50) {
      hpBar.classList.add('low');
    }
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    return colors[type] || colors.normal;
  }

  disableMoveButtons(): void {
    this.moveButtons.forEach(button => {
      button.disabled = true;
    });
    if (this.switchPokemonBtn) {
      this.switchPokemonBtn.disabled = true;
    }
    if (this.backpackBtn) {
      this.backpackBtn.disabled = true;
    }
  }

  enableMoveButtons(): void {
    if (!this.battleSystem) return;

    const state = this.battleSystem.getBattleState();
    state.playerPokemon.moves?.forEach((move, index) => {
      if (index < this.moveButtons.length) {
        this.moveButtons[index].disabled = move.currentPp <= 0;
      }
    });
    this.updateSwitchButton();
    this.updateBackpackButton();
  }

  endBattle(): void {
    this.disableMoveButtons();

    if (this.battleSystem?.winner === 'player') {
      if (this.battleMessage) {
        this.battleMessage.textContent = `恭喜！你赢得了战斗！`;
      }
    } else {
      if (this.battleMessage) {
        this.battleMessage.textContent = `很遗憾，你输掉了战斗...`;
      }
    }

    setTimeout(() => {
      if (this.battleSystem && this.playerPokemon && this.enemyPokemon) {
        this.game.showResultPage(
          this.battleSystem.winner === 'player',
          this.playerPokemon,
          this.enemyPokemon,
          this.battleSystem.turn
        );
      }
    }, 2000);
  }

  show(): void {
    const selectionPage = document.getElementById('selection-page');
    const battlePage = document.getElementById('battle-page');
    const resultPage = document.getElementById('result-page');

    if (selectionPage) selectionPage.classList.remove('active');
    if (battlePage) battlePage.classList.add('active');
    if (resultPage) resultPage.classList.remove('active');
  }

  hide(): void {
    const battlePage = document.getElementById('battle-page');
    if (battlePage) battlePage.classList.remove('active');

    this.is3DAnimating = false;
    this.isBattleProcessing = false;
    this.isSwitchModalOpen = false;
    this.isForcedSwitch = false;
    this.isBackpackModalOpen = false;
    this.battleSystem = null;

    if (this.switchModal) {
      this.switchModal.style.display = 'none';
    }
    if (this.backpackModal) {
      this.backpackModal.style.display = 'none';
    }
  }
}