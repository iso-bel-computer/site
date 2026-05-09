import { getRandomInt, getRandomArbitrary, clamp } from './helpers.js';
import { config } from './config.js';

export class Human {
    constructor() {
        this.assignColour()
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

    move(tile, neighbours) {

        let nextTile = tile
        let moving = false
        let currentDesirability = config.tileTypes[tile.type]?.desirability || 0.5

        neighbours.forEach(neighbour => {

            // figuring out which neighbouring tile human would most like to go to

            if (neighbour.human) {return}

            let tileIsImpassable = config.tileTypes[neighbour.type]?.impassable || false
            if (Math.abs(tile.elevation - neighbour.elevation) > 5) {tileIsImpassable = true}

            if (tileIsImpassable) {return}

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
            tile.removeHuman(this)
            nextTile.addHuman(this)
        }

    }

}
