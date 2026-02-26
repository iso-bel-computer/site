
// sorts trains on a line by their train id
export function compare( a, b ) {
    if ( a.timeToStation < b.timeToStation ){
        return -1;
    }
    if ( a.timeToStation > b.timeToStation  ){
        return 1;
    }
    return 0;
}

export function compareTimeToDeparture(a, b) {
    if (a.inTransit !== b.inTransit) {
        return a.inTransit ? 1 : -1;
    }

    if (a.timeToDeparture !== null && b.timeToDeparture === null) return -1;
    if (a.timeToDeparture === null && b.timeToDeparture !== null) return 1;
    if (a.timeToDeparture === null && b.timeToDeparture === null) return 0;

    return a.timeToDeparture - b.timeToDeparture;
}

export function getTrain(trainId, activeTrains) {
    return activeTrains.find(train =>
        parseInt(train.id) === parseInt(trainId)
    ) || false
}

export function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}
