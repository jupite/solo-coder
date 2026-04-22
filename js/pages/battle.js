class BattlePage {
    constructor(game) {
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
        this.playerActiveRenderer = null;
        this.enemyActiveRenderer = null;
        this.currentBackground = 'grassland';
        
        this.init();
    }

    get playerPokemon() {
        if (!this.battleSystem) return null;
        return this.battleSystem.playerPokemon;
    }

    get enemyPokemon() {
        if (!this.battleSystem) return null;
        return this.battleSystem.enemyPokemon;
    }

    init() {
        this.battleCanvas = document.getElementById('battle-canvas');
        this.playerActiveCanvas = document.getElementById('player-active-canvas');
        this.enemyActiveCanvas = document.getElementById('enemy-active-canvas');
        this.playerActiveName = document.getElementById('player-active-name');
        this.enemyActiveName = document.getElementById('enemy-active-name');
        this.playerActiveHpBar = document.getElementById('player-active-hp-bar');
        this.enemyActiveHpBar = document.getElementById('enemy-active-hp-bar');
        this.playerActiveHpText = document.getElementById('player-active-hp-text');
        this.enemyActiveHpText = document.getElementById('enemy-active-hp-text');
        this.moveButtons = document.querySelectorAll('.move-btn');
        this.battleMessage = document.getElementById('battle-message');
        this.playerTeamList = document.getElementById('player-team-list');
        this.enemyTeamList = document.getElementById('enemy-team-list');
        this.switchPokemonBtn = document.getElementById('switch-pokemon-btn');
        this.switchModal = document.getElementById('switch-modal');
        this.switchModalTitle = document.getElementById('switch-modal-title');
        this.switchOptions = document.getElementById('switch-options');
        this.cancelSwitchBtn = document.getElementById('cancel-switch-btn');
        
        this.bindEvents();
    }

    bindEvents() {
        this.moveButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (this.isBattleProcessing || !this.battleSystem || !this.battleSystem.isPlayerTurn) return;
                if (this.isSwitchModalOpen) return;
                
                const moveIndex = parseInt(e.target.dataset.move);
                this.executePlayerMove(moveIndex);
            });
        });
        
        this.switchPokemonBtn.addEventListener('click', () => {
            if (this.isBattleProcessing || !this.battleSystem || !this.battleSystem.isPlayerTurn) return;
            if (!this.battleSystem.canPlayerSwitch()) return;
            
            this.openSwitchModal(false);
        });
        
        this.cancelSwitchBtn.addEventListener('click', () => {
            if (this.isForcedSwitch) return;
            this.closeSwitchModal();
        });
    }

    startBattle(playerPokemonIds, enemyPokemonIds) {
        const ai = new PokemonAI('medium');
        this.battleSystem = new BattleSystem(playerPokemonIds, enemyPokemonIds, ai);
        
        this.currentBackground = getRandomBackground();
        
        this.updateUI();
        this.initRenderer();
        this.initSideRenderers();
        
        if (this.battleSystem.isPlayerTurn) {
            this.battleMessage.textContent = `轮到 ${this.playerPokemon.name} 行动！`;
        } else {
            this.battleMessage.textContent = `轮到 ${this.enemyPokemon.name} 行动！`;
            setTimeout(() => this.executeEnemyTurn(), 1000);
        }
        
        this.startAnimation();
    }

    initRenderer() {
        try {
            this.renderer = new WebGLRenderer(this.battleCanvas);
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        } catch (e) {
            console.error('无法创建 WebGL 上下文:', e);
        }
    }

    initSideRenderers() {
        try {
            this.playerActiveRenderer = new WebGLRenderer(this.playerActiveCanvas);
            this.enemyActiveRenderer = new WebGLRenderer(this.enemyActiveCanvas);
        } catch (e) {
            console.error('无法创建侧边栏 WebGL 上下文:', e);
        }
    }

    resizeCanvas() {
        if (!this.renderer) return;
        
        const container = this.battleCanvas.parentElement;
        const width = container.clientWidth;
        const height = 500;
        
        this.renderer.resize(width, height);
    }

    startAnimation() {
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

    renderSidePokemon() {
        if (this.playerActiveRenderer && this.playerPokemon) {
            this.renderMiniPokemon(this.playerActiveRenderer, this.playerPokemon, true);
        }
        if (this.enemyActiveRenderer && this.enemyPokemon) {
            this.renderMiniPokemon(this.enemyActiveRenderer, this.enemyPokemon, false);
        }
    }

    renderMiniPokemon(renderer, pokemon, isPlayer) {
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

    drawMiniPokemonShape(renderer, pokemon, time, isPlayer) {
        const model = getPokemonModel(pokemon.shape);
        const color = pokemon.color;
        const secondaryColor = pokemon.secondaryColor || color;
        const elements = model.elements;
        
        const bobY = Math.sin(time * 2) * 0.03;
        const baseY = bobY;
        const scaleFactor = 0.75;
        
        if (elements.body) {
            this.renderMiniPokemonElement(renderer, elements.body, 0, baseY, 0, color, secondaryColor, scaleFactor, isPlayer);
        }
        
        if (elements.head) {
            const headPos = elements.head.position || { x: 0, y: 0, z: 0 };
            this.renderMiniPokemonElement(renderer, elements.head, headPos.x * scaleFactor, baseY + headPos.y * scaleFactor, headPos.z * scaleFactor, color, secondaryColor, scaleFactor, isPlayer);
        }
        
        if (elements.ears && elements.ears.length > 0) {
            elements.ears.forEach(ear => {
                const earPos = ear.position || { x: 0, y: 0, z: 0 };
                const earRot = ear.rotation || { x: 0, y: 0, z: 0 };
                const earColor = ear.useSecondaryColor ? secondaryColor : color;
                this.renderMiniPokemonElementWithRotation(renderer, ear, earPos.x * scaleFactor, baseY + earPos.y * scaleFactor, earPos.z * scaleFactor, earColor, earRot, scaleFactor, isPlayer);
            });
        }
        
        if (elements.earTips && elements.earTips.length > 0) {
            elements.earTips.forEach(ear => {
                const earPos = ear.position || { x: 0, y: 0, z: 0 };
                const earColor = ear.color || secondaryColor;
                this.renderMiniPokemonElement(renderer, ear, earPos.x * scaleFactor, baseY + earPos.y * scaleFactor, earPos.z * scaleFactor, earColor, secondaryColor, scaleFactor, isPlayer);
            });
        }
        
        if (elements.tail) {
            if (Array.isArray(elements.tail)) {
                elements.tail.forEach(tail => {
                    const tailPos = tail.position || { x: 0, y: 0, z: 0 };
                    const tailRot = tail.rotation || { x: 0, y: 0, z: 0 };
                    const tailColor = tail.color || secondaryColor;
                    this.renderMiniPokemonElementWithRotation(renderer, tail, tailPos.x * scaleFactor, baseY + tailPos.y * scaleFactor, tailPos.z * scaleFactor, tailColor, tailRot, scaleFactor, isPlayer);
                });
            } else {
                const tailPos = elements.tail.position || { x: 0, y: 0, z: 0 };
                const tailRot = elements.tail.rotation || { x: 0, y: 0, z: 0 };
                const tailColor = elements.tail.color || secondaryColor;
                this.renderMiniPokemonElementWithRotation(renderer, elements.tail, tailPos.x * scaleFactor, baseY + tailPos.y * scaleFactor, tailPos.z * scaleFactor, tailColor, tailRot, scaleFactor, isPlayer);
            }
        }
        
        if (elements.tailBase) {
            const tailBasePos = elements.tailBase.position || { x: 0, y: 0, z: 0 };
            const tailBaseRot = elements.tailBase.rotation || { x: 0, y: 0, z: 0 };
            this.renderMiniPokemonElementWithRotation(renderer, elements.tailBase, tailBasePos.x * scaleFactor, baseY + tailBasePos.y * scaleFactor, tailBasePos.z * scaleFactor, color, tailBaseRot, scaleFactor, isPlayer);
        }
        
        if (elements.legs && elements.legs.length > 0) {
            elements.legs.forEach(leg => {
                const legPos = leg.position || { x: 0, y: 0, z: 0 };
                const legColor = leg.useSecondaryColor ? secondaryColor : color;
                this.renderMiniPokemonElement(renderer, leg, legPos.x * scaleFactor, baseY + legPos.y * scaleFactor, legPos.z * scaleFactor, legColor, secondaryColor, scaleFactor, isPlayer);
            });
        }
        
        if (elements.arms && elements.arms.length > 0) {
            elements.arms.forEach(arm => {
                const armPos = arm.position || { x: 0, y: 0, z: 0 };
                const armRot = arm.rotation || { x: 0, y: 0, z: 0 };
                const armColor = arm.useSecondaryColor ? secondaryColor : color;
                this.renderMiniPokemonElementWithRotation(renderer, arm, armPos.x * scaleFactor, baseY + armPos.y * scaleFactor, armPos.z * scaleFactor, armColor, armRot, scaleFactor, isPlayer);
            });
        }
        
        if (elements.eyes && elements.eyes.length > 0) {
            elements.eyes.forEach(eye => {
                const eyePos = eye.position || { x: 0, y: 0, z: 0 };
                const eyeColor = eye.color || [1.0, 1.0, 1.0, 1.0];
                const eyeOffsetX = isPlayer ? 0.03 : -0.03;
                this.renderMiniPokemonElement(renderer, eye, (eyePos.x + eyeOffsetX) * scaleFactor, baseY + eyePos.y * scaleFactor, eyePos.z * scaleFactor, eyeColor, secondaryColor, scaleFactor, isPlayer);
            });
        }
        
        if (elements.cheeks && elements.cheeks.length > 0) {
            elements.cheeks.forEach(cheek => {
                const cheekPos = cheek.position || { x: 0, y: 0, z: 0 };
                const cheekColor = cheek.color || secondaryColor;
                this.renderMiniPokemonElement(renderer, cheek, cheekPos.x * scaleFactor, baseY + cheekPos.y * scaleFactor, cheekPos.z * scaleFactor, cheekColor, secondaryColor, scaleFactor, isPlayer);
            });
        }
        
        if (elements.wings && elements.wings.length > 0) {
            elements.wings.forEach(wing => {
                const wingPos = wing.position || { x: 0, y: 0, z: 0 };
                const wingRot = wing.rotation || { x: 0, y: 0, z: 0 };
                const wingColor = wing.useSecondaryColor ? secondaryColor : color;
                this.renderMiniPokemonElementWithRotation(renderer, wing, wingPos.x * scaleFactor, baseY + wingPos.y * scaleFactor, wingPos.z * scaleFactor, wingColor, wingRot, scaleFactor, isPlayer);
            });
        }
        
        if (elements.belly) {
            const bellyPos = elements.belly.position || { x: 0, y: 0, z: 0 };
            const bellyColor = elements.belly.useSecondaryColor ? secondaryColor : color;
            this.renderMiniPokemonElement(renderer, elements.belly, bellyPos.x * scaleFactor, baseY + bellyPos.y * scaleFactor, bellyPos.z * scaleFactor, bellyColor, secondaryColor, scaleFactor, isPlayer);
        }
        
        if (elements.horns && elements.horns.length > 0) {
            elements.horns.forEach(horn => {
                const hornPos = horn.position || { x: 0, y: 0, z: 0 };
                const hornRot = horn.rotation || { x: 0, y: 0, z: 0 };
                this.renderMiniPokemonElementWithRotation(renderer, horn, hornPos.x * scaleFactor, baseY + hornPos.y * scaleFactor, hornPos.z * scaleFactor, color, hornRot, scaleFactor, isPlayer);
            });
        }
        
        if (elements.snout) {
            const snoutPos = elements.snout.position || { x: 0, y: 0, z: 0 };
            const snoutRot = elements.snout.rotation || { x: 0, y: 0, z: 0 };
            const snoutColor = elements.snout.useSecondaryColor ? secondaryColor : color;
            this.renderMiniPokemonElementWithRotation(renderer, elements.snout, snoutPos.x * scaleFactor, baseY + snoutPos.y * scaleFactor, snoutPos.z * scaleFactor, snoutColor, snoutRot, scaleFactor, isPlayer);
        }
        
        if (elements.beak) {
            const beakPos = elements.beak.position || { x: 0, y: 0, z: 0 };
            const beakRot = elements.beak.rotation || { x: 0, y: 0, z: 0 };
            const beakColor = elements.beak.color || secondaryColor;
            this.renderMiniPokemonElementWithRotation(renderer, elements.beak, beakPos.x * scaleFactor, baseY + beakPos.y * scaleFactor, beakPos.z * scaleFactor, beakColor, beakRot, scaleFactor, isPlayer);
        }
        
        if (elements.bulb) {
            const bulbPos = elements.bulb.position || { x: 0, y: 0, z: 0 };
            this.renderMiniPokemonElement(renderer, elements.bulb, bulbPos.x * scaleFactor, baseY + bulbPos.y * scaleFactor, bulbPos.z * scaleFactor, color, secondaryColor, scaleFactor, isPlayer);
        }
        
        if (elements.spots && elements.spots.length > 0) {
            elements.spots.forEach(spot => {
                const spotPos = spot.position || { x: 0, y: 0, z: 0 };
                const spotColor = spot.useSecondaryColor ? secondaryColor : color;
                this.renderMiniPokemonElement(renderer, spot, spotPos.x * scaleFactor, baseY + spotPos.y * scaleFactor, spotPos.z * scaleFactor, spotColor, secondaryColor, scaleFactor, isPlayer);
            });
        }
        
        if (elements.fangs && elements.fangs.length > 0) {
            elements.fangs.forEach(fang => {
                const fangPos = fang.position || { x: 0, y: 0, z: 0 };
                const fangRot = fang.rotation || { x: 0, y: 0, z: 0 };
                const fangColor = fang.color || [1.0, 1.0, 1.0, 1.0];
                this.renderMiniPokemonElementWithRotation(renderer, fang, fangPos.x * scaleFactor, baseY + fangPos.y * scaleFactor, fangPos.z * scaleFactor, fangColor, fangRot, scaleFactor, isPlayer);
            });
        }
        
        if (elements.hair && elements.hair.length > 0) {
            elements.hair.forEach(hair => {
                const hairPos = hair.position || { x: 0, y: 0, z: 0 };
                const hairRot = hair.rotation || { x: 0, y: 0, z: 0 };
                this.renderMiniPokemonElementWithRotation(renderer, hair, hairPos.x * scaleFactor, baseY + hairPos.y * scaleFactor, hairPos.z * scaleFactor, color, hairRot, scaleFactor, isPlayer);
            });
        }
        
        if (elements.mouth) {
            const mouthPos = elements.mouth.position || { x: 0, y: 0, z: 0 };
            const mouthColor = elements.mouth.color || secondaryColor;
            this.renderMiniPokemonElement(renderer, elements.mouth, mouthPos.x * scaleFactor, baseY + mouthPos.y * scaleFactor, mouthPos.z * scaleFactor, mouthColor, secondaryColor, scaleFactor, isPlayer);
        }
        
        if (elements.shell) {
            const shellPos = elements.shell.position || { x: 0, y: 0, z: 0 };
            const shellColor = elements.shell.useSecondaryColor ? secondaryColor : color;
            this.renderMiniPokemonElement(renderer, elements.shell, shellPos.x * scaleFactor, baseY + shellPos.y * scaleFactor, shellPos.z * scaleFactor, shellColor, secondaryColor, scaleFactor, isPlayer);
        }
    }

    renderMiniPokemonElement(renderer, element, x, y, z, color, secondaryColor, scaleFactor, isPlayer) {
        let shape;
        const elementColor = element.color || color;
        const scale = element.scale || 0.3;
        
        switch (element.type) {
            case 'sphere':
                shape = new Sphere(renderer, elementColor, scale * scaleFactor, 10);
                break;
            case 'ellipsoid':
                shape = new Ellipsoid(renderer, elementColor, 
                    (scale.x || 0.5) * scaleFactor, (scale.y || 0.5) * scaleFactor, (scale.z || 0.5) * scaleFactor, 10);
                break;
            case 'cone':
                shape = new Cone(renderer, elementColor, 
                    (scale.radius || 0.1) * scaleFactor, (scale.height || 0.3) * scaleFactor, 6);
                break;
            case 'cylinder':
                shape = new Cylinder(renderer, elementColor, 
                    (scale.radius || 0.1) * scaleFactor, (scale.height || 0.3) * scaleFactor, 6);
                break;
            case 'lightning':
                shape = new LightningTail(renderer, elementColor, (scale || 1.0) * scaleFactor);
                break;
            case 'flame':
                shape = new Flame(renderer, elementColor, (scale || 1.0) * scaleFactor, 6);
                break;
            case 'wing':
                shape = new Wing(renderer, elementColor, (scale || 1.0) * scaleFactor, 6);
                break;
            case 'shell':
                shape = new Shell(renderer, elementColor, (scale || 1.0) * scaleFactor, 6);
                break;
            case 'plantBulb':
                shape = new PlantBulb(renderer, color, secondaryColor, (scale || 1.0) * scaleFactor, 6);
                break;
            default:
                shape = new Sphere(renderer, elementColor, 0.3 * scaleFactor, 10);
        }
        
        let matrix = renderer.translateMatrix(x, y, z);
        renderer.drawShape(shape, matrix);
    }

    renderMiniPokemonElementWithRotation(renderer, element, x, y, z, color, rotation, scaleFactor, isPlayer) {
        let shape;
        const elementColor = element.color || color;
        const scale = element.scale || 0.3;
        
        switch (element.type) {
            case 'sphere':
                shape = new Sphere(renderer, elementColor, scale * scaleFactor, 10);
                break;
            case 'ellipsoid':
                shape = new Ellipsoid(renderer, elementColor, 
                    (scale.x || 0.5) * scaleFactor, (scale.y || 0.5) * scaleFactor, (scale.z || 0.5) * scaleFactor, 10);
                break;
            case 'cone':
                shape = new Cone(renderer, elementColor, 
                    (scale.radius || 0.1) * scaleFactor, (scale.height || 0.3) * scaleFactor, 6);
                break;
            case 'cylinder':
                shape = new Cylinder(renderer, elementColor, 
                    (scale.radius || 0.1) * scaleFactor, (scale.height || 0.3) * scaleFactor, 6);
                break;
            case 'lightning':
                shape = new LightningTail(renderer, elementColor, (scale || 1.0) * scaleFactor);
                break;
            case 'flame':
                shape = new Flame(renderer, elementColor, (scale || 1.0) * scaleFactor, 6);
                break;
            case 'wing':
                shape = new Wing(renderer, elementColor, (scale || 1.0) * scaleFactor, 6);
                break;
            case 'shell':
                shape = new Shell(renderer, elementColor, (scale || 1.0) * scaleFactor, 6);
                break;
            default:
                shape = new Sphere(renderer, elementColor, 0.3 * scaleFactor, 10);
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
        renderer.drawShape(shape, matrix);
    }

    renderBattleScene() {
        if (!this.renderer) return;
        
        const gl = this.renderer.gl;
        const canvas = this.renderer.canvas;
        
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
        
        renderBackground(this.renderer, this.currentBackground, this.animationTime);
        
        if (this.playerPokemon && !this.playerPokemon.isFainted()) {
            this.drawPokemonAdvanced(this.playerPokemon, { x: -2, y: 0.3, z: 0 }, this.playerShake, true);
        }
        
        if (this.enemyPokemon && !this.enemyPokemon.isFainted()) {
            this.drawPokemonAdvanced(this.enemyPokemon, { x: 2, y: 0.3, z: 0 }, this.enemyShake, false);
        }
    }

    drawPokemonAdvanced(pokemon, position, shake, isPlayer) {
        const model = getPokemonModel(pokemon.shape);
        const color = pokemon.color;
        const secondaryColor = pokemon.secondaryColor || color;
        const elements = model.elements;
        
        const bobY = Math.sin(this.animationTime * 2) * 0.05;
        const baseX = position.x + shake.x;
        const baseY = position.y + shake.y + bobY;
        const baseZ = position.z + shake.z;
        
        const eyeOffsetX = isPlayer ? 0.05 : -0.05;
        const eyeOffsetZ = isPlayer ? 0 : 0;
        
        if (elements.body) {
            this.renderPokemonElement(elements.body, baseX, baseY, baseZ, color, secondaryColor);
        }
        
        if (elements.head) {
            const headPos = elements.head.position || { x: 0, y: 0, z: 0 };
            this.renderPokemonElement(elements.head, baseX + headPos.x, baseY + headPos.y, baseZ + headPos.z, color, secondaryColor);
        }
        
        if (elements.ears && elements.ears.length > 0) {
            elements.ears.forEach(ear => {
                const earPos = ear.position || { x: 0, y: 0, z: 0 };
                const earRot = ear.rotation || { x: 0, y: 0, z: 0 };
                const earColor = ear.useSecondaryColor ? secondaryColor : color;
                this.renderPokemonElementWithRotation(ear, baseX + earPos.x, baseY + earPos.y, baseZ + earPos.z, earColor, earRot);
            });
        }
        
        if (elements.earTips && elements.earTips.length > 0) {
            elements.earTips.forEach(ear => {
                const earPos = ear.position || { x: 0, y: 0, z: 0 };
                const earColor = ear.color || secondaryColor;
                this.renderPokemonElement(ear, baseX + earPos.x, baseY + earPos.y, baseZ + earPos.z, earColor, secondaryColor);
            });
        }
        
        if (elements.tail) {
            if (Array.isArray(elements.tail)) {
                elements.tail.forEach(tail => {
                    const tailPos = tail.position || { x: 0, y: 0, z: 0 };
                    const tailRot = tail.rotation || { x: 0, y: 0, z: 0 };
                    const tailColor = tail.color || secondaryColor;
                    this.renderPokemonElementWithRotation(tail, baseX + tailPos.x, baseY + tailPos.y, baseZ + tailPos.z, tailColor, tailRot);
                });
            } else {
                const tailPos = elements.tail.position || { x: 0, y: 0, z: 0 };
                const tailRot = elements.tail.rotation || { x: 0, y: 0, z: 0 };
                const tailColor = elements.tail.color || secondaryColor;
                this.renderPokemonElementWithRotation(elements.tail, baseX + tailPos.x, baseY + tailPos.y, baseZ + tailPos.z, tailColor, tailRot);
            }
        }
        
        if (elements.tailBase) {
            const tailBasePos = elements.tailBase.position || { x: 0, y: 0, z: 0 };
            const tailBaseRot = elements.tailBase.rotation || { x: 0, y: 0, z: 0 };
            this.renderPokemonElementWithRotation(elements.tailBase, baseX + tailBasePos.x, baseY + tailBasePos.y, baseZ + tailBasePos.z, color, tailBaseRot);
        }
        
        if (elements.legs && elements.legs.length > 0) {
            elements.legs.forEach(leg => {
                const legPos = leg.position || { x: 0, y: 0, z: 0 };
                this.renderPokemonElement(leg, baseX + legPos.x, baseY + legPos.y, baseZ + legPos.z, color, secondaryColor);
            });
        }
        
        if (elements.arms && elements.arms.length > 0) {
            elements.arms.forEach(arm => {
                const armPos = arm.position || { x: 0, y: 0, z: 0 };
                const armRot = arm.rotation || { x: 0, y: 0, z: 0 };
                this.renderPokemonElementWithRotation(arm, baseX + armPos.x, baseY + armPos.y, baseZ + armPos.z, color, armRot);
            });
        }
        
        if (elements.eyes && elements.eyes.length > 0) {
            elements.eyes.forEach(eye => {
                const eyePos = eye.position || { x: 0, y: 0, z: 0 };
                const eyeColor = eye.color || [1.0, 1.0, 1.0, 1.0];
                this.renderPokemonElement(eye, baseX + eyePos.x + eyeOffsetX, baseY + eyePos.y, baseZ + eyePos.z + eyeOffsetZ, eyeColor, secondaryColor);
            });
        }
        
        if (elements.cheeks && elements.cheeks.length > 0) {
            elements.cheeks.forEach(cheek => {
                const cheekPos = cheek.position || { x: 0, y: 0, z: 0 };
                const cheekColor = cheek.color || secondaryColor;
                this.renderPokemonElement(cheek, baseX + cheekPos.x, baseY + cheekPos.y, baseZ + cheekPos.z, cheekColor, secondaryColor);
            });
        }
        
        if (elements.wings && elements.wings.length > 0) {
            elements.wings.forEach(wing => {
                const wingPos = wing.position || { x: 0, y: 0, z: 0 };
                const wingRot = wing.rotation || { x: 0, y: 0, z: 0 };
                const wingColor = wing.useSecondaryColor ? secondaryColor : color;
                this.renderPokemonElementWithRotation(wing, baseX + wingPos.x, baseY + wingPos.y, baseZ + wingPos.z, wingColor, wingRot);
            });
        }
        
        if (elements.belly) {
            const bellyPos = elements.belly.position || { x: 0, y: 0, z: 0 };
            const bellyColor = elements.belly.useSecondaryColor ? secondaryColor : color;
            this.renderPokemonElement(elements.belly, baseX + bellyPos.x, baseY + bellyPos.y, baseZ + bellyPos.z, bellyColor, secondaryColor);
        }
        
        if (elements.horns && elements.horns.length > 0) {
            elements.horns.forEach(horn => {
                const hornPos = horn.position || { x: 0, y: 0, z: 0 };
                const hornRot = horn.rotation || { x: 0, y: 0, z: 0 };
                this.renderPokemonElementWithRotation(horn, baseX + hornPos.x, baseY + hornPos.y, baseZ + hornPos.z, color, hornRot);
            });
        }
        
        if (elements.snout) {
            const snoutPos = elements.snout.position || { x: 0, y: 0, z: 0 };
            const snoutRot = elements.snout.rotation || { x: 0, y: 0, z: 0 };
            const snoutColor = elements.snout.useSecondaryColor ? secondaryColor : color;
            this.renderPokemonElementWithRotation(elements.snout, baseX + snoutPos.x, baseY + snoutPos.y, baseZ + snoutPos.z, snoutColor, snoutRot);
        }
        
        if (elements.beak) {
            const beakPos = elements.beak.position || { x: 0, y: 0, z: 0 };
            const beakRot = elements.beak.rotation || { x: 0, y: 0, z: 0 };
            const beakColor = elements.beak.color || secondaryColor;
            this.renderPokemonElementWithRotation(elements.beak, baseX + beakPos.x, baseY + beakPos.y, baseZ + beakPos.z, beakColor, beakRot);
        }
        
        if (elements.bulb) {
            const bulbPos = elements.bulb.position || { x: 0, y: 0, z: 0 };
            this.renderPokemonElement(elements.bulb, baseX + bulbPos.x, baseY + bulbPos.y, baseZ + bulbPos.z, color, secondaryColor);
        }
        
        if (elements.spots && elements.spots.length > 0) {
            elements.spots.forEach(spot => {
                const spotPos = spot.position || { x: 0, y: 0, z: 0 };
                const spotColor = spot.useSecondaryColor ? secondaryColor : color;
                this.renderPokemonElement(spot, baseX + spotPos.x, baseY + spotPos.y, baseZ + spotPos.z, spotColor, secondaryColor);
            });
        }
        
        if (elements.fangs && elements.fangs.length > 0) {
            elements.fangs.forEach(fang => {
                const fangPos = fang.position || { x: 0, y: 0, z: 0 };
                const fangRot = fang.rotation || { x: 0, y: 0, z: 0 };
                const fangColor = fang.color || [1.0, 1.0, 1.0, 1.0];
                this.renderPokemonElementWithRotation(fang, baseX + fangPos.x, baseY + fangPos.y, baseZ + fangPos.z, fangColor, fangRot);
            });
        }
        
        if (elements.hair && elements.hair.length > 0) {
            elements.hair.forEach(hair => {
                const hairPos = hair.position || { x: 0, y: 0, z: 0 };
                const hairRot = hair.rotation || { x: 0, y: 0, z: 0 };
                this.renderPokemonElementWithRotation(hair, baseX + hairPos.x, baseY + hairPos.y, baseZ + hairPos.z, color, hairRot);
            });
        }
        
        if (elements.mouth) {
            const mouthPos = elements.mouth.position || { x: 0, y: 0, z: 0 };
            const mouthColor = elements.mouth.color || secondaryColor;
            this.renderPokemonElement(elements.mouth, baseX + mouthPos.x, baseY + mouthPos.y, baseZ + mouthPos.z, mouthColor, secondaryColor);
        }
        
        if (elements.shell) {
            const shellPos = elements.shell.position || { x: 0, y: 0, z: 0 };
            const shellColor = elements.shell.useSecondaryColor ? secondaryColor : color;
            this.renderPokemonElement(elements.shell, baseX + shellPos.x, baseY + shellPos.y, baseZ + shellPos.z, shellColor, secondaryColor);
        }
    }

    renderPokemonElement(element, x, y, z, color, secondaryColor) {
        let shape;
        const elementColor = element.color || color;
        const scale = element.scale || 0.3;
        
        switch (element.type) {
            case 'sphere':
                shape = new Sphere(this.renderer, elementColor, scale, 12);
                break;
            case 'ellipsoid':
                shape = new Ellipsoid(this.renderer, elementColor, 
                    scale.x || 0.5, scale.y || 0.5, scale.z || 0.5, 12);
                break;
            case 'cone':
                shape = new Cone(this.renderer, elementColor, 
                    scale.radius || 0.1, scale.height || 0.3, 8);
                break;
            case 'cylinder':
                shape = new Cylinder(this.renderer, elementColor, 
                    scale.radius || 0.1, scale.height || 0.3, 8);
                break;
            case 'lightning':
                shape = new LightningTail(this.renderer, elementColor, scale || 1.0);
                break;
            case 'flame':
                shape = new Flame(this.renderer, elementColor, scale || 1.0, 8);
                break;
            case 'wing':
                shape = new Wing(this.renderer, elementColor, scale || 1.0, 8);
                break;
            case 'shell':
                shape = new Shell(this.renderer, elementColor, scale || 1.0, 8);
                break;
            case 'plantBulb':
                shape = new PlantBulb(this.renderer, color, secondaryColor, scale || 1.0, 8);
                break;
            default:
                shape = new Sphere(this.renderer, elementColor, 0.3, 12);
        }
        
        let matrix = this.renderer.translateMatrix(x, y, z);
        this.renderer.drawShape(shape, matrix);
    }

    renderPokemonElementWithRotation(element, x, y, z, color, rotation) {
        let shape;
        const elementColor = element.color || color;
        const scale = element.scale || 0.3;
        
        switch (element.type) {
            case 'sphere':
                shape = new Sphere(this.renderer, elementColor, scale, 12);
                break;
            case 'ellipsoid':
                shape = new Ellipsoid(this.renderer, elementColor, 
                    scale.x || 0.5, scale.y || 0.5, scale.z || 0.5, 12);
                break;
            case 'cone':
                shape = new Cone(this.renderer, elementColor, 
                    scale.radius || 0.1, scale.height || 0.3, 8);
                break;
            case 'cylinder':
                shape = new Cylinder(this.renderer, elementColor, 
                    scale.radius || 0.1, scale.height || 0.3, 8);
                break;
            case 'lightning':
                shape = new LightningTail(this.renderer, elementColor, scale || 1.0);
                break;
            case 'flame':
                shape = new Flame(this.renderer, elementColor, scale || 1.0, 8);
                break;
            case 'wing':
                shape = new Wing(this.renderer, elementColor, scale || 1.0, 8);
                break;
            case 'shell':
                shape = new Shell(this.renderer, elementColor, scale || 1.0, 8);
                break;
            default:
                shape = new Sphere(this.renderer, elementColor, 0.3, 12);
        }
        
        let matrix = this.renderer.translateMatrix(x, y, z);
        const rot = rotation || { x: 0, y: 0, z: 0 };
        if (rot.x !== 0) {
            matrix = this.renderer.multiplyMatrices(matrix, this.renderer.rotateXMatrix(rot.x));
        }
        if (rot.y !== 0) {
            matrix = this.renderer.multiplyMatrices(matrix, this.renderer.rotateYMatrix(rot.y));
        }
        if (rot.z !== 0) {
            matrix = this.renderer.multiplyMatrices(matrix, this.renderer.rotateZMatrix(rot.z));
        }
        this.renderer.drawShape(shape, matrix);
    }

    renderTeamSidebar() {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        
        this.renderPlayerTeamList(state.playerTeam);
        this.renderEnemyTeamList(state.enemyTeam);
    }

    renderPlayerTeamList(playerTeam) {
        this.playerTeamList.innerHTML = '';
        
        playerTeam.forEach((pokemon, index) => {
            if (pokemon.isActive) return;
            
            const card = document.createElement('div');
            card.className = `team-pokemon-small ${pokemon.isFainted ? 'fainted' : ''}`;
            card.dataset.index = index;
            
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
                    if (this.isSwitchModalOpen || this.isBattleProcessing || !this.battleSystem.isPlayerTurn) return;
                    if (!this.battleSystem.canPlayerSwitch()) return;
                    this.quickSwitchPokemon(index);
                });
            }
            
            this.playerTeamList.appendChild(card);
        });
    }

    renderEnemyTeamList(enemyTeam) {
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
            
            this.enemyTeamList.appendChild(card);
        });
    }

    openSwitchModal(isForced) {
        if (!this.battleSystem) return;
        
        this.isForcedSwitch = isForced;
        
        const state = this.battleSystem.getBattleState();
        this.switchOptions.innerHTML = '';
        
        if (isForced) {
            this.switchModalTitle.textContent = `${this.playerPokemon.name} 倒下了！请选择下一只宝可梦`;
            this.cancelSwitchBtn.style.display = 'none';
        } else {
            this.switchModalTitle.textContent = '选择要切换的宝可梦';
            this.cancelSwitchBtn.style.display = 'block';
        }
        
        state.playerTeam.forEach((pokemon, index) => {
            if (pokemon.isActive || pokemon.isFainted) return;
            
            const option = document.createElement('div');
            option.className = 'switch-option';
            option.dataset.index = index;
            
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
            
            this.switchOptions.appendChild(option);
        });
        
        this.switchModal.style.display = 'block';
        this.isSwitchModalOpen = true;
        this.disableMoveButtons();
    }

    closeSwitchModal() {
        this.switchModal.style.display = 'none';
        this.isSwitchModalOpen = false;
        this.isForcedSwitch = false;
        this.enableMoveButtons();
    }

    quickSwitchPokemon(newIndex) {
        if (!this.battleSystem || !this.battleSystem.isPlayerTurn) return;
        if (this.isBattleProcessing) return;
        if (!this.battleSystem.canPlayerSwitch()) return;
        
        this.isBattleProcessing = true;
        this.disableMoveButtons();
        
        const result = this.battleSystem.playerSwitchPokemon(newIndex);
        
        if (result.success) {
            this.activePlayerIndex = newIndex;
            this.battleMessage.textContent = result.message;
            this.updateUI();
            
            setTimeout(() => {
                this.battleMessage.textContent = `轮到 ${this.enemyPokemon.name} 行动！`;
                setTimeout(() => this.executeEnemyTurn(), 1000);
            }, 1500);
        } else {
            this.battleMessage.textContent = result.message;
            this.isBattleProcessing = false;
            this.enableMoveButtons();
        }
    }

    executePlayerSwitch(newIndex) {
        this.closeSwitchModal();
        this.quickSwitchPokemon(newIndex);
    }

    executePlayerMove(moveIndex) {
        if (!this.battleSystem || this.battleSystem.battleOver || !this.battleSystem.isPlayerTurn || this.isBattleProcessing) return;
        
        const move = this.playerPokemon.moves[moveIndex];
        if (!move || move.currentPp <= 0) {
            this.battleMessage.textContent = `${move ? move.name : '该招式'} 的PP已用尽！`;
            return;
        }
        
        this.isBattleProcessing = true;
        this.disableMoveButtons();
        this.switchPokemonBtn.disabled = true;
        
        const result = this.battleSystem.playerTurn(moveIndex);
        
        if (result) {
            this.battleMessage.textContent = result.message;
            
            if (!result.missed && result.damage > 0) {
                this.shakeEnemy();
            }
            
            this.updateUI();
            
            setTimeout(() => {
                if (this.battleSystem.battleOver) {
                    this.endBattle();
                } else {
                    this.battleMessage.textContent = `轮到 ${this.enemyPokemon.name} 行动！`;
                    setTimeout(() => this.executeEnemyTurn(), 1000);
                }
            }, 1500);
        }
    }

    executeEnemyTurn() {
        if (!this.battleSystem || this.battleSystem.battleOver || this.battleSystem.isPlayerTurn) return;
        
        const result = this.battleSystem.enemyTurn();
        
        if (result) {
            this.battleMessage.textContent = result.message;
            
            if (result.isSwitch) {
                this.activeEnemyIndex = this.battleSystem.activeEnemyIndex;
            } else if (!result.missed && result.damage > 0) {
                this.shakePlayer();
            }
            
            this.updateUI();
            
            setTimeout(() => {
                if (this.battleSystem.battleOver) {
                    this.endBattle();
                } else if (this.playerPokemon.isFainted()) {
                    const availableIndices = this.battleSystem.getPlayerAvailableIndices();
                    if (availableIndices.length > 0) {
                        this.battleMessage.textContent = `${this.playerPokemon.name} 倒下了！请选择下一只宝可梦！`;
                        this.openSwitchModal(true);
                        this.isBattleProcessing = false;
                    } else {
                        this.endBattle();
                    }
                } else {
                    this.battleMessage.textContent = `轮到 ${this.playerPokemon.name} 行动！`;
                    this.isBattleProcessing = false;
                    this.enableMoveButtons();
                    this.updateSwitchButton();
                }
            }, 1500);
        }
    }

    shakePlayer() {
        this.playerShake.x = (Math.random() - 0.5) * 0.2;
        this.playerShake.y = (Math.random() - 0.5) * 0.2;
        this.playerShake.z = (Math.random() - 0.5) * 0.2;
    }

    shakeEnemy() {
        this.enemyShake.x = (Math.random() - 0.5) * 0.2;
        this.enemyShake.y = (Math.random() - 0.5) * 0.2;
        this.enemyShake.z = (Math.random() - 0.5) * 0.2;
    }

    updateUI() {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        
        this.activePlayerIndex = state.activePlayerIndex;
        this.activeEnemyIndex = state.activeEnemyIndex;
        
        this.playerActiveName.textContent = state.playerPokemon.name;
        this.enemyActiveName.textContent = state.enemyPokemon.name;
        
        const playerHpPercent = (state.playerPokemon.currentHp / state.playerPokemon.maxHp) * 100;
        const enemyHpPercent = (state.enemyPokemon.currentHp / state.enemyPokemon.maxHp) * 100;
        
        this.playerActiveHpBar.style.width = `${playerHpPercent}%`;
        this.enemyActiveHpBar.style.width = `${enemyHpPercent}%`;
        
        this.playerActiveHpText.textContent = `${state.playerPokemon.currentHp}/${state.playerPokemon.maxHp}`;
        this.enemyActiveHpText.textContent = `${state.enemyPokemon.currentHp}/${state.enemyPokemon.maxHp}`;
        
        this.updateSmallHpBarColor(this.playerActiveHpBar, playerHpPercent);
        this.updateSmallHpBarColor(this.enemyActiveHpBar, enemyHpPercent);
        
        state.playerPokemon.moves.forEach((move, index) => {
            if (index < this.moveButtons.length) {
                const button = this.moveButtons[index];
                button.textContent = `${move.name} (${move.currentPp}/${move.maxPp})`;
                button.style.backgroundColor = this.getTypeColor(move.type);
                button.disabled = move.currentPp <= 0;
            }
        });
        
        this.renderTeamSidebar();
        this.updateSwitchButton();
    }

    updateSwitchButton() {
        if (!this.battleSystem) {
            this.switchPokemonBtn.disabled = true;
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

    updateSmallHpBarColor(hpBar, percent) {
        hpBar.classList.remove('low', 'critical');
        
        if (percent <= 20) {
            hpBar.classList.add('critical');
        } else if (percent <= 50) {
            hpBar.classList.add('low');
        }
    }

    getTypeColor(type) {
        const colors = {
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

    disableMoveButtons() {
        this.moveButtons.forEach(button => {
            button.disabled = true;
        });
        if (this.switchPokemonBtn) {
            this.switchPokemonBtn.disabled = true;
        }
    }

    enableMoveButtons() {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        state.playerPokemon.moves.forEach((move, index) => {
            if (index < this.moveButtons.length) {
                this.moveButtons[index].disabled = move.currentPp <= 0;
            }
        });
        this.updateSwitchButton();
    }

    endBattle() {
        this.disableMoveButtons();
        
        if (this.battleSystem.winner === 'player') {
            this.battleMessage.textContent = `恭喜！你赢得了战斗！`;
        } else {
            this.battleMessage.textContent = `很遗憾，你输掉了战斗...`;
        }
        
        setTimeout(() => {
            this.game.showResultPage(
                this.battleSystem.winner === 'player',
                this.playerPokemon,
                this.enemyPokemon,
                this.battleSystem.turn
            );
        }, 2000);
    }

    show() {
        document.getElementById('selection-page').classList.remove('active');
        document.getElementById('battle-page').classList.add('active');
        document.getElementById('result-page').classList.remove('active');
    }

    hide() {
        document.getElementById('battle-page').classList.remove('active');
        this.is3DAnimating = false;
        this.isBattleProcessing = false;
        this.isSwitchModalOpen = false;
        this.isForcedSwitch = false;
        this.battleSystem = null;
        if (this.switchModal) {
            this.switchModal.style.display = 'none';
        }
    }
}
