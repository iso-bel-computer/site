import { config } from './config.js';
import { Tile } from './tile.js';
import { Bridge } from './entities/bridge.js';
import { getRandomInt, getRandomArbitrary, clamp } from './helpers.js';

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

    getElevation(x, y, offset) {

        if (!offset) {offset = 0}

        x = x + offset
        y = y + offset

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
    getFertility(x, y) {

        const offset = 25000

        x = x + offset
        y = y + offset

        // warp the coordinates using separate noise samples
        const warpStrength = 60
        const wx = x + warpStrength * this.perlin.get(x * 0.005 + 1.7, y * 0.005 + 9.2);
        const wy = y + warpStrength * this.perlin.get(x * 0.005 + 8.3, y * 0.005 + 2.4);

        const octaves = [
            { scale: 0.0001, strength: 6 },
            { scale: 0.003, strength: 3 },
            { scale: 0.02,  strength: 1 },
            { scale: 0.01,  strength: 0.8 },
        ];

        const total = octaves.reduce((sum, octave) => {
            return sum + this.perlin.get(wx * octave.scale, wy * octave.scale) * octave.strength;
        }, 0);

        const maxValue = octaves.reduce((sum, o) => sum + o.strength, 0);
        const normalized = (total / maxValue + 1) / 2;
        const contrast = 3; // 1 = unchanged

        return clamp((normalized - 0.5) * contrast + 0.5, 0, 1);
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
            waterLevel = getRandomInt(-20,20)
        }
        let randomWaterLevelMod = getRandomInt(config.worldGen.randomWaterLevelMod[0], config.worldGen.randomWaterLevelMod[1])

        let mapHasOcean = (Math.random() < config.worldGen.chanceOfOcean)
        while (y <= config.gameSettings.canvasHeight) {

            const tile = new Tile();

            tile.x = x;
            tile.y = y;
            tile.elevation = ((600 * this.getElevation(x,y) - waterLevel)  + randomWaterLevelMod)

            tile.baseFertility = this.getFertility(x,y, 2500);

            if (!mapHasOcean) {
                tile.elevation = (Math.floor(Math.abs(tile.elevation) * 0.9) + 3)
            }

            if (tile.elevation < 1) {
                tile.type = 'water'
            }

            else if (tile.elevation > getRandomInt(90,110) && Math.random() < 0.6
                     || tile.elevation > 110 && Math.random() < 0.85
                    ) {
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
            tile.immediateNeighbours = this.getImmediateNeighbours(tile)
        })

        this.addBeaches(tiles)
        this.addSnow(tiles)


        tiles.forEach(tile => {
            this.addBogs(tile)
            this.addRocks(tile)
            this.adjustFertility(tile)
        })


        this.addTrees(tiles)
        this.addGorse(tiles)

        tiles.forEach(tile => {
            tile.init()
        })
        return tiles;
    }

    addTree(tile) {

        if (!config.tileTypes[tile.type]?.canPlantTrees) {return}

        const treeCoords = this.generateBlob(tile.x,tile.y,getRandomInt(1,4))
        treeCoords.forEach(coord => {
            const tile = this.getTile(coord[0], coord[1])
            if (!tile) return
            if (tile.type === 'water') return
            tile.type = 'tree'
            tile.assignColour()
        })

    }
    addTrees(tiles) {
        tiles.forEach(tile => {
            const treeDensity = getRandomArbitrary(0.010, 0.020)
            if (Math.random() < treeDensity
                && tile.fertility > 0.40
                && (Math.random() / 2) + 0.1 < tile.fertility
                && (tile.type === 'grass' || tile.type === 'marsh' ))
            {
                this.addTree(tile)
            }
        })
    }

    addBeaches(tiles) {

        let beachAmounts = config.worldGen.beachAmounts
        let beachSize    = config.worldGen.beachSize

        if (config.worldGen.randomiseBeaches) {
            beachAmounts = getRandomArbitrary(0.02, 0.001)
            beachSize    = getRandomArbitrary(0.6, 1)
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

    addBogs(tile) {

        let bogAmounts   = config.worldGen.bogAmounts
        let bogSize      = config.worldGen.bogSize

        if (tile.type !== 'water'
        && tile.neighbours.find(neighbour => neighbour.type === 'water')
        && tile.baseFertility > 0.5
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

        return tile

    }


    addRocks(tile) {

        let seaRockRate      = config.worldGen.shallowWaterRockRate * getRandomArbitrary(0.75, 1.25)
        let mountainRockRate = config.worldGen.mountainRockRate * getRandomArbitrary(0.75, 1.25)


        // random rocks in the sea
        if (tile.type === 'water' && tile.elevation > -8) {
            if (Math.random() < seaRockRate) {
                const radius = getRandomInt(1, 5);
                const blob = this.generateBlob(tile.x, tile.y, radius);
                blob.forEach(coord => {
                    const tile = this.getTile(coord[0], coord[1]);
                    if (tile && tile.type === 'water') {
                        if (Math.random() < 0.75) {
                            tile.type = 'stone';
                            tile.elevation = getRandomInt(1, 4);
                        }
                    }
                })
            }
        }

        // random rocks on mountains
        if (tile.elevation > 34) {
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

        return tile

    }

    addSnow(tiles) {

        let snowOnThisMap = (Math.random() < 0.5)
        if (snowOnThisMap) {
            let snowAltitude = config.worldGen.snowAltitude
            let snowRate = 0.8
            if (Math.random() < config.worldGen.snowWorldChance) {
                snowAltitude = 0
                snowRate = getRandomArbitrary(0.65,1)
            }
            tiles.forEach(tile => {
                if (tile.elevation < snowAltitude) {return}
                if (Math.random() < snowRate) {
                    tile.snowCovered = true
                }
            })

        }

    }

    adjustFertility(tile) {
        // we already get a noise map of fertility added to the tile.
        // so this is just adjusting it for environmental factors

        let fertility = tile.baseFertility

        if (tile.type != 'water') {
            // if there's water anywhere near there then fertility gets a boost
            const furtherNeighbours = this.getTileNeighbours(tile, 10)
            furtherNeighbours.forEach(neighbour => {

                const fertilityBoost = config.tileTypes[neighbour.type]?.fertilityBoost
                if (fertilityBoost) {
                    fertility = fertility + fertilityBoost
                }

            })

        }

        const steps = tile.elevation / 10 // 1 for every 15ft of height
        const percentLoss = 0.01 * steps
        fertility = fertility - percentLoss
        tile.fertility = fertility


        return tile

    }

    addGorse(tiles) {
        tiles.forEach(tile => {

            if (tile.fertility < 0.30 && tile.type === 'grass') {

                if (tile.elevation > 20
                && tile.elevation < 50
                && Math.random() < 0.007) {
                    const radius = getRandomInt(3, 5);
                    const blob = this.generateBlob(tile.x, tile.y, radius);
                    blob.forEach(coord => {
                        const tile = this.getTile(coord[0], coord[1]);
                        if (tile && Math.random() < 0.7) {
                            tile.type = 'gorse';
                            tile.assignColour()
                        }
                    })
                }

                if (tile.elevation < 20
                    && Math.random() < 0.003) {
                    const radius = getRandomInt(1, 3);
                    const blob = this.generateBlob(tile.x, tile.y, radius);
                    blob.forEach(coord => {
                        const tile = this.getTile(coord[0], coord[1]);
                        if (tile && Math.random() < 0.5) {
                            tile.type = 'shrub';
                            tile.assignColour()
                        }
                    })

                }
            }

        })
        return tiles
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

    getTileNeighbours(tile, range) {
        if (!range) {range = 1}

        let x = range * -1
        let y = range * -1

        const offsets = []

        while (x <= range) {
            while (y <= range) {
                if (!(x === 0 && y === 0)) {
                    offsets.push( {"x": x, "y": y} )
                }
                y++
            }
            x++
            y = range * -1
        }

        return offsets
            .map(offset => this.tileMap.get(`${tile.x + offset.x},${tile.y + offset.y}`))
            .filter(Boolean);
    }

    getImmediateNeighbours(tile) {
        const offsets = [
            {"x": 1, "y": 0},
            {"x": -1, "y": 0},
            {"x": 0, "y": 1},
            {"x": 0, "y": -1},
        ]
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


    }

}
