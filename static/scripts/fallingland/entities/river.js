import { config } from '../config.js';
import { shuffleArray, getRandomInt, getRandomArbitrary  } from '../helpers.js';

export class River {
    constructor(tile) {
        this.tiles = []
        this.origin = [tile]
        tile.waterLevel = 0
        this.sourceAmount = getRandomArbitrary(0.5,2)
        this.addTile(tile)
    }

    tick() {
        const tilesToRemove = []

        this.origin.forEach(originTile => {
            originTile.waterLevel += this.sourceAmount
        })

        this.tiles.forEach(tile => {

            if (tile.snowCovered) {tile.snowCovered = false}
            if (tile.aflame)      {tile.aflame      = false}

            const spreadAmount     = config.worldBehaviour.riverSpreadSpeed

            shuffleArray(tile.neighbours)
            tile.neighbours.forEach(neighbour => {

                const neighbourSurface = neighbour.waterLevel + neighbour.elevation
                const tileSurface      = tile.waterLevel      + tile.elevation
                neighbour.waterLevel ??= 0

                if (neighbourSurface < tileSurface && tile.waterLevel > 0) {

                    tile.waterLevel -= spreadAmount

                    if (neighbour.elevation > 0) { // rivers flow into the sea
                        neighbour.waterLevel += spreadAmount
                    }

                    if (neighbour.elevation < tile.elevation) {
                        this.erode(tile) // only erode if water is actually flowing downhill
                    } else {
                        this.sediment(neighbour)
                    }

                    if (neighbour.waterLevel > 0.03) {

                        if (neighbour.type !== 'water' && neighbour.type !== 'tree'
                           || neighbour.type === 'tree' && Math.random() < 0.05) {

                            this.addTile(neighbour)
                        }
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
        if (!this.tiles.includes(tile)) {
            tile.previousType = tile.type
            tile.changeTileType('water')
            tile.removalTimer = null
            this.tiles.push(tile)
        }
    }

    removeTile(tile) {
        if (this.origin.includes(tile)) {return}
        if (tile.isTileSurroundedBySameType()) {return}
        const index = this.tiles.indexOf(tile)

        if (!tile.removalTimer) {tile.removalTimer = getRandomInt(3,10)}
        else (tile.removalTimer--)

        if (tile.removalTimer === 0) {
            if (index !== -1) {
                this.tiles.splice(index, 1)

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


    }

    erode(tile) {
        const baseChance = 0.001
        if (Math.random() < baseChance && tile.elevation > 3) {
            const erosionChance = config.tileTypes[tile.previousType]?.erosionChance || 0.2
            if (Math.random() < erosionChance) {
                tile.elevation = tile.elevation - 1
            }
        }
    }

    sediment(tile) {
        const baseChance = 0.0001
        if (Math.random() < baseChance)  {
            const sedimentationChance = config.tileTypes[tile.previousType]?.sedimentationChance || 0.1
            if (Math.random() < sedimentationChance) {
                tile.elevation = tile.elevation + 1
            }
        }
    }
}
