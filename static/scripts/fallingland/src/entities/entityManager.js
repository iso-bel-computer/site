import { Human } from './human.js';
import { Bee } from './bee.js';

export class EntityManager {
    constructor(grid, state) {
        this.grid = grid
        this.state = state
        this.entities = new Set()
    }

    addEntity(entity, tile) {
        entity.tile = tile
        tile.entities.add(entity)
        this.entities.add(entity)

    }
    removeEntity(entity) {
        entity.tile.entities.delete(entity)
        entity.tile = null
        this.entities.delete(entity)

    }

    addHuman(tile) {
        const human = new Human()
        this.addEntity(human, tile)
    }

    addBee(tile) {
        const bee = new Bee()
        this.addEntity(bee, tile)
    }

    cullDead() {
        this.entities.forEach(entity => {
            if (!entity.alive) {
                this.removeEntity(entity)
            }
        })
    }

    tick(tickCount) {
        this.cullDead()
        this.entities.forEach(entity => {

            entity.tick ? entity.tick() : null

            if (entity.move) { // entity manager handles movement if the entity has a move function
                const currentTile = entity.tile
                const newTile = entity.move()
                if (newTile) {
                    currentTile.removeEntity(entity)
                    newTile.addEntity(entity)
                }
            }
        })
    }

}
