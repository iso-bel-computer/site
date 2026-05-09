export class Bridge {
    constructor(tiles) {
        this.tiles = tiles
    }

    demolish() {
        this.tiles.forEach(tile => {
            tile.bridge = null
            tile.assignColour()
        })

    }
}
