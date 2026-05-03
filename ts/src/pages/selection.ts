import type { PokemonDataType, Item, Pokemon } from '../types';
import { getAllPokemonData, createPokemon } from '../pokemon/pokemon';
import { getAllItems, getItemData } from '../pokemon/items';
import { WebGLRenderer } from '../webgl/renderer';
import { Sphere, Cone } from '../webgl/shapes';
import type { PokemonGame } from '../app';

export class SelectionPage {
  game: PokemonGame;
  selectedPokemonIds: number[];
  maxSelection: number;
  cardRenderers: { [key: number]: WebGLRenderer };
  money: number;
  backpack: Record<string, Item>;

  pokemonList: HTMLDivElement | null;
  startBattleBtn: HTMLButtonElement | null;
  selectedPokemonInfo: HTMLDivElement | null;
  selectedPokemonName: HTMLDivElement | null;
  selectedPokemonStats: HTMLDivElement | null;
  moneyDisplay: HTMLSpanElement | null;
  itemsShop: HTMLDivElement | null;
  backpackItems: HTMLDivElement | null;

  constructor(game: PokemonGame) {
    this.game = game;
    this.selectedPokemonIds = [];
    this.maxSelection = 3;
    this.cardRenderers = {};
    this.money = 500;
    this.backpack = {};

    this.pokemonList = null;
    this.startBattleBtn = null;
    this.selectedPokemonInfo = null;
    this.selectedPokemonName = null;
    this.selectedPokemonStats = null;
    this.moneyDisplay = null;
    this.itemsShop = null;
    this.backpackItems = null;

    this.init();
  }

  init(): void {
    this.pokemonList = document.getElementById('pokemon-list') as HTMLDivElement | null;
    this.startBattleBtn = document.getElementById('start-battle') as HTMLButtonElement | null;
    this.selectedPokemonInfo = document.getElementById('selected-pokemon-info') as HTMLDivElement | null;
    this.selectedPokemonName = document.getElementById('selected-pokemon-name') as HTMLDivElement | null;
    this.selectedPokemonStats = document.getElementById('selected-pokemon-stats') as HTMLDivElement | null;
    this.moneyDisplay = document.getElementById('player-money') as HTMLSpanElement | null;
    this.itemsShop = document.getElementById('items-shop') as HTMLDivElement | null;
    this.backpackItems = document.getElementById('backpack-items') as HTMLDivElement | null;

    this.renderItemsShop();
    this.renderBackpack();
    this.renderPokemonList();
    this.bindEvents();
    this.updateSelectionUI();
    this.updateMoneyDisplay();
  }

  updateMoneyDisplay(): void {
    if (this.moneyDisplay) {
      this.moneyDisplay.textContent = this.money.toString();
    }
  }

  renderItemsShop(): void {
    if (!this.itemsShop) return;

    const allItems = getAllItems();
    this.itemsShop.innerHTML = '';

    allItems.forEach(item => {
      const card = document.createElement('div');
      card.className = `item-card ${this.money < item.price ? 'disabled' : ''}`;
      card.dataset.itemId = item.id;

      const maxBuyable = Math.floor(this.money / item.price);

      card.innerHTML = `
        <div class="item-icon">${item.icon}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
        <div class="item-price">💰 ${item.price}</div>
        <div class="item-quantity-control">
          <button class="quantity-btn quantity-minus" data-item-id="${item.id}">-</button>
          <span class="quantity-display" data-item-id="${item.id}">1</span>
          <button class="quantity-btn quantity-plus" data-item-id="${item.id}">+</button>
        </div>
        <button class="buy-btn" data-item-id="${item.id}" ${maxBuyable <= 0 ? 'disabled' : ''}>购买</button>
      `;

      this.itemsShop?.appendChild(card);
    });

    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const itemId = target.dataset.itemId;
        if (!itemId) return;

        const item = getItemData(itemId);
        if (!item) return;

        const display = document.querySelector(`.quantity-display[data-item-id="${itemId}"]`) as HTMLSpanElement;
        if (!display) return;

        const currentQty = parseInt(display.textContent || '1');
        const maxBuyable = Math.floor(this.money / item.price);

        if (target.classList.contains('quantity-plus') && currentQty < maxBuyable) {
          display.textContent = (currentQty + 1).toString();
        } else if (target.classList.contains('quantity-minus') && currentQty > 1) {
          display.textContent = (currentQty - 1).toString();
        }
      });
    });

    document.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const itemId = target.dataset.itemId;
        if (!itemId) return;

        const display = document.querySelector(`.quantity-display[data-item-id="${itemId}"]`) as HTMLSpanElement;
        if (!display) return;

        const quantity = parseInt(display.textContent || '1');
        this.buyItem(itemId, quantity);
        display.textContent = '1';
      });
    });
  }

  buyItem(itemId: string, quantity: number = 1): void {
    const item = getItemData(itemId);
    if (!item) return;

    const totalCost = item.price * quantity;
    if (this.money < totalCost) return;

    this.money -= totalCost;

    if (!this.backpack[itemId]) {
      this.backpack[itemId] = { ...item, quantity: 0 };
    }
    this.backpack[itemId].quantity += quantity;

    this.updateMoneyDisplay();
    this.renderItemsShop();
    this.renderBackpack();
  }

  renderBackpack(): void {
    if (!this.backpackItems) return;

    this.backpackItems.innerHTML = '';

    const items = Object.values(this.backpack);

    if (items.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.textContent = '背包是空的，去商店买些道具吧！';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#666';
      emptyMsg.style.gridColumn = '1 / -1';
      this.backpackItems.appendChild(emptyMsg);
      return;
    }

    items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'backpack-item';

      itemElement.innerHTML = `
        <div class="backpack-item-icon">${item.icon}</div>
        <div class="backpack-item-name">${item.name}</div>
        <div class="backpack-item-quantity-control">
          <button class="backpack-minus-btn" data-item-id="${item.id}">-</button>
          <span>×${item.quantity}</span>
          <button class="backpack-plus-btn" data-item-id="${item.id}">+</button>
        </div>
        <div class="backpack-item-refund">💰${item.price}/个</div>
      `;

      this.backpackItems?.appendChild(itemElement);
    });

    document.querySelectorAll('.backpack-minus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const itemId = target.dataset.itemId;
        if (!itemId) return;

        this.sellItem(itemId, 1);
      });
    });

    document.querySelectorAll('.backpack-plus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const itemId = target.dataset.itemId;
        if (!itemId) return;

        this.buyItem(itemId, 1);
      });
    });
  }

  sellItem(itemId: string, quantity: number = 1): void {
    if (!this.backpack[itemId] || this.backpack[itemId].quantity < quantity) return;

    const item = this.backpack[itemId];
    const refundAmount = item.price * quantity;

    this.money += refundAmount;
    this.backpack[itemId].quantity -= quantity;

    if (this.backpack[itemId].quantity <= 0) {
      delete this.backpack[itemId];
    }

    this.updateMoneyDisplay();
    this.renderItemsShop();
    this.renderBackpack();
  }

  renderPokemonList(): void {
    if (!this.pokemonList) return;

    const allPokemon = getAllPokemonData();

    this.pokemonList.innerHTML = '';

    allPokemon.forEach(pokemon => {
      const card = document.createElement('div');
      card.className = 'pokemon-card';
      card.dataset.pokemonId = pokemon.id.toString();

      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      canvas.className = 'pokemon-preview-canvas';

      const name = document.createElement('h3');
      name.textContent = pokemon.name;

      const types = document.createElement('div');
      types.className = 'pokemon-types';
      pokemon.types.forEach(type => {
        const typeSpan = document.createElement('span');
        typeSpan.className = `pokemon-type type-${type}`;
        typeSpan.textContent = this.getTypeName(type);
        types.appendChild(typeSpan);
      });

      card.appendChild(canvas);
      card.appendChild(name);
      card.appendChild(types);

      this.pokemonList?.appendChild(card);

      setTimeout(() => {
        this.renderPokemonCard(pokemon, canvas);
      }, 10);
    });
  }

  getTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      normal: '一般',
      fire: '火',
      water: '水',
      electric: '电',
      grass: '草',
      ice: '冰',
      fighting: '格斗',
      poison: '毒',
      ground: '地面',
      flying: '飞行',
      psychic: '超能力',
      bug: '虫',
      rock: '岩石',
      ghost: '幽灵',
      dragon: '龙',
      dark: '恶',
      steel: '钢',
      fairy: '妖精'
    };
    return typeNames[type] || type;
  }

  renderPokemonCard(pokemon: PokemonDataType, canvas: HTMLCanvasElement): void {
    try {
      const renderer = new WebGLRenderer(canvas);
      this.cardRenderers[pokemon.id] = renderer;

      this.renderPokemon3D(renderer, pokemon, 0, 0);

      const animate = () => {
        if (!canvas.isConnected) return;

        this.renderPokemon3D(renderer, pokemon, Date.now() * 0.001, 0);
        requestAnimationFrame(animate);
      };
      animate();
    } catch (e) {
      console.error('无法创建 WebGL 上下文:', e);
      this.renderPokemon2D(canvas, pokemon);
    }
  }

  renderPokemon3D(renderer: WebGLRenderer, pokemon: PokemonDataType, time: number, offsetY: number = 0): void {
    const canvas = renderer.canvas;

    renderer.clear(0.9, 0.9, 0.95, 1.0);
    renderer.setViewport(canvas.width, canvas.height);
    renderer.useProgram();

    const aspect = canvas.width / canvas.height;
    renderer.projectionMatrix = renderer.perspectiveMatrix(Math.PI / 4, aspect, 0.1, 100);
    renderer.modelViewMatrix = renderer.lookAt([0, 0, 3], [0, offsetY, 0], [0, 1, 0]);

    renderer.setLighting(
      [5, 5, 5],
      [1.0, 1.0, 1.0],
      0.3,
      0.6,
      0.3,
      32
    );

    this.drawPokemonShape(renderer, pokemon, time, offsetY);
  }

  renderPokemon2D(canvas: HTMLCanvasElement, pokemon: PokemonDataType): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, '#e8f0fe');
    gradient.addColorStop(1, '#d4e4ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);

    const color = pokemon.color;
    const secondaryColor = pokemon.secondaryColor || color;

    ctx.fillStyle = `rgb(${Math.floor(color[0] * 255)}, ${Math.floor(color[1] * 255)}, ${Math.floor(color[2] * 255)})`;
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgb(${Math.floor(secondaryColor[0] * 255)}, ${Math.floor(secondaryColor[1] * 255)}, ${Math.floor(secondaryColor[2] * 255)})`;
    ctx.beginPath();
    ctx.arc(-15, -25, 15, 0, Math.PI * 2);
    ctx.arc(15, -25, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-12, -5, 8, 0, Math.PI * 2);
    ctx.arc(12, -5, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-10, -5, 4, 0, Math.PI * 2);
    ctx.arc(14, -5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 5, 10, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  drawPokemonShape(renderer: WebGLRenderer, pokemon: PokemonDataType, time: number, offsetY: number): void {
    const color = pokemon.color;
    const secondaryColor = pokemon.secondaryColor || color;

    const body = new Sphere(renderer, color, 0.6, 16);
    const head = new Sphere(renderer, color, 0.45, 16);

    const eyeWhite = new Sphere(renderer, [1.0, 1.0, 1.0, 1.0], 0.12, 8);
    const eyeBlack = new Sphere(renderer, [0.0, 0.0, 0.0, 1.0], 0.06, 8);

    const rotateY = Math.sin(time * 0.5) * 0.2;
    const bobY = Math.sin(time * 2) * 0.05;

    let bodyMatrix = renderer.translateMatrix(0, offsetY + bobY, 0);
    bodyMatrix = renderer.multiplyMatrices(bodyMatrix, renderer.rotateYMatrix(rotateY));
    renderer.drawShape(body, bodyMatrix);

    let headMatrix = renderer.translateMatrix(0, offsetY + bobY + 0.6, 0);
    headMatrix = renderer.multiplyMatrices(headMatrix, renderer.rotateYMatrix(rotateY));
    renderer.drawShape(head, headMatrix);

    let leftEyeMatrix = renderer.translateMatrix(-0.15, offsetY + bobY + 0.65, 0.4);
    leftEyeMatrix = renderer.multiplyMatrices(leftEyeMatrix, renderer.rotateYMatrix(rotateY));
    renderer.drawShape(eyeWhite, leftEyeMatrix);

    let rightEyeMatrix = renderer.translateMatrix(0.15, offsetY + bobY + 0.65, 0.4);
    rightEyeMatrix = renderer.multiplyMatrices(rightEyeMatrix, renderer.rotateYMatrix(rotateY));
    renderer.drawShape(eyeWhite, rightEyeMatrix);

    let leftPupilMatrix = renderer.translateMatrix(-0.12, offsetY + bobY + 0.65, 0.48);
    leftPupilMatrix = renderer.multiplyMatrices(leftPupilMatrix, renderer.rotateYMatrix(rotateY));
    renderer.drawShape(eyeBlack, leftPupilMatrix);

    let rightPupilMatrix = renderer.translateMatrix(0.18, offsetY + bobY + 0.65, 0.48);
    rightPupilMatrix = renderer.multiplyMatrices(rightPupilMatrix, renderer.rotateYMatrix(rotateY));
    renderer.drawShape(eyeBlack, rightPupilMatrix);

    if (pokemon.shape === 'pikachu' || pokemon.shape === 'raichu') {
      const ear = new Cone(renderer, secondaryColor, 0.15, 0.4, 8);

      let leftEarMatrix = renderer.translateMatrix(-0.25, offsetY + bobY + 0.9, 0);
      leftEarMatrix = renderer.multiplyMatrices(leftEarMatrix, renderer.rotateZMatrix(-0.3));
      leftEarMatrix = renderer.multiplyMatrices(leftEarMatrix, renderer.rotateYMatrix(rotateY));
      renderer.drawShape(ear, leftEarMatrix);

      let rightEarMatrix = renderer.translateMatrix(0.25, offsetY + bobY + 0.9, 0);
      rightEarMatrix = renderer.multiplyMatrices(rightEarMatrix, renderer.rotateZMatrix(0.3));
      rightEarMatrix = renderer.multiplyMatrices(rightEarMatrix, renderer.rotateYMatrix(rotateY));
      renderer.drawShape(ear, rightEarMatrix);
    }
  }

  bindEvents(): void {
    if (this.pokemonList) {
      this.pokemonList.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const card = target.closest('.pokemon-card') as HTMLElement;
        if (card) {
          const pokemonId = parseInt(card.dataset.pokemonId || '0');
          this.togglePokemonSelection(pokemonId);
        }
      });
    }

    if (this.startBattleBtn) {
      this.startBattleBtn.addEventListener('click', () => {
        if (this.selectedPokemonIds.length === this.maxSelection) {
          const enemyPokemonIds = this.generateRandomEnemies();
          this.game.startBattle(this.selectedPokemonIds, enemyPokemonIds, this.backpack);
        }
      });
    }
  }

  togglePokemonSelection(pokemonId: number): void {
    const index = this.selectedPokemonIds.indexOf(pokemonId);

    if (index !== -1) {
      this.selectedPokemonIds.splice(index, 1);
    } else if (this.selectedPokemonIds.length < this.maxSelection) {
      this.selectedPokemonIds.push(pokemonId);
    }

    this.updateSelectionUI();
  }

  updateSelectionUI(): void {
    document.querySelectorAll('.pokemon-card').forEach(card => {
      const id = parseInt((card as HTMLElement).dataset.pokemonId || '0');
      if (this.selectedPokemonIds.includes(id)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    if (this.startBattleBtn) {
      this.startBattleBtn.disabled = this.selectedPokemonIds.length !== this.maxSelection;
    }
    this.updateSelectedPokemonInfo();
  }

  generateRandomEnemies(): number[] {
    const allPokemon = getAllPokemonData();
    const enemies: number[] = [];
    const availableIds = allPokemon.filter(p => !this.selectedPokemonIds.includes(p.id)).map(p => p.id);

    while (enemies.length < this.maxSelection && availableIds.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableIds.length);
      enemies.push(availableIds[randomIndex]);
      availableIds.splice(randomIndex, 1);
    }

    if (enemies.length < this.maxSelection) {
      const fallbackIds = allPokemon.map(p => p.id);
      while (enemies.length < this.maxSelection) {
        const randomIndex = Math.floor(Math.random() * fallbackIds.length);
        enemies.push(fallbackIds[randomIndex]);
      }
    }

    return enemies;
  }

  updateSelectedPokemonInfo(): void {
    if (!this.selectedPokemonInfo) return;

    if (this.selectedPokemonIds.length === 0) {
      this.selectedPokemonInfo.style.display = 'none';
      return;
    }

    let infoHTML = `<h3>已选择 ${this.selectedPokemonIds.length}/${this.maxSelection} 只宝可梦</h3>`;
    infoHTML += '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';

    this.selectedPokemonIds.forEach(pokemonId => {
      const pokemonData = getAllPokemonData().find(p => p.id === pokemonId);
      if (pokemonData) {
        const pokemon = createPokemon(pokemonId, 50);
        infoHTML += `
          <div style="text-align: left; padding: 10px; background: #f0f0f0; border-radius: 8px;">
            <h4 style="margin-bottom: 5px; color: #667eea;">${pokemon.name}</h4>
            ${this.createMiniStatsHTML(pokemon)}
          </div>
        `;
      }
    });

    infoHTML += '</div>';

    if (this.selectedPokemonName) {
      this.selectedPokemonName.innerHTML = infoHTML;
    }
    if (this.selectedPokemonStats) {
      this.selectedPokemonStats.innerHTML = '';
    }
    this.selectedPokemonInfo.style.display = 'block';
  }

  createMiniStatsHTML(pokemon: Pokemon): string {
    return `
      <p style="margin: 3px 0; font-size: 0.9em;"><strong>HP:</strong> ${pokemon.maxHp}</p>
      <p style="margin: 3px 0; font-size: 0.9em;"><strong>攻击:</strong> ${pokemon.stats.attack}</p>
      <p style="margin: 3px 0; font-size: 0.9em;"><strong>防御:</strong> ${pokemon.stats.defense}</p>
      <p style="margin: 3px 0; font-size: 0.9em;"><strong>速度:</strong> ${pokemon.stats.speed}</p>
    `;
  }

  show(): void {
    const selectionPage = document.getElementById('selection-page');
    const battlePage = document.getElementById('battle-page');
    const resultPage = document.getElementById('result-page');

    if (selectionPage) selectionPage.classList.add('active');
    if (battlePage) battlePage.classList.remove('active');
    if (resultPage) resultPage.classList.remove('active');

    this.selectedPokemonIds = [];
    this.money = 500;
    this.backpack = {};
    this.updateSelectionUI();
    this.updateMoneyDisplay();
    this.renderItemsShop();
    this.renderBackpack();

    document.querySelectorAll('.pokemon-card').forEach(card => {
      card.classList.remove('selected');
    });
  }

  hide(): void {
    const selectionPage = document.getElementById('selection-page');
    if (selectionPage) selectionPage.classList.remove('active');
  }

  getPlayerBackpack(): Record<string, Item> {
    return this.backpack;
  }
}