import { config } from './config.js';
import { Tile } from './tile.js';
import { getRandomInt, getRandomArbitrary } from './helpers.js';

export class Grid {
    constructor() {
        this.perlin = this.createPerlin();
        this.tiles = this.constructTiles()

    }

    generateBlob(centerX, centerY, radius) {
        const blob = [];
        for (let x = centerX - radius; x < centerX + radius; x++) {
            for (let y = centerY - radius; y < centerY + radius; y++) {
                const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const wobble = radius * (0.7 + Math.random() * 0.3);
                if (dist < wobble) {
                    blob.push([x,y])
                }
            }
        }
        return blob;
    }


    generateTrees() {
        const centreX = getRandomInt(0, config.gameSettings.canvasWidth)
        const centreY = getRandomInt(0, config.gameSettings.canvasHeight)
        const features = [];
        const featureSize = getRandomInt(80,400)
        const density = getRandomInt(featureSize / 4, featureSize * 3)          // number of blobs
        for (let i = 0; i <= density; i++) {
            let wildcard = 0
            if (Math.random() < 0.1) {
                wildcard = getRandomInt(-100,100)
            }
            const blob = this.generateBlob(
                getRandomInt(centreX - (featureSize / 3) + wildcard, centreX + (featureSize / 3) + wildcard), // centre x of blob
                getRandomInt(centreY - (featureSize / 3) - wildcard, centreY + (featureSize / 3) + wildcard), // centre y of blob
                getRandomInt(1, 3)                       // radius of blob
            );
            features.push(blob)
        }
        return features
    }


    createPerlin() {

        let perlin = {
            rand_vect: function(){
                let theta = Math.random() * 2 * Math.PI;
                return {x: Math.cos(theta), y: Math.sin(theta)};
            },
            dot_prod_grid: function(x, y, vx, vy){
                let g_vect;
                let d_vect = {x: x - vx, y: y - vy};
                if (this.gradients[[vx,vy]]){
                    g_vect = this.gradients[[vx,vy]];
                } else {
                    g_vect = this.rand_vect();
                    this.gradients[[vx, vy]] = g_vect;
                }
                return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
            },
            smootherstep: function(x){
                return 6*x**5 - 15*x**4 + 10*x**3;
            },
            interp: function(x, a, b){
                return a + this.smootherstep(x) * (b-a);
            },
            seed: function(){
                this.gradients = {};
                this.memory = {};
            },
            get: function(x, y) {
                if (this.memory.hasOwnProperty([x,y]))
                    return this.memory[[x,y]];
                let xf = Math.floor(x);
                let yf = Math.floor(y);
                //interpolate
                let tl = this.dot_prod_grid(x, y, xf,   yf);
                let tr = this.dot_prod_grid(x, y, xf+1, yf);
                let bl = this.dot_prod_grid(x, y, xf,   yf+1);
                let br = this.dot_prod_grid(x, y, xf+1, yf+1);
                let xt = this.interp(x-xf, tl, tr);
                let xb = this.interp(x-xf, bl, br);
                let v = this.interp(y-yf, xt, xb);
                this.memory[[x,y]] = v;
                return v;
            }
        }
        perlin.seed();

        return perlin

    }

    getElevation(x, y) {
        // warp the coordinates using separate noise samples
        const warpStrength = 60
        const wx = x + warpStrength * this.perlin.get(x * 0.005 + 1.7, y * 0.005 + 9.2);
        const wy = y + warpStrength * this.perlin.get(x * 0.005 + 8.3, y * 0.005 + 2.4);

        const octaves = [
            { scale: 0.0001, strength: 3   },
            { scale: 0.005, strength: 2   },
            { scale: 0.02,  strength: 0.9 },
            { scale: 0.08,  strength: 0.20 },
            { scale: 0.03,  strength: 0.10 },
            { scale: 0.08,  strength: 0.10 },
        ];

        const total = octaves.reduce((sum, octave) => {
            return sum + this.perlin.get(wx * octave.scale, wy * octave.scale) * octave.strength;
        }, 0);

        const maxValue = octaves.reduce((sum, o) => sum + o.strength, 0);
        return total / maxValue;
    }

    constructTiles() {

        const tiles = [];
        let x = 0;
        let y = 0;
        let waterLevel = config.worldGen.defaultWaterLevel
        if (config.worldGen.randomiseWaterLevel) {
            waterLevel = getRandomInt(-25,25)
        }
        while (y <= config.gameSettings.canvasHeight) {

            const tile = new Tile();

            tile.x = x;
            tile.y = y;
            tile.elevation = 255 * this.getElevation(x,y) - waterLevel;

            if (tile.elevation < 0) {
                tile.type = 'water'
            }
            else if (tile.elevation < (config.worldGen.sandHeightAboveWater) && Math.random() < 0.5) {
                tile.type = 'mud'
            }

            else if (tile.elevation > getRandomInt(50, 100)) {
                tile.type = 'stone'
            }
            else {
                tile.type = 'grass'
            }


            x++;
            if (x > config.gameSettings.canvasWidth) {x = 0; y++;}

            tiles.push(tile);
        }


        // build a map for fast lookup
        this.tileMap = new Map();
        tiles.forEach(tile => this.tileMap.set(`${tile.x},${tile.y}`, tile));

        let forests = new Set()
        let numberOfForests = getRandomInt(config.worldGen.minForestsPerMap, config.worldGen.maxForestsPerMap)
        for (let i=0; i <= numberOfForests; i++) {
            const forest = this.generateTrees();
            forest.forEach(tree => {
                forests.add(tree)
            })
        }
        forests.forEach(tree => {
            if (this.getTile(tree[0][0], tree[0][1])) {
                const treeTile = this.getTile(tree[0][0], tree[0][1])
                if (treeTile.elevation * Math.random() < 15) {
                    tree.forEach(coord => {
                        const coordTile = this.getTile(coord[0],coord[1])
                        if (coordTile && coordTile.type != 'water') {
                            coordTile.type = 'tree'
                        }
                    })
                }
            }
        })

        tiles.forEach(tile => {
            tile.assignColour()
        })

        console.log(forests)

        return tiles;
    }

    addTree(x,y) { // only called from the brush right now
        const treeCoords = this.generateBlob(x,y,getRandomInt(2,3))
        treeCoords.forEach(coord => {
            const tile = this.getTile(coord[0], coord[1])
            if (tile.type === 'water') return
            tile.type = 'tree'
            tile.assignColour()
        })

    }

    addLand(x,y) {
        const coords = this.generateBlob(x,y,getRandomInt(3,5))
        coords.forEach(coord => {
            const tile = this.getTile(coord[0], coord[1])
            if (tile.type === 'water' || tile.type === 'mud') {
                tile.type = 'grass'
                tile.elevation = getRandomInt(1,4)
                tile.assignColour()

            }
        })
    }

    excavate(x,y) {
        const coords = this.generateBlob(x,y,getRandomInt(5,10))
        coords.forEach(coord => {
            const tile = this.getTile(coord[0], coord[1])
            tile.elevation = tile.elevation - 3
            if (tile.type === 'tree') {tile.type = 'grass'}
            tile.assignColour()
        })

    }

    getTile(x,y) {
        return this.tileMap.get(`${x},${y}`)

    }


    getTileNeighbours(tile) {
        const offsets = [
            { x: -1, y:  0 },
            { x:  1, y:  0 },
            { x:  0, y: -1 },
            { x:  0, y:  1 },
        ];
        return offsets
            .map(offset => this.tileMap.get(`${tile.x + offset.x},${tile.y + offset.y}`))
            .filter(Boolean);
    }

    tick(tickCount) {
        this.tiles.forEach(tile => {
            if (tile.aflame) {
                this.updateFire(tile)
            }
            if (tile.type === 'ash') {
                this.updateAsh(tile)
            }
            if (tile.updateColourEveryTick) {
                tile.assignColour(tickCount)
            }
            if (tile.elevation < 0 && tile.type != 'water') {
                this.updateBelowSeaLevel(tile)
            }
        })
    }

    updateFire(tile) {
        tile.assignColour()
        const burnTime = config.tileTypes[tile.type]?.burnTime || 20;
        tile.burnTimer = (tile.burnTimer || burnTime) - 1;
        if (tile.burnTimer <= 0) {
            tile.type = 'ash';
            tile.aflame = false
            tile.assignColour();
            return;
        }
        const neighbours = this.getTileNeighbours(tile)
        neighbours.forEach(neighbour => {
            const flammability = config.tileTypes[neighbour.type]?.flammability;
            if (flammability && Math.random() < flammability) {
                neighbour.aflame = true
            }
        })

    }

    updateAsh(tile) {

        const neighbours = this.getTileNeighbours(tile)
        let regrowthChance = 0
        neighbours.forEach(neighbour => {
            if (neighbour.type === 'grass') {
                regrowthChance = regrowthChance + config.tileTypes.ash.grassRegrowthSpeed
            }
        })
        if (Math.random() < regrowthChance) {
            tile.type = 'grass'
            tile.assignColour()
        }
    }

    updateBelowSeaLevel(tile) {
        console.log('called')
        const neighbours = this.getTileNeighbours(tile)
        let flood = false
        neighbours.forEach(neighbour => {
            if (neighbour.type === 'water' && Math.random() < 0.3) {
                flood = true
            }
        })
        if (flood) {
            tile.type = 'water'
            tile.assignColour()
        }
    }

}
