import { getRandomInt, getRandomDirection } from '../helpers.js';
import { config } from '../config.js';

export class Bee {
    constructor() {
        this.assignColour()
        this.alive = true
        this.pollenStored = new Set()
        this.vector = {"x": 0,"y": 0}
    }

    assignColour() {
        if (Math.random() < 0.5) {
            this.r = getRandomInt(210, 220)
            this.g = getRandomInt(210, 220)
            this.b = getRandomInt(25,  35)
        } else {
            this.r = getRandomInt(0, 10)
            this.g = getRandomInt(0, 10)
            this.b = getRandomInt(0, 10)
        }
    }

    tick() {
        this.collectPollen()
        this.spreadPollen()
    }

    collectPollen() {
        this.tile.neighbours.forEach(neighbour => {
            const pollen = config.tileTypes?.[neighbour.type]?.beesWillSpread
            if (pollen && Math.random() < 0.3) {
                this.pollenStored.add(neighbour.type)
            }
        })
    }

    spreadPollen() {
        if (this.pollenStored.size > 0 && Math.random() < config.worldBehaviour.beePropogationRate) {

            const randomPollen = this.pollenStored.values().next().value
            const randomTile = this.tile.extendedNeighbours[getRandomInt(0, this.tile.extendedNeighbours.length - 1)]

            if (randomTile.type === 'grass' && randomPollen != 'grass') {
                randomTile.changeTileType(randomPollen)
            }

            if (randomPollen === 'grass') {
                const grassCanSpreadToTile = config.tileTypes?.[randomTile.type]?.grassRegrowthSpeed
                if (grassCanSpreadToTile) {
                    randomTile.changeTileType(randomPollen)
                }
            }

            if (Math.random() < 0.3) { // bees can spread pollen maybe 3 or 4 times before having to refresh it
                this.pollenStored.delete(randomPollen)
            }
        }
    }


    move() {

        let nextTile = this.tile

        if (Math.random() < 0.4) { // idle behaviour
            this.vector = getRandomDirection()
        }

        let foundAcceptableTile
        let i = 0
        while (!foundAcceptableTile) {
            nextTile = this.tile.neighbours.find(tile =>
                tile.x === this.tile.x + this.vector.x &&
                tile.y === this.tile.y + this.vector.y
            )

            if (i > 5 ||
                nextTile &&
                nextTile.fertility > 0.3 &&
                nextTile.type !== 'water'
               ) {
                foundAcceptableTile = true
            }

            else {
                this.vector = getRandomDirection()
                i++
            }
        }

        return nextTile

    }

}
