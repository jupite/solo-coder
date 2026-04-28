import { WebGLRenderer } from './renderer';
import { Shape, Cylinder, Sphere, Ellipsoid } from './shapes';

export interface Background {
    name: string;
    skyColor: number[];
    platformColor: number[];
    patternColor: number[];
    patternType: 'circles' | 'grid' | 'hexagons';
}

export interface BackgroundElement {
    count: number;
    color?: number[];
    colors?: number[][];
}

const BattleBackgrounds: Record<string, Background> = {
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

const BackgroundList: string[] = ['platform1', 'platform2', 'platform3'];

export function getRandomBackground(): string {
    const randomIndex = Math.floor(Math.random() * BackgroundList.length);
    return BackgroundList[randomIndex];
}

export function getBackground(backgroundName: string): Background {
    return BattleBackgrounds[backgroundName] || BattleBackgrounds.platform1;
}

export function renderBackground(renderer: WebGLRenderer, backgroundName: string, animationTime: number): void {
    const bg = getBackground(backgroundName);

    renderer.clear(bg.skyColor[0], bg.skyColor[1], bg.skyColor[2], bg.skyColor[3]);

    renderBattlePlatform(renderer, bg, animationTime);
}

export function getBackgroundBaseZ(): number {
    return -5.0;
}

function renderBattlePlatform(renderer: WebGLRenderer, bg: Background, animationTime: number): void {
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

function renderCirclePattern(renderer: WebGLRenderer, bg: Background, platformRadius: number, platformY: number): void {
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

function renderGridPattern(renderer: WebGLRenderer, bg: Background, platformRadius: number, platformY: number): void {
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

function renderHexagonPattern(renderer: WebGLRenderer, bg: Background, platformRadius: number, platformY: number): void {
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

function createHexagon(renderer: WebGLRenderer, color: number[], size: number): Shape {
    const positions: number[] = [];
    const colors: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
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