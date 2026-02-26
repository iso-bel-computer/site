
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
