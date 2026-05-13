import { WaterManager } from './water.js';

export class EntityManager {
    constructor() {
        this.water = new WaterManager()
    }

    addWaterSource(tile) {
        this.water.addOrigin(tile)
    }

    tick(tickNumber) {
        this.water.tick(tickNumber)
    }

}
