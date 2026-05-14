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
            "baseAmount": getRandomArbitrary(0.4,1.5),
            "pulseOffset": getRandomInt(0,50)
        })
        this.addTile(tile)
    }

    tick(tickNumber) {
        const tilesToRemove = []

        this.origin.forEach(originTile => {
            originTile.tile.waterLevel += originTile.baseAmount
        })

        this.tiles.forEach(tile => {
            tile.newLevel = tile.waterLevel
            tile.amountTransferred = 0
        })

        this.tiles.forEach(tile => {

            if (tile.snowCovered) {tile.snowCovered = false}
            if (tile.aflame)      {tile.aflame      = false}

            const lowerTiles = []

            tile.immediateNeighbours.forEach(neighbour => {

                if (!this.origin.some(o => o.tile === neighbour)) {
                    neighbour.waterLevel ??= 0
                    const neighbourSurface = neighbour.waterLevel + neighbour.elevation
                    const tileSurface      = tile.waterLevel      + tile.elevation

                    if (neighbourSurface < tileSurface && tile.waterLevel > 0) {
                        lowerTiles.push(neighbour)
                    }

                }
            })


            this.calculateWaterTransfer(tile, lowerTiles)


        })

        this.tiles.forEach(tile => {

            tile.waterLevel = tile.newLevel
            if (tile.elevation < 1) {tile.waterLevel = 0} // sea drainage
        })

        this.tiles.forEach(tile => {

            tile.numberOfTransfers = tile.numberOfTransfers + 1 || 0
            tile.averageTransfer   = (((tile.averageTransfer * tile.numberOfTransfers) + tile.amountTransferred) / tile.numberOfTransfers) || tile.amountTransferred

            if (tile.amountTransferred > 0.15) {
                this.erode(tile, tile.amountTransferred)

                const dryNeighbours = []
                tile.neighbours.forEach(neighbour => {
                    if (neighbour.type != 'water') {dryNeighbours.push(neighbour)}
                })

                dryNeighbours.forEach(neighbour => {
                    this.erode(neighbour, tile.amountTransferred / dryNeighbours.length)
                })

            }

            if (tile.amountTransferred < 0.1){
                this.sediment(tile)
            }

            if (tile.waterLevel < 0.1) {
                tilesToRemove.push(tile)
            }

            this.evaporate(tile)
        })


        tilesToRemove.forEach(tile => {
            this.removeTile(tile)
        })
    }

    calculateWaterTransfer(sourceTile, lowerTiles) {

        const lowerTilesLevels = lowerTiles.reduce((sum, tile) => sum + tile.waterLevel, 0)

        const totalSurface = (sourceTile.waterLevel + sourceTile.elevation)
            + lowerTiles.reduce((sum, t) => sum + t.waterLevel + t.elevation, 0)
        const targetSurface = totalSurface / (lowerTiles.length + 1)
        const targetLevel = targetSurface - sourceTile.elevation

        const amountToTransfer = Math.min(sourceTile.waterLevel - targetLevel, sourceTile.waterLevel)

        lowerTiles.forEach(lowerTile => {
            const share = lowerTilesLevels === 0
                ? amountToTransfer / lowerTiles.length
                : (lowerTile.waterLevel / lowerTilesLevels) * amountToTransfer

            if (share > 0.01 || ((sourceTile.elevation - lowerTile.elevation > 1))) {
                this.addTile(lowerTile)
                lowerTile.newLevel = (lowerTile.newLevel ?? 0) + share
            }
            // else {
            //     sourceTile.newLevel = sourceTile.newLevel + share /// i'm pretty sure this is the culprit
            // }
        })

        sourceTile.newLevel = (sourceTile.newLevel ?? sourceTile.waterLevel) - amountToTransfer
        sourceTile.amountTransferred = amountToTransfer
        if (sourceTile.amountTransferred > 10) {
            console.warn('Water spiking. wtf????')
        }

    }

    evaporate(tile) {
        tile.waterLevel = tile.waterLevel - config.worldBehaviour.waterEvaporationRate

    }
 
    addTile(tile) {
        if (tile.type != 'water') {
            tile.previousType = tile.type
            tile.changeTileType('water')
        }
        tile.removalTimer = null
        this.tiles.add(tile)
    }

    removeTile(tile) {

        if (this.origin.some(o => o.tile === tile)) { return } // dont remove water sources
        // if (tile.isTileSurroundedBySameType()) {return} // don't remove tiles in the middle of a river


        if (!tile.removalTimer) {
            tile.removalTimer = 2
        }

        else {
            tile.removalTimer--
        }

        if (tile.removalTimer === 0 && tile.waterLevel < 0.1) {
            this.tiles.delete(tile)

            if ((Math.random() < 0.5 && tile.previousType != 'stone')) {
                tile.changeTileType('mud')
            }

            else {
                tile.changeTileType(tile.previousType)
            }
            tile.waterLevel = 0

        }


    }

    erode(tile, transfer) {
        const erosionChance = config.tileTypes[tile.previousType]?.erosionChance || 0.2
        if (Math.random() < erosionChance && tile.elevation > 3) {

            const erosionMultiplier = 0.1 * transfer
            const erosionConstant = 0.5

            tile.elevation = tile.elevation - (erosionConstant * erosionMultiplier)
            tile.amountEroded = (tile.amountEroded ?? 0) + (erosionConstant * erosionMultiplier)

            if (Math.random() < 0.005) {tile.previousType = 'stone'} // finding stone at bottom of river bed
                                                                     // to make erosion slower
            if (tile.type === 'tree' && Math.random() < 0.001) {
                tile.elevation = tile.elevation - getRandomArbitrary(3,6)
                tile.changeTileType('grass')
            }
        }
    }

    sediment(tile) {
        const baseChance = 0.1
        if (Math.random() < baseChance && tile.waterLevel < 8) {

            const sedMultiplier = 0.01 * tile.waterLevel
            const sedConstant = 0.08

            tile.elevation = tile.elevation + (sedConstant * sedMultiplier)
            tile.amountSedimented = (tile.amountSedimented ?? 0) + (sedConstant * sedMultiplier)
            tile.fertility = tile.fertility + (sedConstant * sedMultiplier) / 25
        }
    }
}
