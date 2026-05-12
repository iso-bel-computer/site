export class EntityManager {
    constructor() {
        this.entities = []
    }
    tick() {
        this.entities.forEach(entity => {
            entity.tick()
        })
    }

    addEntity(entity) {
        this.entities.push(entity)
    }
}
