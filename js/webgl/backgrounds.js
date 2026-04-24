const BattleBackgrounds = {
    platform1: {
        name: '平台1',
        skyColor: [0.1, 0.1, 0.2, 1.0],
        platformColor: [0.2, 0.4, 0.6, 1.0],
        patternColor: [0.3, 0.6, 0.9, 1.0],
        patternType: 'circles'
    },
    platform2: {
        name: '平台2',
        skyColor: [0.2, 0.1, 0.1, 1.0],
        platformColor: [0.6, 0.3, 0.3, 1.0],
        patternColor: [0.9, 0.4, 0.4, 1.0],
        patternType: 'grid'
    },
    platform3: {
        name: '平台3',
        skyColor: [0.1, 0.2, 0.1, 1.0],
        platformColor: [0.3, 0.6, 0.3, 1.0],
        patternColor: [0.5, 0.8, 0.5, 1.0],
        patternType: 'hexagons'
    }
};

const BackgroundList = ['platform1', 'platform2', 'platform3'];

function getRandomBackground() {
    const randomIndex = Math.floor(Math.random() * BackgroundList.length);
    return BackgroundList[randomIndex];
}

function getBackground(backgroundName) {
    return BattleBackgrounds[backgroundName] || BattleBackgrounds.platform1;
}

function renderBackground(renderer, backgroundName, animationTime) {
    const bg = getBackground(backgroundName);
    const gl = renderer.gl;

    renderer.clear(bg.skyColor[0], bg.skyColor[1], bg.skyColor[2], bg.skyColor[3]);

    renderBattlePlatform(renderer, bg, animationTime);
}

function getBackgroundBaseZ() {
    return -5.0;
}

function renderBattlePlatform(renderer, bg, animationTime) {
    const platformRadius = 3.5;
    const platformHeight = 0.2;
    const platformY = -0.1;
    
    const platform = new Cylinder(renderer, bg.platformColor, platformRadius, platformHeight, 32);
    let platformMatrix = renderer.translateMatrix(0, platformY, 0);
    renderer.drawShape(platform, platformMatrix);
    
    switch (bg.patternType) {
        case 'circles':
            renderCirclePattern(renderer, bg, platformRadius, platformY);
            break;
        case 'grid':
            renderGridPattern(renderer, bg, platformRadius, platformY);
            break;
        case 'hexagons':
            renderHexagonPattern(renderer, bg, platformRadius, platformY);
            break;
    }
}

function renderCirclePattern(renderer, bg, platformRadius, platformY) {
    const patternColor = bg.patternColor;
    
    for (let i = 1; i <= 3; i++) {
        const radius = platformRadius * (i / 4);
        const ring = new Cylinder(renderer, patternColor, radius, 0.01, 32);
        let ringMatrix = renderer.translateMatrix(0, platformY + 0.105, 0);
        ringMatrix = renderer.multiplyMatrices(ringMatrix, renderer.scaleMatrix(1, 0.05, 1));
        renderer.drawShape(ring, ringMatrix);
    }
    
    const center = new Sphere(renderer, patternColor, 0.3, 16);
    let centerMatrix = renderer.translateMatrix(0, platformY + 0.11, 0);
    renderer.drawShape(center, centerMatrix);
}

function renderGridPattern(renderer, bg, platformRadius, platformY) {
    const patternColor = bg.patternColor;
    const gridSize = 0.5;
    
    for (let x = -platformRadius; x <= platformRadius; x += gridSize) {
        if (Math.abs(x) > platformRadius) continue;
        
        const line = new Cylinder(renderer, patternColor, 0.05, platformRadius * 2, 8);
        let lineMatrix = renderer.translateMatrix(x, platformY + 0.105, 0);
        lineMatrix = renderer.multiplyMatrices(lineMatrix, renderer.rotateXMatrix(Math.PI / 2));
        lineMatrix = renderer.multiplyMatrices(lineMatrix, renderer.scaleMatrix(1, 1, 0.05));
        renderer.drawShape(line, lineMatrix);
    }
    
    for (let z = -platformRadius; z <= platformRadius; z += gridSize) {
        if (Math.abs(z) > platformRadius) continue;
        
        const line = new Cylinder(renderer, patternColor, 0.05, platformRadius * 2, 8);
        let lineMatrix = renderer.translateMatrix(0, platformY + 0.105, z);
        lineMatrix = renderer.multiplyMatrices(lineMatrix, renderer.rotateXMatrix(Math.PI / 2));
        lineMatrix = renderer.multiplyMatrices(lineMatrix, renderer.rotateZMatrix(Math.PI / 2));
        lineMatrix = renderer.multiplyMatrices(lineMatrix, renderer.scaleMatrix(1, 1, 0.05));
        renderer.drawShape(line, lineMatrix);
    }
}

function renderHexagonPattern(renderer, bg, platformRadius, platformY) {
    const patternColor = bg.patternColor;
    const hexSize = 0.4;
    const hexHeight = Math.sqrt(3) * hexSize / 2;
    
    for (let row = -Math.floor(platformRadius / hexHeight); row <= Math.floor(platformRadius / hexHeight); row++) {
        for (let col = -Math.floor(platformRadius / hexSize); col <= Math.floor(platformRadius / hexSize); col++) {
            const x = col * hexSize * 1.5;
            const z = row * hexHeight + (col % 2) * hexHeight / 2;
            
            if (Math.sqrt(x * x + z * z) > platformRadius - hexSize) continue;
            
            const hexagon = createHexagon(renderer, patternColor, hexSize);
            let hexMatrix = renderer.translateMatrix(x, platformY + 0.105, z);
            renderer.drawShape(hexagon, hexMatrix);
        }
    }
}

function createHexagon(renderer, color, size) {
    const positions = [];
    const colors = [];
    const normals = [];
    const indices = [];
    const numSides = 6;
    
    for (let i = 0; i < numSides; i++) {
        const angle = (i / numSides) * Math.PI * 2;
        const x = Math.cos(angle) * size;
        const z = Math.sin(angle) * size;
        positions.push(x, 0, z);
        colors.push(color[0], color[1], color[2], color[3]);
        normals.push(0, 1, 0);
    }
    
    for (let i = 1; i < numSides - 1; i++) {
        indices.push(0, i, i + 1);
    }
    
    return new Shape(renderer, positions, colors, normals, indices);
}

function renderGrassPatches(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 137.5;
        const x = (Math.sin(seed) * 8.0);
        const z = -8.0 - (Math.cos(seed * 2) * 3.0);
        const sway = Math.sin(animationTime * 2 + seed) * 0.05;
        
        const scale = 0.8 + (z + 10) * 0.1;
        const grass = new Cone(renderer, element.color, 0.06 * scale, 0.2 * scale, 6);
        let grassMatrix = renderer.translateMatrix(x, -1.1, z);
        grassMatrix = renderer.multiplyMatrices(grassMatrix, renderer.rotateZMatrix(sway));
        renderer.drawShape(grass, grassMatrix);
    }
}

function renderFlowers(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 157.3;
        const x = (Math.sin(seed) * 7.5);
        const z = -7.5 - (Math.cos(seed * 2) * 2.5);
        const colorIndex = i % element.colors.length;
        const color = element.colors[colorIndex];
        
        const scale = 0.8 + (z + 10) * 0.1;
        const stem = new Cylinder(renderer, [0.3, 0.7, 0.3, 1.0], 0.02 * scale, 0.25 * scale, 8);
        let stemMatrix = renderer.translateMatrix(x, -1.1, z);
        renderer.drawShape(stem, stemMatrix);
        
        const petal = new Sphere(renderer, color, 0.05 * scale, 8);
        for (let j = 0; j < 5; j++) {
            const angle = (j / 5) * Math.PI * 2;
            let petalMatrix = renderer.translateMatrix(
                x + Math.cos(angle) * 0.06 * scale,
                -0.85,
                z + Math.sin(angle) * 0.06 * scale
            );
            renderer.drawShape(petal, petalMatrix);
        }
        
        const center = new Sphere(renderer, [1.0, 0.9, 0.2, 1.0], 0.04 * scale, 8);
        let centerMatrix = renderer.translateMatrix(x, -0.85, z);
        renderer.drawShape(center, centerMatrix);
    }
}

function renderSnowflakes(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 97.1;
        const x = (Math.sin(seed) * 8.5) % 8.5;
        const z = -8.0 - (Math.cos(seed * 2) * 4.0);
        const y = ((animationTime * 0.5 + seed * 0.1) % 3) - 0.5;
        
        const scale = 0.8 + (z + 12) * 0.08;
        const snowflake = new Sphere(renderer, [1.0, 1.0, 1.0, 0.8], 0.025 * scale, 4);
        let snowflakeMatrix = renderer.translateMatrix(x, y + 1.5, z);
        renderer.drawShape(snowflake, snowflakeMatrix);
    }
}

function renderSnowdrifts(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 113.7;
        const x = (Math.sin(seed) * 8.0);
        const z = -8.0 - (Math.cos(seed * 2) * 2.5);
        
        const scale = 0.8 + (z + 10) * 0.1;
        const drift = new Ellipsoid(renderer, [0.95, 0.98, 1.0, 1.0], 0.4 * scale, 0.15 * scale, 0.3 * scale, 8);
        let driftMatrix = renderer.translateMatrix(x, -1.1, z);
        renderer.drawShape(drift, driftMatrix);
    }
}

function renderLavaPools(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 173.2;
        const x = (Math.sin(seed) * 7.5);
        const z = -8.0 - (Math.cos(seed * 2) * 3.0);
        const pulse = Math.sin(animationTime * 3 + seed) * 0.1;
        
        const scale = 0.8 + (z + 10) * 0.1;
        const lava = new Ellipsoid(renderer, [1.0, 0.4 + pulse * 0.1, 0.0, 1.0], 0.3 * scale, 0.06 * scale, 0.25 * scale, 8);
        let lavaMatrix = renderer.translateMatrix(x, -1.18, z);
        renderer.drawShape(lava, lavaMatrix);
    }
}

function renderAshParticles(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 89.3;
        const x = (Math.sin(seed + animationTime * 0.3) * 8.0) % 8.0;
        const z = -8.5 - (Math.cos(seed * 2 + animationTime * 0.2) * 3.0);
        const y = ((animationTime * 0.3 + seed * 0.05) % 2) - 0.3;
        
        const scale = 0.8 + (z + 11) * 0.08;
        const ash = new Sphere(renderer, [0.4, 0.3, 0.25, 0.7], 0.02 * scale, 4);
        let ashMatrix = renderer.translateMatrix(x, y + 0.8, z);
        renderer.drawShape(ash, ashMatrix);
    }
}

function renderRocks(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 127.9;
        const x = (Math.sin(seed) * 7.5);
        const z = -8.0 - (Math.cos(seed * 2) * 3.0);
        const baseScale = 0.2 + Math.abs(Math.sin(seed * 3)) * 0.2;
        const distanceScale = 0.8 + (z + 10) * 0.1;
        const scale = baseScale * distanceScale;
        
        const rock = new Ellipsoid(renderer, [0.5, 0.4, 0.35, 1.0], scale, scale * 0.8, scale, 8);
        let rockMatrix = renderer.translateMatrix(x, -1.1 + scale * 0.4, z);
        renderer.drawShape(rock, rockMatrix);
    }
}

function renderPalmTrees(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 197.4;
        const x = (Math.sin(seed) * 9.0);
        const z = -9.0 - (Math.cos(seed * 2) * 3.0);
        
        const scale = 0.8 + (z + 12) * 0.08;
        const trunk = new Cylinder(renderer, [0.6, 0.45, 0.3, 1.0], 0.08 * scale, 1.0 * scale, 8);
        let trunkMatrix = renderer.translateMatrix(x, -1.1, z);
        renderer.drawShape(trunk, trunkMatrix);
        
        const leaf = new Ellipsoid(renderer, [0.2, 0.6, 0.2, 1.0], 0.2 * scale, 0.5 * scale, 0.1 * scale, 8);
        for (let j = 0; j < 6; j++) {
            const angle = (j / 6) * Math.PI * 2;
            const sway = Math.sin(animationTime * 2 + j + seed) * 0.1;
            let leafMatrix = renderer.translateMatrix(
                x + Math.cos(angle) * 0.25 * scale,
                -1.1 + 1.0 * scale * 0.9,
                z + Math.sin(angle) * 0.25 * scale
            );
            leafMatrix = renderer.multiplyMatrices(leafMatrix, renderer.rotateZMatrix(sway + angle));
            leafMatrix = renderer.multiplyMatrices(leafMatrix, renderer.rotateXMatrix(-0.5));
            renderer.drawShape(leaf, leafMatrix);
        }
        
        const coconuts = new Sphere(renderer, [0.5, 0.35, 0.25, 1.0], 0.06 * scale, 8);
        for (let j = 0; j < 3; j++) {
            const angle = (j / 3) * Math.PI * 2;
            let coconutMatrix = renderer.translateMatrix(
                x + Math.cos(angle) * 0.1 * scale,
                -1.1 + 1.0 * scale * 0.8,
                z + Math.sin(angle) * 0.1 * scale
            );
            renderer.drawShape(coconuts, coconutMatrix);
        }
    }
}

function renderWaves(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 149.6;
        const x = (Math.sin(seed) * 7.5);
        const z = -9.0 - Math.sin(animationTime * 1.5 + seed) * 0.4;
        
        const scale = 0.8 + (z + 9) * 0.1;
        const wave = new Ellipsoid(renderer, [0.2, 0.5, 0.8, 0.8], 1.0 * scale, 0.12 * scale, 0.4 * scale, 8);
        let waveMatrix = renderer.translateMatrix(x, -0.85, z);
        renderer.drawShape(wave, waveMatrix);
    }
}

function renderShells(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 167.8;
        const x = (Math.sin(seed) * 7.5);
        const z = -8.0 - (Math.cos(seed * 2) * 3.0);
        
        const scale = 0.8 + (z + 10) * 0.1;
        const shell = new Shell(renderer, [0.95, 0.85, 0.75, 1.0], 0.2 * scale, 8);
        let shellMatrix = renderer.translateMatrix(x, -0.87, z);
        shellMatrix = renderer.multiplyMatrices(shellMatrix, renderer.rotateXMatrix(-0.3));
        renderer.drawShape(shell, shellMatrix);
    }
}

function renderTrees(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 131.5;
        const x = (Math.sin(seed) * 9.5);
        const z = -9.0 - (Math.cos(seed * 2) * 4.0);
        
        const scale = 0.8 + (z + 13) * 0.07;
        const trunk = new Cylinder(renderer, [0.4, 0.3, 0.2, 1.0], 0.07 * scale, 0.8 * scale, 6);
        let trunkMatrix = renderer.translateMatrix(x, -1.1, z);
        renderer.drawShape(trunk, trunkMatrix);
        
        const foliageColors = [
            [0.2, 0.5, 0.2, 1.0],
            [0.15, 0.45, 0.15, 1.0],
            [0.25, 0.55, 0.25, 1.0]
        ];
        
        for (let j = 0; j < 3; j++) {
            const foliageScale = (0.45 - j * 0.1) * scale;
            const foliage = new Ellipsoid(
                renderer, 
                foliageColors[j % 3], 
                foliageScale, 
                foliageScale, 
                foliageScale, 
                10
            );
            let foliageMatrix = renderer.translateMatrix(x, -1.1 + 0.8 * scale * 0.8 + j * 0.3 * scale, z);
            renderer.drawShape(foliage, foliageMatrix);
        }
    }
}

function renderMushrooms(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 109.2;
        const x = (Math.sin(seed) * 8.0);
        const z = -8.0 - (Math.cos(seed * 2) * 3.0);
        
        const scale = 0.8 + (z + 10) * 0.1;
        const stem = new Cylinder(renderer, [0.95, 0.95, 0.9, 1.0], 0.04 * scale, 0.15 * scale, 6);
        let stemMatrix = renderer.translateMatrix(x, -1.1, z);
        renderer.drawShape(stem, stemMatrix);
        
        const capColors = [
            [0.9, 0.2, 0.2, 1.0],
            [0.8, 0.5, 0.2, 1.0],
            [0.6, 0.3, 0.7, 1.0]
        ];
        const cap = new Ellipsoid(renderer, capColors[i % 3], 0.1 * scale, 0.05 * scale, 0.1 * scale, 8);
        let capMatrix = renderer.translateMatrix(x, -1.1 + 0.15 * scale, z);
        renderer.drawShape(cap, capMatrix);
        
        const spots = new Sphere(renderer, [1.0, 1.0, 1.0, 1.0], 0.02 * scale, 4);
        for (let j = 0; j < 3; j++) {
            const angle = (j / 3) * Math.PI * 2;
            let spotMatrix = renderer.translateMatrix(
                x + Math.cos(angle) * 0.05 * scale,
                -1.1 + 0.17 * scale,
                z + Math.sin(angle) * 0.05 * scale
            );
            renderer.drawShape(spots, spotMatrix);
        }
    }
}

function renderLeafParticles(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 73.4;
        const x = (Math.sin(seed + animationTime * 0.5) * 8.0) % 8.0;
        const z = -8.5 - (Math.cos(seed * 2 + animationTime * 0.3) * 3.0);
        const y = ((animationTime * 0.4 + seed * 0.08) % 2.5) - 0.5;
        const rotation = animationTime * 2 + seed;
        
        const scale = 0.8 + (z + 11) * 0.08;
        const leaf = new Ellipsoid(renderer, [0.4, 0.6, 0.3, 0.9], 0.04 * scale, 0.06 * scale, 0.02 * scale, 6);
        let leafMatrix = renderer.translateMatrix(x, y + 0.5, z);
        leafMatrix = renderer.multiplyMatrices(leafMatrix, renderer.rotateZMatrix(rotation));
        leafMatrix = renderer.multiplyMatrices(leafMatrix, renderer.rotateXMatrix(0.5));
        renderer.drawShape(leaf, leafMatrix);
    }
}

function renderLogs(renderer, element, animationTime) {
    for (let i = 0; i < element.count; i++) {
        const seed = i * 151.7;
        const x = (Math.sin(seed) * 8.0);
        const z = -8.0 - (Math.cos(seed * 2) * 3.0);
        const rotation = seed;
        
        const scale = 0.8 + (z + 10) * 0.1;
        const log = new Cylinder(renderer, [0.5, 0.35, 0.25, 1.0], 0.1 * scale, 0.6 * scale, 8);
        let logMatrix = renderer.translateMatrix(x, -0.46, z);
        logMatrix = renderer.multiplyMatrices(logMatrix, renderer.rotateZMatrix(rotation));
        logMatrix = renderer.multiplyMatrices(logMatrix, renderer.rotateXMatrix(Math.PI / 2));
        renderer.drawShape(log, logMatrix);
    }
}
