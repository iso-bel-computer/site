import { Grid } from './grid.js';
import { RenderEngine } from './render.js';
import { Interactions } from './interaction.js';

export class gameClass {
    constructor() {
        this.render = new RenderEngine()
        this.grid = new Grid()
        this.render.grid = this.grid
        this.render.drawTiles()
        this.render.addEventListener()
        this.interaction = new Interactions(this.grid, this.render)
        this.interaction.addEventListeners()
        setInterval(() => {
            this.tick()
        }, 50)
    }

    tick() {
        this.tickCount = (this.tickCount || 0) + 1;
        this.grid.tick(this.tickCount)
        this.render.drawTiles()

    }

}
