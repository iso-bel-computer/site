import { Train } from './trainclass.js';
import { getRandomInt } from './helpers.js';
import { compare } from './helpers.js';

export class trainManager {

    constructor() {
        this.trains = []
    }

    updateData(batches) { // data comes through in batches from the api manager
                          // grouped by vehicle ID

        for (const vehicleId in batches) {

            const trainData = batches[vehicleId]
            const nextStation = trainData[0]
            nextStation.timeToStation = nextStation.timeToStation + getRandomInt(0, 10) // tfl data tends to cluster numbers
                                                                                       // this hopefully spreads them out
                                                                                       // to improve the rhythm

            const existingRecord = this.findTrain(vehicleId)

            if (!existingRecord) { // exclude any trains which are taking more than 10 mins to destination
                // this will exclude some real ones, esp in far out boroughs.
                // but i think a lot of them are like. in holding patterns or something.
                // if they're real they'll get added when it comes under 10 mins anyway
                if (nextStation.timeToStation < 600) {

                    const newTrain = new Train(nextStation)
                    this.trains.push(newTrain)
                }
            }

            else {

                existingRecord.apiUpdate(nextStation)

            }

        }

    }

    findTrain(vehicleId) {
        const found = this.trains.find((train) => train.id === vehicleId)
        return found
    }

    debugDisplay() {
        const debugDiv = document.getElementById('debugDiv')
        debugDiv.innerHTML = ''
        const inTransitTrains = document.createElement('table')
        const atStationTrains = document.createElement('table')


        this.trains.sort(compare)
        this.trains.forEach(train => {
            const row = document.createElement('tr')
            row.innerHTML += `<td><b>${train.id}</b></td>`
            row.innerHTML += ` <td><i>${train.line}</i></td>`

            if (train.inTransit) {
                if (train.timeToStation > 60) {

                    const mins = Math.trunc(train.timeToStation / 60)
                    const secs = train.timeToStation - (mins * 60)
                    row.innerHTML += `<td>${mins}m ${secs}</td>`
                } else {

                    row.innerHTML += `<td>${train.timeToStation}s</td>`
                }
                row.innerHTML += `<td>Approaching ${train.cleanStationName(train.nextStation)}</td>`
                row.classList.add('inTransit')
            } else {
                row.innerHTML += `<td>At ${train.cleanStationName(train.currentStation)}</td>`
                row.classList.add('atStation')
            }


            row.classList.add(train.line)

            if (train.inTransit) {

                inTransitTrains.append(row)
            } else {
                atStationTrains.append(row)
            }
        })

        debugDiv.appendChild(inTransitTrains)
        debugDiv.appendChild(atStationTrains)
    }

    getTrainData() {
        let trainsInTransit = 0
        let trainsAtStation = 0
        let recentArrivals = 0

        this.trains.forEach(train => {
            if (train.inTransit) {
                trainsInTransit++
            } else {
                trainsAtStation++
            }
            if (train.recentArrival) {
                recentArrivals++
                train.recentArrival = false
            }
        })

        return {
            'trainsInTransit': trainsInTransit,
            'trainsAtStation': trainsAtStation,
            'recentArrivals':  recentArrivals
        }
    }

    tickAllTrains() {
        this.trains.forEach(train => {
            train.tick()
        })

    }


}
