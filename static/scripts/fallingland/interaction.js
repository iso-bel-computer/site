export class Interactions {
    constructor(grid, render) {
        this.grid = grid
        this.render = render
    }

    addEventListeners() {
        document.addEventListener('keydown', (e) => {
            console.log(e)
            if (e.key === 'f') {this.selectedBrush = 'fire'}
            if (e.key === 't') {this.selectedBrush = 'tree'}
            if (e.key === 'l') {this.selectedBrush = 'land'}
            if (e.key === 'e') {this.selectedBrush = 'excavate'}
            this.render.selectedBrush = this.selectedBrush
        })
        document.addEventListener('click', (e) => {
            const tile = this.render.getTile(e.clientX, e.clientY)
            if (tile) {
                if (this.selectedBrush === 'fire') {
                    tile.aflame = true
                }
                if (this.selectedBrush === 'tree') {
                    this.grid.addTree(tile.x, tile.y)
                }
                if (this.selectedBrush === 'land') {
                    this.grid.addLand(tile.x, tile.y)
                }
                if (this.selectedBrush === 'excavate') {
                    this.grid.excavate(tile.x, tile.y)
                }
            }

        });
    }
}
