import { getRandomInt, getRandomArbitrary, clamp } from './helpers.js';
import { Human } from './human.js';
import { config } from './config.js';

export class Interactions {
    constructor(grid, render) {
        this.grid = grid
        this.render = render
        this.game = document.getElementById('game')
        this.brushSelection = document.getElementById('brushSelection')
        this.earthDisplay = document.getElementById('amountOfEarth')
        this.tileInfoDisplay = document.getElementById('tileInfoDisplay')
        this.earth = 0
        this.brushSize = 5
    }

    addEventListeners() {
        this.brushSelection.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectedBrush = button.dataset.brush
                this.brushSelection.querySelectorAll('button').forEach(otherButton => {
                    otherButton.classList.remove('active')
                })
                button.classList.add('active')
            })
        })

        this.game.addEventListener('mousemove', (e) => {
            const tile = this.render.getTile(e.clientX, e.clientY)
            if (tile) {
                if (tile != this.prevTile) {
                    this.prevTile = tile
                    this.updateTileInfo(tile)
                }
            }
        })

        this.game.addEventListener('click', (e) => {
            const tile = this.render.getTile(e.clientX, e.clientY)
            if (tile) {

                console.log('SELECTED TILE: ', tile)

                if (this.selectedBrush === 'fire') {
                    this.addFire(tile)
                }
                if (this.selectedBrush === 'tree') {
                    this.addTree(tile)
                }
                if (this.selectedBrush === 'land') {
                    this.addLand(tile)
                }
                if (this.selectedBrush === 'excavate') {
                    this.excavate(tile)
                }
                if (this.selectedBrush === 'human') {
                    this.addPerson(tile)
                }
                if (this.selectedBrush === 'flower') {
                    this.addFlower(tile)
                }
                if (this.selectedBrush === 'bridge') {
                    this.addBridge(tile)
                }
            }

        });
    }


    addFire(tile) {
        if (config.tileTypes[tile.type]?.flammability) {
            tile.aflame = true
        }
    }

    addFlower(tile) {


        const coords = this.grid.generateBlob(tile.x, tile.y, this.brushSize)

        coords.forEach(coord => {
            const tile = this.grid.getTile(coord[0], coord[1])
            if (tile) {
                if ((tile.type === 'grass' || tile.type === 'mud') && Math.random() < 0.1) {
                    tile.changeTileType('flower')
                }
            }
        })
    }

    addBridge(tile) {

        if (!this.firstBridgePoint) {this.firstBridgePoint = tile}
        else {

            const bridgeStart = this.firstBridgePoint
            const bridgeEnd   = tile

            this.firstBridgePoint = null

            const x0 = bridgeStart.x
            const y0 = bridgeStart.y
            const x1 = bridgeEnd.x
            const y1 = bridgeEnd.y

            const tiles1 = this.grid.getLineOfTiles(x0,y0,x1,y1)
            const tiles2 = this.grid.getLineOfTiles(x0 + 1,y0 + 1,x1 + 1,y1 + 1)
            const tiles3 = this.grid.getLineOfTiles(x0 + 1,y0,x1 + 1,y1)
            const bridgeTiles = [...new Set([...tiles1, ...tiles2, ...tiles3])];

            let buildBridge = true

            if (bridgeStart.type === 'water' || bridgeEnd.type === 'water') {
                buildBridge = false
                console.warn('Bridge over ... water')
            }

            // check if bridge is valid
            if (bridgeTiles.length > (config.gameplay.maxBridgeLength)) {
                buildBridge = false
                console.warn('Bridge too long')
            }


            bridgeTiles.forEach(tile => {
                if (tile.elevation > bridgeStart.elevation + 5
                || tile.elevation > bridgeEnd.elevation + 5) {
                    buildBridge = false
                    console.warn('Bridge over high terrain', tile.elevation, bridgeStart.elevation, bridgeEnd.elevation)
                }

                if (tile.bridge) {
                    buildBridge = false
                    console.warn('Bridge intersects another bridge')
                }
            })

            if (buildBridge) {
                this.grid.addBridge(bridgeTiles)
            }

        }

    }

    addTree(tile) {
        if (tile.type === 'grass') {
            const treeCoords = this.grid.generateBlob(tile.x,tile.y,getRandomInt(2,3))
            treeCoords.forEach(coord => {
                const tile = this.grid.getTile(coord[0], coord[1])
                if (tile.type === 'water') return
                tile.type = 'tree'
                tile.assignColour()
            })

        } 
    }

    addLand(tile) {

        const coords = this.grid.generateBlob(tile.x, tile.y, getRandomInt(4,7))
        coords.forEach(coord => {
            if (this.earth < 1) {return}
            const tile = this.grid.getTile(coord[0], coord[1])
            tile.elevation = tile.elevation + 1
            if (tile.elevation > 0) {
                if (Math.random() < 0.05) {
                    tile.changeTileType('stone')
                }
                else {
                    tile.changeTileType('mud')
                }
            }
            tile.assignColour()
            this.earth--
        })
        this.displayEarthAmount()
        this.updateTileInfo(tile)

    }

    excavate(tile) {
        const coords = this.grid.generateBlob(tile.x, tile.y, getRandomInt(4,7))
        coords.forEach(coord => {
            const tile = this.grid.getTile(coord[0], coord[1])
            if (tile.type === 'water') {return}
            tile.elevation = tile.elevation - 1
            tile.changeTileType('mud')
            if (tile.bridge) {tile.bridge.demolish()}
            this.earth++
        })
        this.updateTileInfo(tile)
        this.displayEarthAmount()
    }

    displayEarthAmount() {

        this.earthDisplay.innerHTML = `${Math.floor(this.earth / 30)} dirt`
    }

    addPerson(tile) {
        tile.addHuman(new Human())
    }


    updateTileInfo(tile) {
        const fire = tile.aflame ? 'fire' : ''
        const human = tile.human ? 'human' : ''
        const snow = tile.snowCovered ? 'snow' : ''
        const bridge = tile.bridge ? 'bridge' : ''
            this.tileInfoDisplay.innerHTML = `
                <div class='${tile.type} tileLabel ${fire} ${human} ${snow} ${bridge}'>
                    ${tile.type} ${fire} ${human} ${snow} ${bridge}
                </div>
                ${tile.x}x ${tile.y}y<br>
                ${Math.floor(tile.elevation)} ft<br>
            `

    }

}
