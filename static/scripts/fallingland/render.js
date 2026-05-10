import { config } from './config.js';

export class RenderEngine {

    constructor() {
        this.canvas = document.getElementById('game')
        this.ctx = this.canvas.getContext('2d')
        this.pixelScale = 4
        this.resizeCanvas()
        const rect = this.canvas.getBoundingClientRect();
        this.viewW = rect.width;
        this.viewH = rect.height;
        this.displayLoading()
        this.centerPixel = [0,0]
        this.scrollVertical = 0
        this.scrollHorizontal = 0
        this.scrollSpeed = 1
        this.viewSettings = {
            'drawContourLines': true,
            'drawGridLines': true,
            'tintBelowSeaLevel': true,
        }

        // In constructor, create an offscreen canvas at world size
        this.offscreen = document.createElement('canvas');
        this.offscreen.width = config.gameSettings.canvasWidth * this.pixelScale;
        this.offscreen.height = config.gameSettings.canvasHeight * this.pixelScale;
        this.offscreenCtx = this.offscreen.getContext('2d');
        this.imageData = this.offscreenCtx.createImageData(
            this.offscreen.width,
            this.offscreen.height
        );
        this.data = this.imageData.data;

    }

    resizeCanvas() {
        this.dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.viewW = rect.width;
        this.viewH = rect.height;
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
    }
    writeTileToBuffer(tile) {
        let [r, g, b] = tile.colour;
        if (this.viewSettings.drawContourLines) {
            let contourThickness = config.viewSettings.contourThickness
            if (tile.elevation > 15) {
                const nearContour = Math.abs(tile.elevation) % config.viewSettings.contourInterval < contourThickness;
                if (nearContour) {
                    r = Math.min(r - 50, 255)
                    g = Math.min(g - 50, 255)
                    b = Math.min(b - 50, 255)
                }
            }
        }
        if (this.viewSettings.drawGridLines) {
            if (   (tile.x - config.viewSettings.gridOffset) % config.viewSettings.gridInterval === 0
                || (tile.y - config.viewSettings.gridOffset) % config.viewSettings.gridInterval === 0) {
                r = Math.max(r - 50, 0)
                g = Math.max(g - 35, 0)
                b = Math.max(b - 15, 0)
            }
        }
        if (this.viewSettings.tintBelowSeaLevel) {
            if (tile.elevation < 1 && tile.type != 'water') {
                r = Math.max(r - Math.abs(Math.min(tile.elevation, -10) * 3), 0)
                g = Math.max(g - Math.abs(Math.min(tile.elevation, -10) * 3), 0)
                b = Math.max(b - Math.abs(Math.min(tile.elevation, -10) * 3), 0)
            }
        }

        for (let dx = 0; dx < this.pixelScale; dx++) {
            for (let dy = 0; dy < this.pixelScale; dy++) {
                const px = tile.x * this.pixelScale + dx;
                const py = tile.y * this.pixelScale + dy;
                const index = (py * this.imageData.width + px) * 4;
                this.data[index]     = r;
                this.data[index + 1] = g;
                this.data[index + 2] = b;
                this.data[index + 3] = 255;
            }
        }
    }
    drawTiles() {


        // scroll
        if (this.scrollVertical)   this.centerPixel[1] += this.scrollVertical * this.scrollSpeed;
        if (this.scrollHorizontal) this.centerPixel[0] += this.scrollHorizontal * this.scrollSpeed;
        this.centerPixel[0] = Math.min(0, Math.max(-config.gameSettings.canvasWidth + Math.ceil(this.viewW / this.pixelScale), this.centerPixel[0]));
        this.centerPixel[1] = Math.min(0, Math.max(-config.gameSettings.canvasHeight + Math.ceil(this.viewH / this.pixelScale), this.centerPixel[1]));


        let anyDirty = false;
        for (const tile of this.grid.tiles) {
            if (tile.dirty) {
                this.writeTileToBuffer(tile);
                tile.dirty = false;
                anyDirty = true;
            }
        }

        // commit buffer to offscreen canvas
        if (anyDirty) {
            this.offscreenCtx.putImageData(this.imageData, 0, 0);
        }

        // blit the visible window from offscreen to main canvas
        const viewW = this.viewW;
        const viewH = this.viewH;
        const srcX = -this.centerPixel[0] * this.pixelScale;
        const srcY = -this.centerPixel[1] * this.pixelScale;

        // source is in physical offscreen pixels, destination is CSS pixels
        // ctx is already scaled by DPR so just use CSS pixel dimensions here
        this.ctx.clearRect(0, 0, this.viewW, this.viewH);
        this.ctx.drawImage(
            this.offscreen,
            srcX, srcY, this.viewW * this.dpr, this.viewH * this.dpr,  // read DPR-sized chunk from offscreen
            0, 0, this.viewW, this.viewH                                 // draw to CSS-sized destination
        );

        window.requestAnimationFrame(() => this.drawTiles());
    }
    rebuildBuffer() {
        this.offscreen.width = config.gameSettings.canvasWidth * this.pixelScale;
        this.offscreen.height = config.gameSettings.canvasHeight * this.pixelScale;
        this.imageData = this.offscreenCtx.createImageData(
            this.offscreen.width,
            this.offscreen.height
        );
        this.data = this.imageData.data;

        // mark everything dirty so it all redraws
        for (const tile of this.grid.tiles) {
            tile.dirty = true;
        }
    }


    setZoomLevel(amount) {
        this.pixelScale = this.pixelScale + amount;
        console.log(this.pixelScale)
        if (this.pixelScale < config.viewSettings.minZoom) this.pixelScale = config.viewSettings.minZoom;
        if (this.pixelScale > config.viewSettings.maxZoom) this.pixelScale = config.viewSettings.maxZoom;
        this.rebuildBuffer();
    }
    displayLoading() {
        const w = this.viewW;
        const h = this.viewH;
        this.ctx.font = "bold 48px serif";
        this.ctx.fillStyle = "#000";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Loading...", w / 2, h / 2);
    }
    getTile(pixelX, pixelY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((pixelX - rect.left) * this.dpr / this.pixelScale) - this.centerPixel[0];
        const y = Math.floor((pixelY - rect.top) * this.dpr / this.pixelScale) - this.centerPixel[1];
        return this.grid.tileMap.get(`${x},${y}`);
    }
    addEventListener() {

        document.addEventListener('keydown', (e) => {
            e.preventDefault()
            if (e.key === 'w' || e.key === 'ArrowUp') {this.scrollVertical = 1}
            if (e.key === 's' || e.key === 'ArrowDown') {this.scrollVertical = -1}
            if (e.key === 'a' || e.key === 'ArrowLeft') {this.scrollHorizontal = 1}
            if (e.key === 'd' || e.key === 'ArrowRight') {this.scrollHorizontal = -1}
            if (e.key === '+' || e.key === '=') {this.setZoomLevel(1)}
            if (e.key === '-' || e.key === '_') {this.setZoomLevel(-1)}
            if (e.key === 'Shift') {this.scrollSpeed = 3}
        })
        document.addEventListener('keyup', (e) => {
            if (e.key === 'w'
            || e.key === 'ArrowUp'
            || e.key === 's'
            || e.key === "ArrowDown")
                {this.scrollVertical = 0}

            if (e.key === 'a'
            || e.key === 'ArrowLeft'
            || e.key === 'd'
            || e.key === "ArrowRight")
                {this.scrollHorizontal = 0}
            if (e.key === 'Shift') {
                this.scrollSpeed = 1
            }

        })

    }


}
