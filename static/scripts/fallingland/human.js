import { getRandomInt, getRandomArbitrary, clamp } from './helpers.js';
import { config } from './config.js';

export class Human {
    constructor() {
        this.assignColour()
        this.alive = true
    }

    tick() {
        this.checkTileIsSafe()
        this.move(this, this.neighbours)
    }

    checkTileIsSafe() {
        if (!this.tile.passable && Math.random() < 0.3) {
            this.die()
        }

        if (this.tile.aflame && Math.random() < 0.1) {
            this.die()
        }
    }

    die() {
        this.tile.removeHuman()
        this.alive = false

    }

    assignColour() {
        const random = Math.random()

        if (random < 0.3) {
            this.r = getRandomInt(190,210)
            this.g = getRandomInt(160,180)
            this.b = getRandomInt(130,150)
        }
        else if (random < 0.6) {
            this.r = getRandomInt(20,40)
            this.g = getRandomInt(10,30)
            this.b = getRandomInt(0,10)
        }

        else {
            this.r = getRandomInt(115,140)
            this.g = getRandomInt(60,80)
            this.b = getRandomInt(0,5)
        }
    }

    move() {

        let nextTile = this.tile
        let moving = false
        let currentDesirability = config.tileTypes[this.tile.type]?.desirability || 0.5

        this.tile.neighbours.forEach(neighbour => {

            // figuring out which neighbouring tile human would most like to go to

            if (neighbour.human) {return}
            if (!neighbour.isPassable()) {return}
            if (Math.abs(this.tile.elevation - neighbour.elevation) > 5) {return}


            let neighbourDesirability = config.tileTypes[neighbour.type]?.desirability || 0.5
            if (currentDesirability < neighbourDesirability) { // do not covet thy neighbours tile...
                nextTile = neighbour
                moving = true
            }

            // wandering if it's all grass land
            else if (currentDesirability === neighbourDesirability && Math.random() < 0.05) {
                nextTile = neighbour
                moving = true
            }
        })

        if (moving) {
            this.tile.removeHuman(this)
            nextTile.addHuman(this)
        }

    }

}
