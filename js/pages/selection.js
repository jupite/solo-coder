class SelectionPage {
    constructor(game) {
        this.game = game;
        this.selectedPokemonIds = [];
        this.maxSelection = 3;
        this.cardRenderers = {};
        
        this.init();
    }

    init() {
        this.pokemonList = document.getElementById('pokemon-list');
        this.startBattleBtn = document.getElementById('start-battle');
        this.selectedPokemonInfo = document.getElementById('selected-pokemon-info');
        this.selectedPokemonName = document.getElementById('selected-pokemon-name');
        this.selectedPokemonStats = document.getElementById('selected-pokemon-stats');
        
        this.renderPokemonList();
        this.bindEvents();
        this.updateSelectionUI();
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
                this.game.startBattle(this.selectedPokemonIds, enemyPokemonIds);
            }
        });
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
