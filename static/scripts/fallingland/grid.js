import { config } from './config.js';
import { Tile } from './tile.js';
import { Bridge } from './entities/bridge.js';
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

    generateFlowers(startX, startY, endX, endY, amount) {
        const flowers = []
        for (let i = 0; i < amount; i++) {
            const x = getRandomInt(startX, endX)
            const y = getRandomInt(startY, endY)
            flowers.push([x,y])
        }
        return flowers

    }

    constructTiles() {

        const tiles = [];
        let x = 0;
        let y = 0;
        let waterLevel = config.worldGen.waterAmount
        if (config.worldGen.randomiseWaterLevel) {
            waterLevel = getRandomInt(-40,30)
        }
        while (y <= config.gameSettings.canvasHeight) {

            const tile = new Tile();

            tile.x = x;
            tile.y = y;
            tile.elevation = 255 * this.getElevation(x,y) - waterLevel;

            if (tile.elevation < 1) {
                tile.type = 'water'
            }

            else if (tile.elevation > getRandomInt(50,60) && Math.random() < 0.6) {
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
                if (treeTile.elevation * Math.random() < 8) {
                    tree.forEach(coord => {
                        const coordTile = this.getTile(coord[0],coord[1])
                        if (coordTile && coordTile.type != 'water') {
                            coordTile.type = 'tree'
                        }
                    })
                }
            }
        })

        let numberOfFlowerPatches = getRandomInt(0, 5)
        for (let i=0; i <= numberOfFlowerPatches; i++) {
            const startX = getRandomInt(0,config.gameSettings.canvasWidth)
            const startY = getRandomInt(0,config.gameSettings.canvasHeight)
            const flowers = this.generateFlowers(
                startX,
                startY,
                startX + getRandomInt(100,200),
                startY + getRandomInt(100,200),
                getRandomInt(50,150))
            console.log(flowers)
            flowers.forEach(flower => {
                const tile = this.getTile(flower[0], flower[1])
                if (tile) {
                    if (tile.type === 'grass') {
                        tile.type = 'flower'
                    }
                }
            })

        }


        tiles.forEach(tile => {
            tile.neighbours = this.getTileNeighbours(tile)
        })

        this.addBeaches(tiles)
        this.addBogs(tiles)
        this.addRocks(tiles)
        this.addSnow(tiles)


        tiles.forEach(tile => {
            tile.assignColour()
        })

        return tiles;
    }

    addBeaches(tiles) {

        let beachAmounts = config.worldGen.beachAmounts
        let beachSize    = config.worldGen.beachSize

        if (config.worldGen.randomiseBeaches) {
            beachAmounts = getRandomArbitrary(0.01, 0.04)
            beachSize    = getRandomArbitrary(0.4, 1)
        }

        tiles.forEach(tile => {
            if (tile.type !== 'water') {
                if (tile.neighbours.find(neighbour => neighbour.type === 'water'
                && Math.random() < beachAmounts)) {
                    tile.type = 'sand';
                }

            }
        })

        tiles.forEach(tile => {
            if (tile.type !== 'water') {
                if (tile.neighbours.find(neighbour => neighbour.type === 'sand')
                && tile.elevation < getRandomInt(3,6)
                && Math.random() < beachSize) {
                    tile.type = 'sand';
                }
            }
        })

        return tiles

    }

    addBogs(tiles) {

        let bogAmounts   = config.worldGen.bogAmounts
        let bogSize      = config.worldGen.bogSize

        tiles.forEach(tile => {
            if (tile.type !== 'water'
            && tile.neighbours.find(neighbour => neighbour.type === 'water')
            && Math.random() < bogAmounts) {
                const coords = this.generateBlob(tile.x, tile.y, getRandomInt(bogSize * 0.5, bogSize * 1.5))
                coords.forEach(coord => {
                    const tile = this.getTile(coord[0], coord[1]);
                    if (tile) {
                        if (tile.type !== 'water' && Math.random() < 0.7) {
                            tile.type = 'marsh'
                        }
                    }
                })

            }
        })

        return tiles


    }


    addRocks(tiles) {

        let seaRockRate      = config.worldGen.shallowWaterRockRate
        let mountainRockRate = config.worldGen.mountainRockRate

        tiles.forEach(tile => {

            // random rocks in the sea
            if (tile.type === 'water' && tile.elevation > -8) {
                if (Math.random() < seaRockRate) {
                    const radius = getRandomInt(1, 5);
                    const blob = this.generateBlob(tile.x, tile.y, radius);
                    blob.forEach(coord => {
                        const tile = this.getTile(coord[0], coord[1]);
                        if (tile && tile.type === 'water') {
                            if (Math.random() < 0.85) {
                                tile.type = 'stone';
                                tile.elevation = getRandomInt(1, 4);
                            }
                        }
                    })
                }
            }

            // random rocks on mountains
            if (tile.elevation > 27) {
                if (Math.random() < mountainRockRate) {
                    const radius = getRandomInt(1, 4);
                    const blob = this.generateBlob(tile.x, tile.y, radius);
                    blob.forEach(coord => {
                        const tile = this.getTile(coord[0], coord[1]);
                        if (tile && Math.random() < 0.7) {
                            tile.type = 'stone';
                        }
                    })
                }
            }
        })
        return tiles

    }

    addSnow(tiles) {

        let snowAltitude = config.worldGen.snowAltitude
        tiles.forEach(tile => {
            if (tile.elevation < snowAltitude) {return}
            if (Math.random() < 0.8) {
                tile.snowCovered = true
            }
        })
    }

    getTile(x,y) {
        return this.tileMap.get(`${x},${y}`)

    }


    getLineOfTiles(x0,y0,x1,y1) {

        const tiles = []

        const mx = Math.abs(x1 - x0)
        const my = Math.abs(y1 - y0)

        const steps = Math.max(mx, my)
        if (steps === 0) return  // same tile clicked twice

        let sx = 0
        let sy = 0


        let x = x0
        let y = y0

        tiles.push(this.getTile(x,y))

        while (x != x1 || y != y1) {
            sx += mx
            sy += my
            const dx = x1 > x0 ? 1 : -1
            const dy = y1 > y0 ? 1 : -1

            if (sx >= steps) { sx -= steps; x += dx }
            if (sy >= steps) { sy -= steps; y += dy }


            const tile = this.getTile(x, y)
            tiles.push(tile)
        }

        return tiles

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
            tile.tick(tickCount)
            if (tile.elevation < 0 && tile.type != 'water') {
                this.updateBelowSeaLevel(tile)
            }
        })
    }


    regrow(tile) {
        const neighbours = this.getTileNeighbours(tile)
        let regrowthChance = 0
        const regrowthSpeed = config.tileTypes[tile.type]?.grassRegrowthSpeed || 0.1;
        neighbours.forEach(neighbour => {
            // grass can't regrow across more than 5 feet
            const heightDifference = Math.abs(neighbour.elevation - tile.elevation)
            if (neighbour.type === 'grass' && heightDifference < config.worldBehaviour.grassGrowAcrossHeightDifference) {
                regrowthChance = regrowthChance + regrowthSpeed
            }
        })
        if (Math.random() < regrowthChance) {
            tile.type = 'grass'
            tile.assignColour()
        }
    }

    updateBelowSeaLevel(tile) {
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

    addBridge(tiles) {
        const bridge = new Bridge(tiles)

        tiles.forEach(tile => {
            tile.bridge = bridge
            tile.assignColour()
        })

    }

}
