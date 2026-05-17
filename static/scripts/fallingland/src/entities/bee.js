import { getRandomInt } from '../helpers.js';
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

    setMovementVector() { // bees will move in a random specific direction, with slight variety,
                          // if they don't know where any flowers etc are
        this.vector.x = getRandomInt(-1, 1)
        this.vector.y = getRandomInt(-1, 1)

    }

    tick() {
        this.collectPollen()
        this.spreadPollen()
    }

    collectPollen() {
        this.tile.neighbours.forEach(neighbour => {
            const pollen = config.tileTypes?.[neighbour.type]?.beesWillSpread
            if (pollen) {
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

        }
    }


    move() {

        let nextTile = this.tile

        const lookingForMoreFertileLand = (this.tile.fertility < 0.2)
        if (lookingForMoreFertileLand) { // this sucks !

            this.tile.neighbours.forEach(neighbour => {
                if (neighbour.fertility > nextTile.fertility) {
                    nextTile = neighbour
                }
            })
        }

        else {
            if (Math.random() < 0.4) { // idle behaviour
                this.setMovementVector()
            }

            let foundAcceptableTile
            let i = 0
            while (!foundAcceptableTile) {
                nextTile = this.tile.neighbours.find(tile =>
                    tile.x === this.tile.x + this.vector.x &&
                    tile.y === this.tile.y + this.vector.y
                )

                if (nextTile.fertility > 0.3 && nextTile.type != 'water' || i > 5) {
                    foundAcceptableTile = true
                }

                else {
                    this.setMovementVector()
                    i++
                }
            }
        }


        return nextTile

    }

}
