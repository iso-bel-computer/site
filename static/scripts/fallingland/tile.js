import { config } from './config.js';
import { getRandomInt, getRandomArbitrary, clamp } from './helpers.js';

export class Tile {

    constructor() {
    }

    randomValue(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    assignColour(tickCount) {
        const elevation = this.elevation
        if (this.aflame) {
            const red = getRandomInt(150,255)
            const green = getRandomInt(20,130)
            const blue = getRandomInt(17,20)
            this.updateColourEveryTick = true
            this.colour = [red, green, blue];
        }

        else if (this.elevation < 0 && this.elevation > -3) { // widen the shore strip
            const wave = Math.sin((tickCount * 0.1)) * 0.2 + 0.8; // 0 to 1
            const foam = Math.floor(wave * 80);
            this.colour = [foam + 50, foam + getRandomInt(100,110), 200 + foam + getRandomInt(0,10)];
            this.updateColourEveryTick = true
        }

        else if (this.type === 'grass') {
            const brightness = getRandomArbitrary(0.45,1)
            const red = Math.min((Math.abs(elevation) * Math.abs(elevation)) / 10, 255) * brightness
            const green = getRandomInt(200,255) * brightness
            const blue = getRandomInt(0,50) * brightness
            this.updateColourEveryTick = false
            this.colour = [red, green, blue];
        }
        else if (this.type === 'water') {
            const red = getRandomInt(0, 15)
            const green = getRandomInt(0, 100) - (Math.abs(elevation) * 4)
            const blue = getRandomInt(250,255) - (Math.abs(elevation) * 3)
            this.updateColourEveryTick = false
            this.colour = [red, green, clamp(blue, 150,255)];
        }
        else if (this.type === 'mud') {
            const red = getRandomInt(240,250)
            const green = getRandomInt(210,220)
            const blue = getRandomInt(150,160)
            this.updateColourEveryTick = false
            this.colour = [red, green, blue];
        }
        else if (this.type === 'ash') {
            const red = getRandomInt(30,70)
            const green = getRandomInt(30,70)
            const blue = getRandomInt(30,70)
            this.updateColourEveryTick = false
            this.colour = [red, green, blue];
        }
        else if (this.type === 'tree') {
            const red = getRandomInt(0,15)
            const green = getRandomInt(15,100)
            const blue = getRandomInt(0,15)
            this.updateColourEveryTick = false
            this.colour = [red, green, blue];
        }
        else if (this.type === 'stone') {
            const red = getRandomInt(200,220)
            const green = getRandomInt(200,220)
            const blue = getRandomInt(170,200)
            this.updateColourEveryTick = false
            this.colour = [red, green, blue];
        }
    }



}
