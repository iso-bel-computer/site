import { Grid } from './grid.js';
import { config } from './config.js';
import { RenderEngine } from './render.js';
import { EntityManager } from './entities/entityManager.js';
import { Interactions } from './interaction.js';
import { GameState } from './gamestate.js';

export class gameClass {
    constructor() {

        this.tickCount = 0
        this.render = new RenderEngine()
        this.state = new GameState()
        this.grid = new Grid(this.state)
        this.entities = new EntityManager(this.grid, this.state)
        this.render.grid = this.grid
        this.render.drawTiles()
        this.render.setZoomLevel(5)
        this.render.addEventListener()
        this.interaction = new Interactions(this.grid, this.render, this.entities)
        this.interaction.addEventListeners()
        setInterval(() => {
            this.tick()
        }, config.gameSettings.timeBetweenTicks) // default is 50
        this.toggleLoadingMessage()
    }


    tick() {
        this.tickCount = this.tickCount + 1;
        this.entities.tick(this.tickCount)
        this.grid.tick(this.tickCount)
        this.interaction.tick()
        if (this.tickCount % 50 === 0) {
            console.log("Tick: ", this.tickCount)
        }

    }

    toggleLoadingMessage() {

        document.getElementById('controls').hidden =       false
        document.getElementById('loadingMessage').hidden = true

    }

}
