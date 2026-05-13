import { Grid } from './grid.js';
import { RenderEngine } from './render.js';
import { EntityManager } from './entities/entityManager.js';
import { Interactions } from './interaction.js';

export class gameClass {
    constructor() {
        this.render = new RenderEngine()
        this.entityManager = new EntityManager()
        this.grid = new Grid()
        this.render.grid = this.grid
        this.render.drawTiles()
        this.render.setZoomLevel(5)
        this.render.addEventListener()
        this.interaction = new Interactions(this.grid, this.render, this.entityManager)
        this.interaction.addEventListeners()
        setInterval(() => {
            this.tick()
        }, 50)
    }

    tick() {
        this.tickCount = (this.tickCount || 0) + 1;
        this.grid.tick(this.tickCount)
        this.entityManager.tick(this.tickCount)

    }

}
