import { WebGLRenderer } from '../webgl/renderer';
import { Sphere, Ellipsoid, Cone, Cylinder, LightningTail, Flame, Wing, Shell, PlantBulb } from '../webgl/shapes';
import { getPokemonModel, ModelElement } from '../webgl/pokemon-models';
import { PokemonDataList, Pokemon } from '../pokemon/pokemon';
import { getAllItems, getItemById } from '../game/items';
import { PokemonType, ItemData } from '../types';

export interface Game {
    startBattle: (playerPokemonIds: number[], enemyPokemonIds: number[], backpack: ItemData[]) => void;
}

export class SelectionPage {
    game: Game;
    selectedPokemonIds: number[] = [];
    maxSelection = 3;
    cardRenderers: Record<number, WebGLRenderer> = {};
    initialMoney = 1000;
    money = this.initialMoney;
    backpack: ItemData[] = [];
    
    pokemonList: HTMLElement | null = null;
    startBattleBtn: HTMLElement | null = null;
    selectedPokemonInfo: HTMLElement | null = null;
    selectedPokemonName: HTMLElement | null = null;
    selectedPokemonStats: HTMLElement | null = null;
    moneyDisplay: HTMLElement | null = null;
    itemsList: HTMLElement | null = null;
    backpackList: HTMLElement | null = null;
    clearBackpackBtn: HTMLElement | null = null;

    constructor(game: Game) {
        this.game = game;
        this.init();
    }

    init(): void {
        this.pokemonList = document.getElementById('pokemon-list');
        this.startBattleBtn = document.getElementById('start-battle');
        this.selectedPokemonInfo = document.getElementById('selected-pokemon-info');
        this.selectedPokemonName = document.getElementById('selected-pokemon-name');
        this.selectedPokemonStats = document.getElementById('selected-pokemon-stats');
        this.moneyDisplay = document.getElementById('money-display');
        this.itemsList = document.getElementById('items-list');
        this.backpackList = document.getElementById('backpack-list');
        this.clearBackpackBtn = document.getElementById('clear-backpack-btn');
        
        this.renderPokemonList();
        this.renderItemsList();
        this.bindEvents();
        this.updateSelectionUI();
        this.updateMoneyDisplay();
        this.updateBackpackDisplay();
    }

    renderPokemonList(): void {
        if (!this.pokemonList) return;
        
        this.pokemonList.innerHTML = '';
        
        PokemonDataList.forEach(pokemon => {
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
            
            this.pokemonList.appendChild(card);
            
            setTimeout(() => {
                this.renderPokemonCard(pokemon, canvas);
            }, 10);
        });
    }

    renderItemsList(): void {
        if (!this.itemsList) return;
        
        const allItems = getAllItems();
        this.itemsList.innerHTML = '';
        
        allItems.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            
            const itemName = document.createElement('h4');
            itemName.textContent = item.name;
            
            const itemDescription = document.createElement('p');
            itemDescription.textContent = item.description;
            
            const itemPrice = document.createElement('div');
            itemPrice.className = 'item-price';
            itemPrice.textContent = `价格: ${item.price}`;
            
            const buyButton = document.createElement('button');
            buyButton.className = 'buy-btn';
            buyButton.textContent = '购买';
            buyButton.addEventListener('click', () => {
                this.buyItem(item);
            });
            
            itemCard.appendChild(itemName);
            itemCard.appendChild(itemDescription);
            itemCard.appendChild(itemPrice);
            itemCard.appendChild(buyButton);
            
            this.itemsList.appendChild(itemCard);
        });
    }

    getTypeName(type: PokemonType): string {
        const typeNames: Record<PokemonType, string> = {
            [PokemonType.NORMAL]: '一般',
            [PokemonType.FIRE]: '火',
            [PokemonType.WATER]: '水',
            [PokemonType.ELECTRIC]: '电',
            [PokemonType.GRASS]: '草',
            [PokemonType.ICE]: '冰',
            [PokemonType.FIGHTING]: '格斗',
            [PokemonType.POISON]: '毒',
            [PokemonType.GROUND]: '地面',
            [PokemonType.FLYING]: '飞行',
            [PokemonType.PSYCHIC]: '超能力',
            [PokemonType.BUG]: '虫',
            [PokemonType.ROCK]: '岩石',
            [PokemonType.GHOST]: '幽灵',
            [PokemonType.DRAGON]: '龙',
            [PokemonType.DARK]: '恶',
            [PokemonType.STEEL]: '钢',
            [PokemonType.FAIRY]: '妖精'
        };
        return typeNames[type] || type;
    }

    buyItem(item: ItemData): void {
        if (this.money >= item.price) {
            this.money -= item.price;
            this.backpack.push({ ...item });
            this.updateMoneyDisplay();
            this.updateBackpackDisplay();
        } else {
            alert('资金不足！');
        }
    }

    updateMoneyDisplay(): void {
        if (this.moneyDisplay) {
            this.moneyDisplay.textContent = `资金: ${this.money}`;
        }
    }

    updateBackpackDisplay(): void {
        if (!this.backpackList) return;
        
        this.backpackList.innerHTML = '';
        
        if (this.backpack.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = '背包为空';
            this.backpackList.appendChild(emptyMessage);
            return;
        }
        
        const groupedItems = this.backpack.reduce((acc, item) => {
            if (!acc[item.id]) {
                acc[item.id] = { ...item, quantity: 0 };
            }
            acc[item.id].quantity += 1;
            return acc;
        }, {} as Record<string, ItemData & { quantity: number }>);
        
        Object.values(groupedItems).forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'backpack-item';
            
            itemElement.innerHTML = `
                <div class="backpack-item-header">
                    <div class="backpack-item-name">${item.name}</div>
                    <button class="delete-item-btn" data-item-id="${item.id}">删除</button>
                </div>
                <div class="backpack-item-description">${item.description}</div>
                <div class="backpack-item-quantity-control">
                    <button class="decrease-item-btn" data-item-id="${item.id}">-</button>
                    <span class="item-quantity">数量: ${item.quantity}</span>
                    <button class="increase-item-btn" data-item-id="${item.id}">+</button>
                </div>
            `;
            
            this.backpackList.appendChild(itemElement);
        });
        
        this.bindBackpackEvents();
    }

    bindBackpackEvents(): void {
        document.querySelectorAll('.increase-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const itemId = target?.dataset.itemId;
                if (itemId) this.increaseItemQuantity(itemId);
            });
        });
        
        document.querySelectorAll('.decrease-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const itemId = target?.dataset.itemId;
                if (itemId) this.decreaseItemQuantity(itemId);
            });
        });
        
        document.querySelectorAll('.delete-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const itemId = target?.dataset.itemId;
                if (itemId) this.deleteItem(itemId);
            });
        });
    }

    increaseItemQuantity(itemId: string): void {
        const item = getItemById(itemId);
        if (item && this.money >= item.price) {
            this.money -= item.price;
            this.backpack.push({ ...item });
            this.updateMoneyDisplay();
            this.updateBackpackDisplay();
        } else {
            alert('资金不足！');
        }
    }

    decreaseItemQuantity(itemId: string): void {
        const itemIndex = this.backpack.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            const item = this.backpack[itemIndex];
            this.money += item.price;
            this.backpack.splice(itemIndex, 1);
            this.updateMoneyDisplay();
            this.updateBackpackDisplay();
        }
    }

    deleteItem(itemId: string): void {
        const itemCount = this.backpack.filter(item => item.id === itemId).length;
        const item = getItemById(itemId);
        if (item) {
            this.money += item.price * itemCount;
            this.backpack = this.backpack.filter(item => item.id !== itemId);
            this.updateMoneyDisplay();
            this.updateBackpackDisplay();
        }
    }

    renderPokemonCard(pokemon: typeof PokemonDataList[0], canvas: HTMLCanvasElement): void {
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

    renderPokemon3D(renderer: WebGLRenderer, pokemon: typeof PokemonDataList[0], time: number, offsetY: number): void {
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

    renderPokemon2D(canvas: HTMLCanvasElement, pokemon: typeof PokemonDataList[0]): void {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, '#e8f0fe');
        gradient.addColorStop(1, '#d4e4ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        ctx.save();
        ctx.translate(width/2, height/2);
        
        const color = pokemon.color;
        const secondaryColor = pokemon.secondaryColor || color;
        
        ctx.fillStyle = `rgb(${Math.floor(color[0]*255)}, ${Math.floor(color[1]*255)}, ${Math.floor(color[2]*255)})`;
        ctx.beginPath();
        ctx.arc(0, 0, 35, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgb(${Math.floor(secondaryColor[0]*255)}, ${Math.floor(secondaryColor[1]*255)}, ${Math.floor(secondaryColor[2]*255)})`;
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

    drawPokemonShape(renderer: WebGLRenderer, pokemon: typeof PokemonDataList[0], time: number, offsetY: number): void {
        const model = getPokemonModel(pokemon.shape);
        const color = pokemon.color;
        const secondaryColor = pokemon.secondaryColor || color;
        const elements = model.elements;
        
        const bobY = Math.sin(time * 2) * 0.05;
        const rotateY = Math.sin(time * 0.5) * 0.2;
        const baseY = offsetY + bobY;
        
        this.renderElements(renderer, elements, baseY, color, secondaryColor, rotateY);
    }

    renderElements(renderer: WebGLRenderer, elements: Record<string, ModelElement | ModelElement[]>, baseY: number, color: number[], secondaryColor: number[], rotateY: number): void {
        for (const [key, element] of Object.entries(elements)) {
            const elems: ModelElement[] = Array.isArray(element) ? element : [element];
            
            for (const elem of elems) {
                const pos = elem.position || { x: 0, y: 0, z: 0 };
                const rot = elem.rotation || { x: 0, y: 0, z: 0 };
                const elemColor = elem.color || (elem.useSecondaryColor ? secondaryColor : color);
                
                if (rot.x !== 0 || rot.y !== 0 || rot.z !== 0) {
                    this.renderElementWithRotation(renderer, elem, pos.x, baseY + pos.y, pos.z, elemColor, rot, rotateY);
                } else {
                    this.renderElement(renderer, elem, pos.x, baseY + pos.y, pos.z, elemColor, secondaryColor, rotateY);
                }
            }
        }
    }

    renderElement(renderer: WebGLRenderer, element: ModelElement, x: number, y: number, z: number, color: number[], secondaryColor: number[], baseRotateY: number): void {
        const shape = this.createShape(renderer, element, color, secondaryColor);
        let matrix = renderer.translateMatrix(x, y, z);
        if (baseRotateY !== 0) {
            matrix = renderer.multiplyMatrices(matrix, renderer.rotateYMatrix(baseRotateY));
        }
        renderer.drawShape(shape, matrix);
    }

    renderElementWithRotation(renderer: WebGLRenderer, element: ModelElement, x: number, y: number, z: number, color: number[], rotation: { x?: number; y?: number; z?: number }, baseRotateY: number): void {
        const shape = this.createShape(renderer, element, color, color);
        let matrix = renderer.translateMatrix(x, y, z);
        const rot = rotation || { x: 0, y: 0, z: 0 };
        if (rot.z !== 0) matrix = renderer.multiplyMatrices(matrix, renderer.rotateZMatrix(rot.z));
        if (rot.x !== 0) matrix = renderer.multiplyMatrices(matrix, renderer.rotateXMatrix(rot.x));
        if (rot.y !== 0) matrix = renderer.multiplyMatrices(matrix, renderer.rotateYMatrix(rot.y));
        if (baseRotateY !== 0) matrix = renderer.multiplyMatrices(matrix, renderer.rotateYMatrix(baseRotateY));
        renderer.drawShape(shape, matrix);
    }

    createShape(renderer: WebGLRenderer, element: ModelElement, color: number[], secondaryColor: number[]): { positionBuffer: WebGLBuffer; colorBuffer: WebGLBuffer; normalBuffer: WebGLBuffer; indexBuffer: WebGLBuffer; vertexCount: number } {
        const scale = element.scale;
        
        switch (element.type) {
            case 'sphere':
                return new Sphere(renderer, color, typeof scale === 'number' ? scale : 0.3, 12);
            case 'ellipsoid':
                const eScale = scale as { x?: number; y?: number; z?: number } || {};
                return new Ellipsoid(renderer, color, eScale.x || 0.5, eScale.y || 0.5, eScale.z || 0.5, 12);
            case 'cone':
                const cScale = scale as { radius?: number; height?: number } || {};
                return new Cone(renderer, color, cScale.radius || 0.1, cScale.height || 0.3, 8);
            case 'cylinder':
                const cyScale = scale as { radius?: number; height?: number } || {};
                return new Cylinder(renderer, color, cyScale.radius || 0.1, cyScale.height || 0.3, 8);
            case 'lightning':
                return new LightningTail(renderer, color, typeof scale === 'number' ? scale : 1.0);
            case 'flame':
                return new Flame(renderer, color, typeof scale === 'number' ? scale : 1.0, 8);
            case 'wing':
                return new Wing(renderer, color, typeof scale === 'number' ? scale : 1.0, 8);
            case 'shell':
                return new Shell(renderer, color, typeof scale === 'number' ? scale : 1.0, 8);
            case 'plantBulb':
                return new PlantBulb(renderer, color, secondaryColor, typeof scale === 'number' ? scale : 1.0, 8);
            default:
                return new Sphere(renderer, color, 0.3, 12);
        }
    }

    bindEvents(): void {
        if (this.pokemonList) {
            this.pokemonList.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const card = target?.closest('.pokemon-card') as HTMLElement;
                if (card) {
                    const pokemonId = parseInt(card.dataset.pokemonId || '');
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
        
        if (this.clearBackpackBtn) {
            this.clearBackpackBtn.addEventListener('click', () => {
                this.clearBackpack();
            });
        }
    }

    clearBackpack(): void {
        if (this.backpack.length > 0) {
            const totalValue = this.backpack.reduce((total, item) => total + item.price, 0);
            this.money += totalValue;
            this.backpack = [];
            this.updateMoneyDisplay();
            this.updateBackpackDisplay();
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
            const cardEl = card as HTMLElement;
            const id = parseInt(cardEl.dataset.pokemonId || '');
            if (this.selectedPokemonIds.includes(id)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
        
        if (this.startBattleBtn) {
            (this.startBattleBtn as HTMLButtonElement).disabled = this.selectedPokemonIds.length !== this.maxSelection;
        }
        this.updateSelectedPokemonInfo();
    }

    generateRandomEnemies(): number[] {
        const availableIds = PokemonDataList.filter(p => !this.selectedPokemonIds.includes(p.id)).map(p => p.id);
        const enemies: number[] = [];
        
        while (enemies.length < this.maxSelection && availableIds.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableIds.length);
            enemies.push(availableIds[randomIndex]);
            availableIds.splice(randomIndex, 1);
        }
        
        if (enemies.length < this.maxSelection) {
            const fallbackIds = PokemonDataList.map(p => p.id);
            while (enemies.length < this.maxSelection) {
                const randomIndex = Math.floor(Math.random() * fallbackIds.length);
                enemies.push(fallbackIds[randomIndex]);
            }
        }
        
        return enemies;
    }

    updateSelectedPokemonInfo(): void {
        if (!this.selectedPokemonInfo || !this.selectedPokemonName) return;
        
        if (this.selectedPokemonIds.length === 0) {
            this.selectedPokemonInfo.style.display = 'none';
            return;
        }
        
        let infoHTML = `<h3>已选择 ${this.selectedPokemonIds.length}/${this.maxSelection} 只宝可梦</h3>`;
        infoHTML += '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
        
        this.selectedPokemonIds.forEach(pokemonId => {
            const pokemonData = PokemonDataList.find(p => p.id === pokemonId);
            if (pokemonData) {
                const pokemon = new Pokemon(pokemonData, 50);
                infoHTML += `
                    <div style="text-align: left; padding: 10px; background: #f0f0f0; border-radius: 8px;">
                        <h4 style="margin-bottom: 5px; color: #667eea;">${pokemon.name}</h4>
                        ${this.createMiniStatsHTML(pokemon)}
                    </div>
                `;
            }
        });
        
        infoHTML += '</div>';
        
        this.selectedPokemonName.innerHTML = infoHTML;
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
        document.getElementById('selection-page')?.classList.add('active');
        document.getElementById('battle-page')?.classList.remove('active');
        document.getElementById('result-page')?.classList.remove('active');
        
        this.selectedPokemonIds = [];
        this.updateSelectionUI();
        
        document.querySelectorAll('.pokemon-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    hide(): void {
        document.getElementById('selection-page')?.classList.remove('active');
    }
}