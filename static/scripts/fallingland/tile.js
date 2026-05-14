import { config } from './config.js';
import { getRandomInt, getRandomArbitrary, clamp } from './helpers.js';

export class Tile {

    init() {
        this.assignColour()
        this.setDefaultPassable()
        this.waterlogged = 0
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
        this.human.tile = this
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

        let h = 0
        let s = 0
        let l = 0

        let usingHSL = false

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

        else if (this.snowCovered && this.type != 'tree' && this.type != 'shrub' && this.type != 'gorse') {
            usingHSL = true
            h = 1
            s = 1
            l = getRandomInt(85,90)
            const steps = Math.abs(Math.floor(elevation / config.viewSettings.contourInterval))

            l = l - (steps * 1.5)
        }
        else if (this.bridge) {
            const brightness = getRandomArbitrary(0.75,1)
            r = getRandomInt(170,190) * brightness
            g = getRandomInt(150,170) * brightness
            b = getRandomInt(90,100) * brightness
        }

        else if (this.type === 'grass') {
            usingHSL = true
            h = getRandomInt(120,130) - (this.elevation * 0.8)
            s = getRandomInt(60,70)
            l = getRandomInt(30,45)

            if (this.fertility > 0.6)  {l = l - getRandomInt(5,7)}
            if (this.fertility < 0.35) {s = s - getRandomInt(10,13)}
            const steps = Math.abs(Math.floor(elevation / config.viewSettings.contourInterval))

            l = clamp(l - (steps * 2), 15, 43)

        }
        else if (this.type === 'marsh') {
            r = getRandomInt(95,125)
            g = getRandomInt(145,175)
            b = getRandomInt(90,120)
        }
        else if (this.type === 'gorse') {
            if (Math.random() < 0.95) {
                r = getRandomInt(5, 15)
                g = getRandomInt(40,50)
                b = getRandomInt(5,15)
            }
            else {
                r = getRandomInt(235,245)
                g = getRandomInt(245,255)
                b = getRandomInt(0,10)
            }
        }
        else if (this.type === 'shrub') {
            usingHSL = true
            h = getRandomInt(35,40)
            s = getRandomInt(31,37)
            l = getRandomInt(20,30)
        }

        else if (this.type === 'water') {
            this.shore = (!this.isTileSurroundedBySameType() && this.elevation < 3)
            if (this.shore) {
                r = getRandomInt(190,220)
                g = getRandomInt(190,220)
                b = getRandomInt(230,255)
                this.updateColourEveryTick = true
            } else
            {
                usingHSL = true

                if (this.elevation < 0.1) {
                    h = getRandomInt(203,206)
                    s = getRandomInt(78,83)
                    l = 32
                    const steps = Math.abs(Math.floor(elevation / 25))
                    l = clamp(l - (steps * 5), 20, 43)
                    l = l + getRandomInt(3,5)
                } else {

                    this.updateColourEveryTick = true
                    if      (this.waterLevel < 1) {
                        h = getRandomInt(203,206)
                        s = getRandomInt(18,20)
                        l = getRandomInt(55,60)
                        l = l + (this.elevation / 4)
                        this.waterColourInitialised = true
                    }
                    else if (this.tickCount % getRandomInt(0,50) === 0 || !this.waterColourInitialised) {
                        h = getRandomInt(203,206)
                        s = getRandomInt(78,83)
                        l = getRandomInt(20,22)
                        const steps = Math.abs(Math.floor((this.waterLevel + this.elevation) / config.viewSettings.contourInterval ))
                        l = l + (steps * 3)
                        this.waterColourInitialised = true
                    } else {
                        usingHSL = false
                        r = this.colour[0]
                        g = this.colour[1]
                        b = this.colour[2]
                    }



                }
            }

        }

        else if (this.type === 'mud') {
            r = getRandomInt(40,60)
            g = getRandomInt(30,30)
            b = getRandomInt(0,10)
        }
        else if (this.type === 'sand') {
            usingHSL = true
            h = getRandomInt(47,50)
            s = getRandomInt(45,50)
            l = getRandomInt(55,75)
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
            usingHSL = true
            h = getRandomInt(120,125)
            s = getRandomInt(52,54)
            l = getRandomInt(15,20)
            if (this.isTileSurroundedBySameType()) {
                l = l - getRandomInt(5,8)

            }
        }

        else if (this.type === 'stone') {
            // const brightness = getRandomArbitrary(0.75,1)
            // r = getRandomInt(170,190) * brightness
            // g = getRandomInt(170,190) * brightness
            // b = getRandomInt(170,190) * brightness
            usingHSL = true
            h = getRandomInt(120,130) - (this.elevation * 0.8)
            s = getRandomInt(15,23)
            l = getRandomInt(60,70)

            const steps = Math.floor(elevation / config.viewSettings.contourInterval)
            l = l - (steps * 3)
        }

        else if (this.type === 'flower') {
            usingHSL = true
            h = getRandomInt(1,359)
            s = getRandomInt(60,80)
            l = getRandomInt(50, 70)
        }

        if (usingHSL) { // try not to use hsl where the value is going to be recalculated a lot
                        // for performance reasons
            const convertedRGB = this.hslToRgb(h / 360, s / 100, l / 100)
            r = convertedRGB[0]
            g = convertedRGB[1]
            b = convertedRGB[2]
        }



        this.colour = [r, g, b];
        this.dirty = true
    }

    hslToRgb(h, s, l) {

        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = this.hueToRgb(p, q, h + 1/3);
            g = this.hueToRgb(p, q, h);
            b = this.hueToRgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    hueToRgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    tick(tickCount) {

        this.tickCount = tickCount

        if (this.aflame) {
            this.updateFire()
        }

        // automatically regrow if we have set a regrowth speed
        if (config.tileTypes[this.type]?.grassRegrowthSpeed) {
            this.regrowGrass()
        }

        if (config.tileTypes[this.type]?.marshSpreadSpeed) {
            this.spreadMarsh()
        }

        if (this.updateColourEveryTick) {
            this.assignColour(tickCount)
        }


        if (this.human) {
            this.human.tick()
        }

    }

    updateFire() {
        if (this.snowCovered) {this.snowCovered = false}
        const defaultBurnTime = config.tileTypes[this.type]?.burnTime
        let burnTime = getRandomInt(defaultBurnTime * 0.5, defaultBurnTime * 1.5) || 20;
        if (Math.random() < 0.006) {burnTime = burnTime * 3}
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
            if (neighbour.type === 'water' && this.elevation > 1) { // allows for grassy islands in rivers
                regrowthChance = regrowthChance + regrowthSpeed
            }

        })
        if (Math.random() < regrowthChance) {
            this.changeTileType('grass')
        }
    }

    spreadMarsh() {
        let spreadChance = 0
        const spreadSpeed = config.tileTypes[this.type].marshSpreadSpeed;
        this.neighbours.forEach(neighbour => {
            const heightDifference = Math.abs(neighbour.elevation - this.elevation)
            if (neighbour.type === 'marsh'
            && neighbour.fertility > 0.7
            && this.elevation < 10
            && heightDifference < config.worldBehaviour.grassGrowAcrossHeightDifference) {
                spreadChance = spreadChance + spreadSpeed
            }
        })
        if (Math.random() < spreadChance) {
            this.changeTileType('marsh')
        }

    }




}
