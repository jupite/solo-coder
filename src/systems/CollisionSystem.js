import { distanceXZ } from '../utils/helpers.js';

export class CollisionSystem {
    constructor() {
        this.onTreeCollision = null;
        this.onFlagCollect = null;
    }
    
    checkCollisions(player, trees, flags) {
        const playerPos = player.getPosition();
        const playerRadius = player.getHitRadius();
        
        for (const tree of trees) {
            const treePos = tree.getPosition();
            const treeRadius = tree.getHitRadius();
            
            const dist = distanceXZ(playerPos, treePos);
            if (dist < playerRadius + treeRadius) {
                if (this.onTreeCollision) {
                    this.onTreeCollision(tree);
                }
            }
        }
        
        for (const flag of flags) {
            if (flag.isCollected()) continue;
            
            const flagPos = flag.getPosition();
            const flagRadius = flag.getCollectRadius();
            
            const dist = distanceXZ(playerPos, flagPos);
            if (dist < playerRadius + flagRadius) {
                if (flag.collect() && this.onFlagCollect) {
                    this.onFlagCollect(flag);
                }
            }
        }
    }
}
