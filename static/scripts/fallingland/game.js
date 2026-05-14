import { Grid } from './grid.js';
import { config } from './config.js';
import { RenderEngine } from './render.js';
import { EntityManager } from './entities/entityManager.js';
import { Interactions } from './interaction.js';

export class gameClass {
    constructor() {

        this.tickCount = 0
        this.render = new RenderEngine()
        // this.entityManager = new EntityManager()
        this.grid = new Grid()
        this.render.grid = this.grid
        this.render.drawTiles()
        this.render.setZoomLevel(5)
        this.render.addEventListener()
        this.interaction = new Interactions(this.grid, this.render, this.entityManager)
        this.interaction.addEventListeners()
        setInterval(() => {
            this.tick()
        }, config.gameSettings.timeBetweenTicks) // default is 50
        this.toggleLoadingMessage()
    }


    tick() {
        this.tickCount = this.tickCount + 1;
        this.grid.tick(this.tickCount)
        this.interaction.tick()
        // this.entityManager.tick(this.tickCount)
        if (this.tickCount % 50 === 0) {
            console.log("Tick: ", this.tickCount)
        }

    }

    toggleLoadingMessage() {

        document.getElementById('controls').hidden =       false
        document.getElementById('loadingMessage').hidden = true

    }

}
