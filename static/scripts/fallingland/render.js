import { config } from './config.js';

export class RenderEngine {

    constructor() {
        this.canvas = document.getElementById('game')
        this.ctx = this.canvas.getContext('2d')
        this.pixelScale = 4
        this.displayLoading()
        this.tileInfoDisplay = document.getElementById('tileInfoDisplay')
        this.resizeCanvas()
        this.centerPixel = [0,0]
        this.viewSettings = {
            'drawContourLines': true,
            'drawGridLines': true,
            'tintBelowSeaLevel': true,
        }

    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
    }
    drawTiles() {
        const imageData = this.ctx.createImageData(
            config.gameSettings.canvasWidth * this.pixelScale,
            config.gameSettings.canvasHeight * this.pixelScale
        );
        const data = imageData.data; // flat Uint8ClampedArray [r,g,b,a, r,g,b,a, ...]

        this.grid.tiles.forEach(tile => {
            let [r, g, b] = tile.colour;
            if (this.viewSettings.drawContourLines) {
                let contourThickness = 4
                if (tile.elevation > 10) {
                    const nearContour = Math.abs(tile.elevation) % config.viewSettings.contourInterval < contourThickness;
                    if (nearContour) {
                        r = Math.max(r - 100, 0)
                        g = Math.max(g - 70, 0)
                        b = Math.max(b - 100, 0)
                    }
                }
            }
            if (this.viewSettings.drawGridLines) {
                if (   (tile.x - config.viewSettings.gridOffset) % config.viewSettings.gridInterval === 0
                    || (tile.y - config.viewSettings.gridOffset) % config.viewSettings.gridInterval === 0) {
                    r = Math.max(r - 50, 0)
                    g = Math.max(g - 50, 0)
                    b = Math.max(b - 50, 0)
                }
            }
            if (this.viewSettings.tintBelowSeaLevel) {
                if (tile.elevation < -1 && tile.type != 'water') {
                    r = Math.max(r - Math.abs(tile.elevation * 3), 0)
                    g = Math.max(g - Math.abs(tile.elevation * 3), 0)
                    b = Math.max(b - Math.abs(tile.elevation * 5), 0)
                }
            }
            // fill a size x size block of pixels for each tile
            for (let dx = 0; dx < this.pixelScale; dx++) {
                for (let dy = 0; dy < this.pixelScale; dy++) {
                    const px = ((tile.x + this.centerPixel[0]) * this.pixelScale + dx);
                    const py = ((tile.y + this.centerPixel[1]) * this.pixelScale + dy);
                    if (px > 1000 || px < 0 || py > 1000 || py < 0) {return}
                    const index = (py * imageData.width + px) * 4;
                    data[index]     = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                    data[index + 3] = 255;
                }
            }
        });

        this.ctx.putImageData(imageData, 0, 0);
    }

    displayLoading() {
        this.ctx.font = "bold 48px serif";

        this.ctx.fillText("Loading...", 100, 100);

    }

    getTile(pixelX, pixelY) {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((pixelX - rect.left) * dpr / this.pixelScale) - this.centerPixel[0];
        const y = Math.floor((pixelY - rect.top) * dpr / this.pixelScale) - this.centerPixel[1];
        const tile = this.grid.tileMap.get(`${x},${y}`);
        return tile
    }

    addEventListener() {



        this.canvas.addEventListener('mousemove', (e) => {
            const tile = this.getTile(e.clientX, e.clientY)
            if (tile) {
                if (tile != this.prevTile) {
                    this.prevTile = tile
                    const fire = tile.aflame ? 'fire' : ''
                        this.tileInfoDisplay.innerHTML = `
                            <div class='${tile.type} tileLabel ${fire}'>${tile.type} ${fire}</div>
                            ${tile.x}x ${tile.y}y<br>
                            ${Math.floor(tile.elevation)} ft<br>
                            selected: ${this.selectedBrush}<br>
                            'f' for fire. 't' for tree. l for land. e for excavate.
                        `
                };
            }
        });
        // this.canvas.addEventListener('click', (e) => {
        //     const tile = this.getTile(e.clientX, e.clientY)
        //     if (tile) {
        //         const halfW = Math.floor((this.canvas.width) / this.pixelScale / 2);
        //         const halfH = Math.floor((this.canvas.height) / this.pixelScale / 2);
        //         this.centerPixel = [halfW - tile.x, halfH - tile.y];
        //         this.drawTiles()
        //     }

        // });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'w' || e.key === 'ArrowUp') {this.centerPixel[1] = this.centerPixel[1] + 3}
            if (e.key === 's' || e.key === 'ArrowDown') {this.centerPixel[1] = this.centerPixel[1] - 3}
            if (e.key === 'a' || e.key === 'ArrowLeft') {this.centerPixel[0] = this.centerPixel[0] + 3}
            if (e.key === 'd' || e.key === 'ArrowRight') {this.centerPixel[0] = this.centerPixel[0] - 3}
            if (e.key === '+' || e.key === '=') {this.setZoomLevel(1)}
            if (e.key === '-' || e.key === '_') {this.setZoomLevel(-1)}
            this.drawTiles()
        })

    }

    setZoomLevel(amount) {
        this.pixelScale = this.pixelScale + amount
        if (this.pixelScale < config.viewSettings.minZoom) {this.pixelScale = config.viewSettings.minZoom}
        if (this.pixelScale > config.viewSettings.maxZoom) {this.pixelScale = config.viewSettings.maxZoom}
    }

}
