
// this function is inclusive
export function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}
export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
export function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


export function getRandomDirection() { // bees will move in a random specific direction, with slight variety,
                        // if they don't know where any flowers etc are
    const directions = [
        { x: -1, y: -1 },
        { x:  0, y: -1 },
        { x:  1, y: -1 },
        { x: -1, y:  0 },
        { x:  1, y:  0 },
        { x: -1, y:  1 },
        { x:  0, y:  1 },
        { x:  1, y:  1 },
    ]

    const vector = directions[getRandomInt(0, directions.length - 1)]

    return vector
}
