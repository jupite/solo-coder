import { SmallAsteroid } from './enemies/SmallAsteroid.js';
import { LargeAsteroid } from './enemies/LargeAsteroid.js';
import { EnemyShip } from './enemies/EnemyShip.js';
import { BossShip } from './enemies/BossShip.js';
import { Base } from './enemies/Base.js';
import { DefenseTurret } from './enemies/DefenseTurret.js';

export class EnemyManager {
    constructor(scene, bulletManager, particleSystem) {
        this.scene = scene;
        this.bulletManager = bulletManager;
        this.particleSystem = particleSystem;
        this.enemies = [];
        this.lastSpawnTime = 0;
        this.spawnRate = 2000;
    }
    
    spawnEnemy(type, x, y) {
        let enemy = null;
        
        switch(type) {
            case 'small_asteroid':
                enemy = new SmallAsteroid(this.scene, x, y);
                break;
            case 'large_asteroid':
                enemy = new LargeAsteroid(this.scene, x, y);
                break;
            case 'enemy_ship':
                enemy = new EnemyShip(this.scene, x, y);
                break;
            case 'boss_ship':
                enemy = new BossShip(this.scene, x, y, this.bulletManager);
                break;
            case 'base':
                enemy = new Base(this.scene, x, y, this.bulletManager);
                break;
            case 'defense_turret':
                enemy = new DefenseTurret(this.scene, x, y);
                break;
        }
        
        if (enemy) {
            this.enemies.push(enemy);
        }
    }
    
    getRandomEnemyType(difficulty) {
        const types = [
            { type: 'small_asteroid', weight: 50 + difficulty * 2 },
            { type: 'large_asteroid', weight: 15 + difficulty },
            { type: 'enemy_ship', weight: 10 + difficulty },
            { type: 'boss_ship', weight: 3 + Math.floor(difficulty / 3) },
            { type: 'base', weight: 2 + Math.floor(difficulty / 5) },
            { type: 'defense_turret', weight: 10 + difficulty * 2 }
        ];
        
        const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const { type, weight } of types) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }
        
        return 'small_asteroid';
    }
    
    spawnRandomEnemy(difficulty) {
        const type = this.getRandomEnemyType(difficulty);
        const x = (Math.random() - 0.5) * 60;
        const y = type === 'defense_turret' ? 0 : 25;
        this.spawnEnemy(type, x, y);
    }
    
    removeEnemy(index) {
        if (this.enemies[index]) {
            const enemy = this.enemies[index];
            const fragments = enemy.getFragments();
            
            for (const frag of fragments) {
                this.spawnEnemy(frag.type, frag.x, frag.y);
            }
            
            this.particleSystem.createExplosion(
                enemy.mesh.position.x, 
                enemy.mesh.position.y, 
                enemy.mesh.position.z
            );
            
            enemy.destroy();
            this.enemies.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update(deltaTime);
            
            if (this.enemies[i].shouldRemove()) {
                this.removeEnemy(i);
            }
        }
    }
    
    getEnemies() {
        return this.enemies;
    }
    
    clear() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].destroy();
            this.enemies.splice(i, 1);
        }
    }
    
    getSpawnRate() {
        return this.spawnRate;
    }
    
    setSpawnRate(rate) {
        this.spawnRate = rate;
    }
    
    getLastSpawnTime() {
        return this.lastSpawnTime;
    }
    
    setLastSpawnTime(time) {
        this.lastSpawnTime = time;
    }
}