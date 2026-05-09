import { config } from './config.js';
import { getRandomInt, getRandomArbitrary, clamp } from './helpers.js';

export class Tile {

    init() {
        this.assignColour()
        this.setDefaultPassable()
    }

    isTileSurroundedBySameType() {
        return this.neighbours.every(neighbour => neighbour.type === this.type);
    }

    isTileSurroundedByDifferentTypes() {
        return this.neighbours.every(neighbour => neighbour.type != this.type);
    }

    changeTileType(type) {
        this.type = type
        this.assignColour()
        this.neighbours.forEach(neighbour => {
            neighbour.assignColour()
        })
    }

    setDefaultPassable() {
        this.setPassable(config.tileTypes[this.type]?.passable ?? true)
    }

    setPassable(bool) {
        this.passable = bool
    }

    isPassable() {
        return this.passable
    }


    addHuman(human) {
        this.human = human
        this.assignColour()

    }
    removeHuman() {
        this.human = null
        this.assignColour()

    }
    addBridge(bridge) {
        this.bridge = bridge
        this.assignColour()
    }
    assignColour() {
        const elevation = this.elevation
        this.updateColourEveryTick = false

        let r = 0
        let g = 0
        let b = 0

        if (this.human) {

            r = this.human.r
            g = this.human.g
            b = this.human.b
        }
        else if (this.aflame) {
            r = getRandomInt(150,255)
            g = getRandomInt(20,130)
            b = getRandomInt(17,20)
            this.updateColourEveryTick = true
        }

        else if (this.snowCovered && this.type != 'tree') {
            const brightness = getRandomArbitrary(0.80,1)
            const white = (210 + (elevation * 3))
            r = Math.min(white * brightness, 255)
            g = Math.min(white * brightness, 255)
            b = Math.min(white * brightness, 255)
        }
        else if (this.bridge) {
            const brightness = getRandomArbitrary(0.75,1)
            r = getRandomInt(170,190) * brightness
            g = getRandomInt(150,170) * brightness
            b = getRandomInt(90,100) * brightness
        }

        else if (this.type === 'grass') {
            const brightness = getRandomArbitrary(0.45,0.85)
            r = Math.min((Math.abs(elevation) * Math.abs(elevation)) / 10, 255) * brightness
            g = getRandomInt(225,255) * brightness
            b = getRandomInt(0,50) * brightness
        }
        else if (this.type === 'marsh') {
            r = getRandomInt(38,48)
            g = getRandomInt(70,80)
            b = getRandomInt(30,43)
        }

        else if (this.type === 'water') {
            const shore = (!this.isTileSurroundedBySameType())
            if (shore) {
                r = getRandomInt(230,255)
                g = getRandomInt(230,255)
                b = getRandomInt(230,255)
                this.updateColourEveryTick = true
            } else {
                r = getRandomInt(0, 15)
                g = getRandomInt(0, 100) - (Math.abs(elevation) * 4)
                b = clamp(getRandomInt(250,255) - (Math.abs(elevation) * 1), 150, 255)
            }
        }

        else if (this.type === 'mud') {
            r = getRandomInt(40,60)
            g = getRandomInt(30,30)
            b = getRandomInt(0,10)
        }
        else if (this.type === 'sand') {
            r = getRandomInt(220,240)
            g = getRandomInt(210,230)
            b = getRandomInt(165,185)
        }

        else if (this.type === 'ash') {
            r = getRandomInt(30,70)
            g = getRandomInt(30,70)
            b = getRandomInt(30,70)
        }
        else if (this.type === 'beehive') {
            r = getRandomInt(160,180)
            g = getRandomInt(130,140)
            b = getRandomInt(0,10)
        }

        else if (this.type === 'tree') {
            if (this.isTileSurroundedBySameType()) {
                r = getRandomInt(0,15)
                g = getRandomInt(20,60)
                b = getRandomInt(0,15)
            } else {
                r = getRandomInt(0,15)
                g = getRandomInt(35,100)
                b = getRandomInt(0,15)
            }
        }

        else if (this.type === 'stone') {
            const brightness = getRandomArbitrary(0.75,1)
            r = getRandomInt(170,190) * brightness
            g = getRandomInt(170,190) * brightness
            b = getRandomInt(170,190) * brightness
        }

        else if (this.type === 'flower') {
            const random = Math.random()
            if (random < 0.2) {
                r = getRandomInt(200,225)
                g = getRandomInt(30,100)
                b = getRandomInt(30,100)
            } else if (random < 0.4) {
                r = getRandomInt(30,100)
                g = getRandomInt(200,225)
                b = getRandomInt(30,100)
            } else if (random < 0.6) {
                r = getRandomInt(30,100)
                g = getRandomInt(200,225)
                b = getRandomInt(200,225)
            } else if (random < 0.8) {
                r = getRandomInt(200,225)
                g = getRandomInt(200,225)
                b = getRandomInt(30,100)
            }
            else {
                r = getRandomInt(30,100)
                g = getRandomInt(30,100)
                b = getRandomInt(200,225)
            }
        }

        if (this.neighbours.find(neighbour => Math.abs(neighbour.elevation - this.elevation) > 7) && this.type != 'water') {
            r = r - 10
            g = g - 10
            b = b - 10
        }

        this.colour = [r, g, b];
        this.dirty = true
    }

    tick(tickCount) {

        if (this.aflame) {
            this.updateFire()
        }

        // automatically regrow if we have set a regrowth speed
        if (config.tileTypes[this.type]?.grassRegrowthSpeed) {
            this.regrowGrass()
        }

        if (this.updateColourEveryTick) {
            this.assignColour(tickCount)
        }

        if (this.type === 'water' && this.isTileSurroundedByDifferentTypes()) {
            this.evaporate()
        }

        if (this.human) {
            this.human.move(this, this.neighbours)
        }

    }

    updateFire() {
        if (this.snowCovered) {this.snowCovered = false}
        const burnTime = config.tileTypes[this.type]?.burnTime || 20;
        this.burnTimer = (this.burnTimer || burnTime) - 1;
        if (this.burnTimer <= 0) {
            this.changeTileType('ash')
            this.aflame = false
            ;
        } else {
            this.neighbours.forEach(neighbour => {
                const flammability = config.tileTypes[neighbour.type]?.flammability;
                if (flammability && Math.random() < flammability) {
                    neighbour.aflame = true
                }
            })
        }
        this.assignColour()
    }

    regrowGrass() {
        let regrowthChance = 0
        const regrowthSpeed = config.tileTypes[this.type].grassRegrowthSpeed;
        this.neighbours.forEach(neighbour => {
            // grass can't regrow across more than 5 feet
            const heightDifference = Math.abs(neighbour.elevation - this.elevation)
            if (neighbour.type === 'grass' && heightDifference < config.worldBehaviour.grassGrowAcrossHeightDifference) {
                regrowthChance = regrowthChance + regrowthSpeed
            }
        })
        if (Math.random() < regrowthChance) {
            this.changeTileType('grass')
        }
    }

    evaporate() { // called when a water block is surrounded by land blocks.
        if (Math.random() < config.worldBehaviour.waterEvaporationRate) {
            this.changeTileType('mud')
        }

    }



}
