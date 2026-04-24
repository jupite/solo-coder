class SelectionPage {
    constructor(game) {
        this.game = game;
        this.selectedPokemonIds = [];
        this.maxSelection = 3;
        this.cardRenderers = {};
        this.initialMoney = 1000; // 初始资金
        this.money = this.initialMoney;
        this.backpack = []; // 背包
        
        this.init();
    }

    init() {
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

    renderPokemonList() {
        const allPokemon = getAllPokemonData();
        
        this.pokemonList.innerHTML = '';
        
        allPokemon.forEach(pokemon => {
            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.dataset.pokemonId = pokemon.id;
            
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

    renderItemsList() {
        if (!this.itemsList) return;
        
        const allItems = Items.getAllItems();
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

    getTypeName(type) {
        const typeNames = {
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

    buyItem(item) {
        if (this.money >= item.price) {
            this.money -= item.price;
            this.backpack.push({ ...item, quantity: 1 });
            this.updateMoneyDisplay();
            this.updateBackpackDisplay();
        } else {
            alert('资金不足！');
        }
    }

    updateMoneyDisplay() {
        if (this.moneyDisplay) {
            this.moneyDisplay.textContent = `资金: ${this.money}`;
        }
    }

    updateBackpackDisplay() {
        if (!this.backpackList) return;
        
        this.backpackList.innerHTML = '';
        
        if (this.backpack.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = '背包为空';
            this.backpackList.appendChild(emptyMessage);
            return;
        }
        
        // 按道具类型分组
        const groupedItems = this.backpack.reduce((acc, item) => {
            if (!acc[item.id]) {
                acc[item.id] = { ...item, quantity: 0 };
            }
            acc[item.id].quantity += 1;
            return acc;
        }, {});
        
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
        
        // 绑定事件
        this.bindBackpackEvents();
    }

    bindBackpackEvents() {
        // 增加道具数量
        document.querySelectorAll('.increase-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                this.increaseItemQuantity(itemId);
            });
        });
        
        // 减少道具数量
        document.querySelectorAll('.decrease-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                this.decreaseItemQuantity(itemId);
            });
        });
        
        // 删除道具
        document.querySelectorAll('.delete-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                this.deleteItem(itemId);
            });
        });
    }

    increaseItemQuantity(itemId) {
        const item = Items.getItemById(itemId);
        if (item && this.money >= item.price) {
            this.money -= item.price;
            this.backpack.push({ ...item, quantity: 1 });
            this.updateMoneyDisplay();
            this.updateBackpackDisplay();
        } else {
            alert('资金不足！');
        }
    }

    decreaseItemQuantity(itemId) {
        const itemIndex = this.backpack.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            const item = this.backpack[itemIndex];
            this.money += item.price;
            this.backpack.splice(itemIndex, 1);
            this.updateMoneyDisplay();
            this.updateBackpackDisplay();
        }
    }

    deleteItem(itemId) {
        const itemCount = this.backpack.filter(item => item.id === itemId).length;
        const item = Items.getItemById(itemId);
        if (item) {
            this.money += item.price * itemCount;
            this.backpack = this.backpack.filter(item => item.id !== itemId);
            this.updateMoneyDisplay();
            this.updateBackpackDisplay();
        }
    }

    renderPokemonCard(pokemon, canvas) {
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

    renderPokemon3D(renderer, pokemon, time, offsetY = 0) {
        const gl = renderer.gl;
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

    renderPokemon2D(canvas, pokemon) {
        const ctx = canvas.getContext('2d');
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

    drawPokemonShape(renderer, pokemon, time, offsetY) {
        const model = getPokemonModel(pokemon.shape);
        const color = pokemon.color;
        const secondaryColor = pokemon.secondaryColor || color;
        const elements = model.elements;
        
        const bobY = Math.sin(time * 2) * 0.05;
        const rotateY = Math.sin(time * 0.5) * 0.2;
        const baseY = offsetY + bobY;
        
        if (elements.body) {
            this.renderPokemonElement(renderer, elements.body, 0, baseY, 0, color, secondaryColor, rotateY);
        }
        
        if (elements.head) {
            const headPos = elements.head.position || { x: 0, y: 0, z: 0 };
            this.renderPokemonElement(renderer, elements.head, headPos.x, baseY + headPos.y, headPos.z, color, secondaryColor, rotateY);
        }
        
        if (elements.ears && elements.ears.length > 0) {
            elements.ears.forEach(ear => {
                const earPos = ear.position || { x: 0, y: 0, z: 0 };
                const earRot = ear.rotation || { x: 0, y: 0, z: 0 };
                const earColor = ear.useSecondaryColor ? secondaryColor : color;
                this.renderPokemonElementWithRotation(renderer, ear, earPos.x, baseY + earPos.y, earPos.z, earColor, earRot, rotateY);
            });
        }
        
        if (elements.earTips && elements.earTips.length > 0) {
            elements.earTips.forEach(ear => {
                const earPos = ear.position || { x: 0, y: 0, z: 0 };
                const earColor = ear.color || secondaryColor;
                this.renderPokemonElement(renderer, ear, earPos.x, baseY + earPos.y, earPos.z, earColor, secondaryColor, rotateY);
            });
        }
        
        if (elements.tail) {
            if (Array.isArray(elements.tail)) {
                elements.tail.forEach(tail => {
                    const tailPos = tail.position || { x: 0, y: 0, z: 0 };
                    const tailRot = tail.rotation || { x: 0, y: 0, z: 0 };
                    const tailColor = tail.color || secondaryColor;
                    this.renderPokemonElementWithRotation(renderer, tail, tailPos.x, baseY + tailPos.y, tailPos.z, tailColor, tailRot, rotateY);
                });
            } else {
                const tailPos = elements.tail.position || { x: 0, y: 0, z: 0 };
                const tailRot = elements.tail.rotation || { x: 0, y: 0, z: 0 };
                const tailColor = elements.tail.color || secondaryColor;
                this.renderPokemonElementWithRotation(renderer, elements.tail, tailPos.x, baseY + tailPos.y, tailPos.z, tailColor, tailRot, rotateY);
            }
        }
        
        if (elements.tailBase) {
            const tailBasePos = elements.tailBase.position || { x: 0, y: 0, z: 0 };
            const tailBaseRot = elements.tailBase.rotation || { x: 0, y: 0, z: 0 };
            this.renderPokemonElementWithRotation(renderer, elements.tailBase, tailBasePos.x, baseY + tailBasePos.y, tailBasePos.z, color, tailBaseRot, rotateY);
        }
        
        if (elements.legs && elements.legs.length > 0) {
            elements.legs.forEach(leg => {
                const legPos = leg.position || { x: 0, y: 0, z: 0 };
                const legColor = leg.useSecondaryColor ? secondaryColor : color;
                this.renderPokemonElement(renderer, leg, legPos.x, baseY + legPos.y, legPos.z, legColor, secondaryColor, rotateY);
            });
        }
        
        if (elements.arms && elements.arms.length > 0) {
            elements.arms.forEach(arm => {
                const armPos = arm.position || { x: 0, y: 0, z: 0 };
                const armRot = arm.rotation || { x: 0, y: 0, z: 0 };
                const armColor = arm.useSecondaryColor ? secondaryColor : color;
                this.renderPokemonElementWithRotation(renderer, arm, armPos.x, baseY + armPos.y, armPos.z, armColor, armRot, rotateY);
            });
        }
        
        if (elements.eyes && elements.eyes.length > 0) {
            elements.eyes.forEach(eye => {
                const eyePos = eye.position || { x: 0, y: 0, z: 0 };
                const eyeColor = eye.color || [1.0, 1.0, 1.0, 1.0];
                this.renderPokemonElement(renderer, eye, eyePos.x, baseY + eyePos.y, eyePos.z, eyeColor, secondaryColor, rotateY);
            });
        }
        
        if (elements.cheeks && elements.cheeks.length > 0) {
            elements.cheeks.forEach(cheek => {
                const cheekPos = cheek.position || { x: 0, y: 0, z: 0 };
                const cheekColor = cheek.color || secondaryColor;
                this.renderPokemonElement(renderer, cheek, cheekPos.x, baseY + cheekPos.y, cheekPos.z, cheekColor, secondaryColor, rotateY);
            });
        }
        
        if (elements.wings && elements.wings.length > 0) {
            elements.wings.forEach(wing => {
                const wingPos = wing.position || { x: 0, y: 0, z: 0 };
                const wingRot = wing.rotation || { x: 0, y: 0, z: 0 };
                const wingColor = wing.useSecondaryColor ? secondaryColor : color;
                this.renderPokemonElementWithRotation(renderer, wing, wingPos.x, baseY + wingPos.y, wingPos.z, wingColor, wingRot, rotateY);
            });
        }
        
        if (elements.belly) {
            const bellyPos = elements.belly.position || { x: 0, y: 0, z: 0 };
            const bellyColor = elements.belly.useSecondaryColor ? secondaryColor : color;
            this.renderPokemonElement(renderer, elements.belly, bellyPos.x, baseY + bellyPos.y, bellyPos.z, bellyColor, secondaryColor, rotateY);
        }
        
        if (elements.horns && elements.horns.length > 0) {
            elements.horns.forEach(horn => {
                const hornPos = horn.position || { x: 0, y: 0, z: 0 };
                const hornRot = horn.rotation || { x: 0, y: 0, z: 0 };
                this.renderPokemonElementWithRotation(renderer, horn, hornPos.x, baseY + hornPos.y, hornPos.z, color, hornRot, rotateY);
            });
        }
        
        if (elements.snout) {
            const snoutPos = elements.snout.position || { x: 0, y: 0, z: 0 };
            const snoutRot = elements.snout.rotation || { x: 0, y: 0, z: 0 };
            const snoutColor = elements.snout.useSecondaryColor ? secondaryColor : color;
            this.renderPokemonElementWithRotation(renderer, elements.snout, snoutPos.x, baseY + snoutPos.y, snoutPos.z, snoutColor, snoutRot, rotateY);
        }
        
        if (elements.beak) {
            const beakPos = elements.beak.position || { x: 0, y: 0, z: 0 };
            const beakRot = elements.beak.rotation || { x: 0, y: 0, z: 0 };
            const beakColor = elements.beak.color || secondaryColor;
            this.renderPokemonElementWithRotation(renderer, elements.beak, beakPos.x, baseY + beakPos.y, beakPos.z, beakColor, beakRot, rotateY);
        }
        
        if (elements.bulb) {
            const bulbPos = elements.bulb.position || { x: 0, y: 0, z: 0 };
            this.renderPokemonElement(renderer, elements.bulb, bulbPos.x, baseY + bulbPos.y, bulbPos.z, color, secondaryColor, rotateY);
        }
        
        if (elements.spots && elements.spots.length > 0) {
            elements.spots.forEach(spot => {
                const spotPos = spot.position || { x: 0, y: 0, z: 0 };
                const spotColor = spot.useSecondaryColor ? secondaryColor : color;
                this.renderPokemonElement(renderer, spot, spotPos.x, baseY + spotPos.y, spotPos.z, spotColor, secondaryColor, rotateY);
            });
        }
        
        if (elements.fangs && elements.fangs.length > 0) {
            elements.fangs.forEach(fang => {
                const fangPos = fang.position || { x: 0, y: 0, z: 0 };
                const fangRot = fang.rotation || { x: 0, y: 0, z: 0 };
                const fangColor = fang.color || [1.0, 1.0, 1.0, 1.0];
                this.renderPokemonElementWithRotation(renderer, fang, fangPos.x, baseY + fangPos.y, fangPos.z, fangColor, fangRot, rotateY);
            });
        }
        
        if (elements.hair && elements.hair.length > 0) {
            elements.hair.forEach(hair => {
                const hairPos = hair.position || { x: 0, y: 0, z: 0 };
                const hairRot = hair.rotation || { x: 0, y: 0, z: 0 };
                this.renderPokemonElementWithRotation(renderer, hair, hairPos.x, baseY + hairPos.y, hairPos.z, color, hairRot, rotateY);
            });
        }
        
        if (elements.mouth) {
            const mouthPos = elements.mouth.position || { x: 0, y: 0, z: 0 };
            const mouthColor = elements.mouth.color || secondaryColor;
            this.renderPokemonElement(renderer, elements.mouth, mouthPos.x, baseY + mouthPos.y, mouthPos.z, mouthColor, secondaryColor, rotateY);
        }
        
        if (elements.shell) {
            const shellPos = elements.shell.position || { x: 0, y: 0, z: 0 };
            const shellColor = elements.shell.useSecondaryColor ? secondaryColor : color;
            this.renderPokemonElement(renderer, elements.shell, shellPos.x, baseY + shellPos.y, shellPos.z, shellColor, secondaryColor, rotateY);
        }
    }

    renderPokemonElement(renderer, element, x, y, z, color, secondaryColor, baseRotateY) {
        let shape;
        const elementColor = element.color || color;
        const scale = element.scale || 0.3;
        
        switch (element.type) {
            case 'sphere':
                shape = new Sphere(renderer, elementColor, scale, 12);
                break;
            case 'ellipsoid':
                shape = new Ellipsoid(renderer, elementColor, 
                    scale.x || 0.5, scale.y || 0.5, scale.z || 0.5, 12);
                break;
            case 'cone':
                shape = new Cone(renderer, elementColor, 
                    scale.radius || 0.1, scale.height || 0.3, 8);
                break;
            case 'cylinder':
                shape = new Cylinder(renderer, elementColor, 
                    scale.radius || 0.1, scale.height || 0.3, 8);
                break;
            case 'lightning':
                shape = new LightningTail(renderer, elementColor, scale || 1.0);
                break;
            case 'flame':
                shape = new Flame(renderer, elementColor, scale || 1.0, 8);
                break;
            case 'wing':
                shape = new Wing(renderer, elementColor, scale || 1.0, 8);
                break;
            case 'shell':
                shape = new Shell(renderer, elementColor, scale || 1.0, 8);
                break;
            case 'plantBulb':
                shape = new PlantBulb(renderer, color, secondaryColor, scale || 1.0, 8);
                break;
            default:
                shape = new Sphere(renderer, elementColor, 0.3, 12);
        }
        
        let matrix = renderer.translateMatrix(x, y, z);
        if (baseRotateY !== 0) {
            matrix = renderer.multiplyMatrices(matrix, renderer.rotateYMatrix(baseRotateY));
        }
        renderer.drawShape(shape, matrix);
    }

    renderPokemonElementWithRotation(renderer, element, x, y, z, color, rotation, baseRotateY) {
        let shape;
        const elementColor = element.color || color;
        const scale = element.scale || 0.3;
        
        switch (element.type) {
            case 'sphere':
                shape = new Sphere(renderer, elementColor, scale, 12);
                break;
            case 'ellipsoid':
                shape = new Ellipsoid(renderer, elementColor, 
                    scale.x || 0.5, scale.y || 0.5, scale.z || 0.5, 12);
                break;
            case 'cone':
                shape = new Cone(renderer, elementColor, 
                    scale.radius || 0.1, scale.height || 0.3, 8);
                break;
            case 'cylinder':
                shape = new Cylinder(renderer, elementColor, 
                    scale.radius || 0.1, scale.height || 0.3, 8);
                break;
            case 'lightning':
                shape = new LightningTail(renderer, elementColor, scale || 1.0);
                break;
            case 'flame':
                shape = new Flame(renderer, elementColor, scale || 1.0, 8);
                break;
            case 'wing':
                shape = new Wing(renderer, elementColor, scale || 1.0, 8);
                break;
            case 'shell':
                shape = new Shell(renderer, elementColor, scale || 1.0, 8);
                break;
            default:
                shape = new Sphere(renderer, elementColor, 0.3, 12);
        }
        
        let matrix = renderer.translateMatrix(x, y, z);
        const rot = rotation || { x: 0, y: 0, z: 0 };
        if (rot.z !== 0) {
            matrix = renderer.multiplyMatrices(matrix, renderer.rotateZMatrix(rot.z));
        }
        if (rot.x !== 0) {
            matrix = renderer.multiplyMatrices(matrix, renderer.rotateXMatrix(rot.x));
        }
        if (rot.y !== 0) {
            matrix = renderer.multiplyMatrices(matrix, renderer.rotateYMatrix(rot.y));
        }
        if (baseRotateY !== 0) {
            matrix = renderer.multiplyMatrices(matrix, renderer.rotateYMatrix(baseRotateY));
        }
        renderer.drawShape(shape, matrix);
    }

    bindEvents() {
        this.pokemonList.addEventListener('click', (e) => {
            const card = e.target.closest('.pokemon-card');
            if (card) {
                const pokemonId = parseInt(card.dataset.pokemonId);
                this.togglePokemonSelection(pokemonId);
            }
        });
        
        this.startBattleBtn.addEventListener('click', () => {
            if (this.selectedPokemonIds.length === this.maxSelection) {
                const enemyPokemonIds = this.generateRandomEnemies();
                this.game.startBattle(this.selectedPokemonIds, enemyPokemonIds, this.backpack);
            }
        });
        
        if (this.clearBackpackBtn) {
            this.clearBackpackBtn.addEventListener('click', () => {
                this.clearBackpack();
            });
        }
    }

    clearBackpack() {
        if (this.backpack.length > 0) {
            // 计算所有道具的总价值并返还资金
            const totalValue = this.backpack.reduce((total, item) => {
                return total + item.price;
            }, 0);
            this.money += totalValue;
            this.backpack = [];
            this.updateMoneyDisplay();
            this.updateBackpackDisplay();
        }
    }

    togglePokemonSelection(pokemonId) {
        const index = this.selectedPokemonIds.indexOf(pokemonId);
        
        if (index !== -1) {
            this.selectedPokemonIds.splice(index, 1);
        } else if (this.selectedPokemonIds.length < this.maxSelection) {
            this.selectedPokemonIds.push(pokemonId);
        }
        
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        document.querySelectorAll('.pokemon-card').forEach(card => {
            const id = parseInt(card.dataset.pokemonId);
            if (this.selectedPokemonIds.includes(id)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
        
        this.startBattleBtn.disabled = this.selectedPokemonIds.length !== this.maxSelection;
        this.updateSelectedPokemonInfo();
    }

    generateRandomEnemies() {
        const allPokemon = getAllPokemonData();
        const enemies = [];
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

    updateSelectedPokemonInfo() {
        if (this.selectedPokemonIds.length === 0) {
            this.selectedPokemonInfo.style.display = 'none';
            return;
        }
        
        let infoHTML = `<h3>已选择 ${this.selectedPokemonIds.length}/${this.maxSelection} 只宝可梦</h3>`;
        infoHTML += '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
        
        this.selectedPokemonIds.forEach(pokemonId => {
            const pokemonData = getAllPokemonData().find(p => p.id === pokemonId);
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
        this.selectedPokemonStats.innerHTML = '';
        this.selectedPokemonInfo.style.display = 'block';
    }

    createMiniStatsHTML(pokemon) {
        return `
            <p style="margin: 3px 0; font-size: 0.9em;"><strong>HP:</strong> ${pokemon.maxHp}</p>
            <p style="margin: 3px 0; font-size: 0.9em;"><strong>攻击:</strong> ${pokemon.stats.attack}</p>
            <p style="margin: 3px 0; font-size: 0.9em;"><strong>防御:</strong> ${pokemon.stats.defense}</p>
            <p style="margin: 3px 0; font-size: 0.9em;"><strong>速度:</strong> ${pokemon.stats.speed}</p>
        `;
    }

    createStatsHTML(pokemon) {
        return `
            <p><strong>等级:</strong> ${pokemon.level}</p>
            <p><strong>HP:</strong> ${pokemon.maxHp}</p>
            <p><strong>攻击:</strong> ${pokemon.stats.attack}</p>
            <p><strong>防御:</strong> ${pokemon.stats.defense}</p>
            <p><strong>特攻:</strong> ${pokemon.stats.specialAttack}</p>
            <p><strong>特防:</strong> ${pokemon.stats.specialDefense}</p>
            <p><strong>速度:</strong> ${pokemon.stats.speed}</p>
            <p><strong>属性:</strong> ${pokemon.types.map(t => this.getTypeName(t)).join(' / ')}</p>
        `;
    }

    show() {
        document.getElementById('selection-page').classList.add('active');
        document.getElementById('battle-page').classList.remove('active');
        document.getElementById('result-page').classList.remove('active');
        
        this.selectedPokemonIds = [];
        this.updateSelectionUI();
        
        document.querySelectorAll('.pokemon-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    hide() {
        document.getElementById('selection-page').classList.remove('active');
    }
}
