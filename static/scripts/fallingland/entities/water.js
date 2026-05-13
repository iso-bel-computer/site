import { config } from '../config.js';
import { shuffleArray, getRandomInt, getRandomArbitrary  } from '../helpers.js';

export class WaterManager {
    constructor() {
        this.tiles = new Set()
        this.origin = []
    }

    addOrigin(tile) {
        tile.waterLevel = 0
        this.origin.push({
            "tile": tile,
            "baseAmount": getRandomArbitrary(0.5,5)
        })
        this.addTile(tile)
    }

    tick(tickNumber) {
        const tilesToRemove = []
        const sineMultiplier = 1 + Math.sin(tickNumber * 0.1) // oscillates between 0 and 2

        this.origin.forEach(originTile => {
            originTile.tile.waterLevel += originTile.baseAmount * sineMultiplier
        })

        this.tiles.forEach(tile => {

            if (tile.snowCovered) {tile.snowCovered = false}
            if (tile.aflame)      {tile.aflame      = false}

            shuffleArray(tile.neighbours)

            const lowerTiles = []

            tile.neighbours.forEach(neighbour => {

                neighbour.waterLevel ??= 0
                const neighbourSurface = neighbour.waterLevel + neighbour.elevation
                const tileSurface      = tile.waterLevel      + tile.elevation

                if (neighbourSurface < tileSurface && tile.waterLevel > 0) {
                    lowerTiles.push(neighbour)
                }
            })

            lowerTiles.forEach(neighbour => {

                const transfer = tile.waterLevel / lowerTiles.length // this is the bit that i wanna change

                tile.waterLevel -= transfer

                if (neighbour.elevation > 0) { // rivers flow into the sea
                    neighbour.waterLevel += transfer
                }

                if (neighbour.elevation < tile.elevation) {
                    this.erode(tile, transfer) // only er1ode if water is actually flowing downhill
                }

                if (Math.random() < 0.1) {
                    this.erode(neighbour, Math.min(transfer * 0.5, 1))
                }

                if (neighbour.waterLevel > 0.01) {

                    if (neighbour.type !== 'water' && neighbour.type !== 'tree'
                        || neighbour.type === 'tree' && Math.random() < 0.05) {

                        this.addTile(neighbour)
                    }
                }
            })



            /// to do - make tiles waterlogged to take water out of the system that way

            if (tile.waterLevel < 0.1) {
                tilesToRemove.push(tile)
            }
        })

        tilesToRemove.forEach(tile => {
            this.removeTile(tile)
        })
    }

    addTile(tile) {
        tile.previousType = tile.type
        tile.changeTileType('water')
        tile.removalTimer = null
        this.tiles.add(tile)
    }

    removeTile(tile) {

        if (this.origin.some(o => o.tile === tile)) { return } // dont remove water sources
        // if (tile.isTileSurroundedBySameType()) {return} // don't remove tiles in the middle of a river


        if (!tile.removalTimer) {
            tile.removalTimer = getRandomInt(5,8)
        }

        else {
            tile.removalTimer--
        }

        if (tile.removalTimer === 0) {
            this.tiles.delete(tile)
            this.sediment(tile)

            if (Math.random() < 0.3 && tile.previousType != 'stone') {
                tile.changeTileType('mud')
            }
            else {
                tile.changeTileType(tile.previousType)
            }
            this.sediment(tile)
            tile.waterLevel = 0

        }


    }

    erode(tile, transfer) {
        if (tile.elevation > 3) {
            const erosionChance = config.tileTypes[tile.previousType]?.erosionChance || 0.2
            if (Math.random() < erosionChance) {
                tile.elevation = tile.elevation - (0.01 * transfer)
            }
        }
    }

    sediment(tile) {
        const baseChance = 0.1
        if (Math.random() < baseChance)  {
            const sedimentationChance = config.tileTypes[tile.previousType]?.sedimentationChance || 0.1
            if (Math.random() < sedimentationChance) {
                tile.elevation = tile.elevation + 0.01
            }
        }
    }
}
