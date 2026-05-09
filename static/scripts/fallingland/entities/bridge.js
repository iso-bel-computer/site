export class Bridge {
    constructor(tiles) {
        this.tiles = tiles
        this.tiles.forEach(tile => {
            tile.bridge = this
            tile.setPassable(true)
            tile.assignColour()
        })
    }

    demolish() {
        this.tiles.forEach(tile => {
            tile.bridge = null
            tile.setDefaultPassable()
            tile.assignColour()
        })

    }
}
