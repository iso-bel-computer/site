import { config } from './config.js';

export class RenderEngine {

    constructor() {
        this.crosshairTiles = []
        this.canvas = document.getElementById('game')
        this.ctx = this.canvas.getContext('2d')
        this.pixelScale = 4
        this.resizeCanvas()
        const rect = this.canvas.getBoundingClientRect();
        this.viewW = rect.width;
        this.viewH = rect.height;
        this.displayLoading()
        this.centerPixel = [0, 0]
        this.scrollVertical = 0
        this.scrollHorizontal = 0
        this.scrollSpeed = 1
        this.viewSettings = {
            'drawContourLines': true,
            'drawGridLines': true,
            'tintBelowSeaLevel': true,
            'erosionView': false,
            'elevationView': false,
            'fertilityView': false,
            'waterLevelView': false,
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

        const crosshairData = this.crosshairTiles.find(entry => entry[0] === tile);

        if (this.viewSettings.drawContourLines
        && !config.tileTypes[tile.type]?.neverDrawContour
        && tile.elevation > 5
        && !crosshairData) {
            let contourThickness = config.viewSettings.contourThickness
            const nearContour = Math.abs(tile.elevation) % config.viewSettings.contourInterval < contourThickness;



            if (nearContour && tile.type != 'water') {
                r = Math.max(r - config.viewSettings.contourDarkness, 0)
                g = Math.max(g - config.viewSettings.contourDarkness, 0)
                b = Math.max(b - config.viewSettings.contourDarkness, 0)
            } else if (nearContour) {
                r = Math.max(r - config.viewSettings.contourDarkness * 0.5, 0)
                g = Math.max(g - config.viewSettings.contourDarkness * 0.5, 0)
                b = Math.max(b - config.viewSettings.contourDarkness * 0.5, 0)
            }

        }
        if (this.viewSettings.drawGridLines && !crosshairData) {
            if (   (tile.x - config.viewSettings.gridOffset) % config.viewSettings.gridInterval === 0
                || (tile.y - config.viewSettings.gridOffset) % config.viewSettings.gridInterval === 0) {
                r = Math.max(r - 50, 0)
                g = Math.max(g - 35, 0)
                b = Math.max(b - 15, 0)
            }
        }
        if (this.viewSettings.fertilityView) {
            r = 255 - (tile.fertility * 225)
            g = tile.fertility * 225
            b = 0
        }
        if (this.viewSettings.erosionView && (tile.amountSedimented > 0 || tile.amountEroded > 0)) {
            r = 0   + (tile.amountEroded      * 60) - (tile.amountSedimented * 60)
            g = 0   + (tile.amountSedimented  * 60) - (tile.amountEroded     * 60)
            b = 0
        }
        if (this.viewSettings.elevationView) {
            if (tile.elevation > 70) {r = tile.elevation - 70}
            else {r = 0}

            if (tile.elevation > 70) {
                g = (tile.elevation - (70 - tile.elevation))
            }
            g = tile.elevation
            b = 0
        }
        if (this.viewSettings.waterLevelView && tile.type === 'water') {
            const waterLevel = tile.waterLevel ? tile.waterLevel + tile.elevation : 0
            r = waterLevel
            g = waterLevel
            b = waterLevel * 2
        }
        if (this.viewSettings.waterDepthView && tile.type === 'water') {
            const waterLevel = tile.waterLevel ? tile.waterLevel * 50 : 0
            r = waterLevel / 3
            g = waterLevel / 3
            b = waterLevel * 2
        }

        if (this.viewSettings.tintBelowSeaLevel) {
            if (tile.elevation < 1 && tile.type != 'water') {
                r = Math.max(r - Math.abs(Math.min(tile.elevation, -10) * 3), 0)
                g = Math.max(g - Math.abs(Math.min(tile.elevation, -10) * 3), 0)
                b = Math.max(b - Math.abs(Math.min(tile.elevation, -10) * 3), 0)
            }
        }
        if (crosshairData && this.drawCrosshair) {

            const light = crosshairData[1]
            if (tile.elevation - 0.2 <= this.crosshairElevation || tile.elevation < 0) {
                r = Math.min(r + light, 255)
                g = Math.min(g + light, 255)
                b = Math.min(b + light, 255)
            }
            else {
                // const shadow = crosshairData[1] * 0.2
                // r = Math.max(r + shadow, 0)
                // g = Math.max(g + shadow, 0)
                // b = Math.max(b + shadow, 0)
                null

            }
        }

        if (tile.entities.size > 0) {
            const entity = tile.entities.values().next().value
            r = entity.r
            g = entity.g
            b = entity.b
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

        this.markAllTilesDirty()
    }

    markAllTilesDirty() {
        // mark everything dirty so it all redraws
        for (const tile of this.grid.tiles) {
            tile.dirty = true;
        }
    }


    setZoomLevel(amount) {
        this.pixelScale = this.pixelScale + amount;
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
        const x = Math.floor((pixelX - rect.left) / this.pixelScale) - this.centerPixel[0];
        const y = Math.floor((pixelY - rect.top) / this.pixelScale) - this.centerPixel[1];
        return this.grid.tileMap.get(`${x},${y}`);
    }
    exportMapAsPNG() {
        // make sure the offscreen canvas is fully up to date
        this.markAllTilesDirty();
        for (const tile of this.grid.tiles) {
            this.writeTileToBuffer(tile);
            tile.dirty = false;
        }
        this.offscreenCtx.putImageData(this.imageData, 0, 0);

        // trigger download
        const link = document.createElement('a');
        link.download = 'map.png';
        link.href = this.offscreen.toDataURL('image/png');
        link.click();
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
            if (e.key === 'f') {this.viewSettings.fertilityView  = !this.viewSettings.fertilityView  ;   this.markAllTilesDirty()}
            if (e.key === 'e') {this.viewSettings.elevationView  = !this.viewSettings.elevationView  ;   this.markAllTilesDirty()}
            if (e.key === 'r') {this.viewSettings.erosionView    = !this.viewSettings.erosionView    ;   this.markAllTilesDirty()}
            if (e.key === 'v') {this.viewSettings.waterLevelView = !this.viewSettings.waterLevelView ;   this.markAllTilesDirty()}
            if (e.key === 'c') {this.viewSettings.waterDepthView = !this.viewSettings.waterDepthView ;   this.markAllTilesDirty()}
            if (e.key === 'Shift') {this.scrollSpeed = 3}
            if (e.key === 'p') { this.exportMapAsPNG() }

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
