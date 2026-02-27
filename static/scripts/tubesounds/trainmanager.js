import { Train } from './trainclass.js';
import { compare } from './helpers.js';
import { compareTimeToDeparture } from './helpers.js';

export class trainManager {

    constructor(sound) {
        this.trains = [];
        this.trainOrderNeedsUpdate = true
        this.sound = sound
    }


    updateData(batches) { // data comes through in batches from the api manager
                          // grouped by vehicle ID

        this.trainOrderNeedsUpdate = true
        for (const vehicleId in batches) {

            const trainData = batches[vehicleId]
            const nextStation = trainData[0]
            const existingRecord = this.findTrain(vehicleId)

            if (!existingRecord) { // exclude any trains which are taking more than 10 mins to destination
                // this will exclude some real ones, esp in far out boroughs.
                // but i think a lot of them are like. in holding patterns or something.
                // if they're real they'll get added when it comes under 10 mins anyway
                if (nextStation.timeToStation < 600) {

                    const newTrain = new Train(nextStation)

                    newTrain.on('arrival', () => {
                        this.trainOrderNeedsUpdate = true
                        if (this.sound) {

                            this.sound.playArrivalSynth(newTrain.line)
                        }
                    });

                    newTrain.on('departure', () => {
                        this.trainOrderNeedsUpdate = true
                        if (this.sound) {
                            this.sound.playDepartureSynth(newTrain.line)
                        }
                    });

                    this.trains.push(newTrain)
                }
            }
            else {
                existingRecord.apiUpdate(trainData)
            }
        }




    }


    updateTrainsInTransit(inTransit, atStation) {
        const total = inTransit + atStation;
        const percent = (inTransit / (total || 1)) * 100;


    }

    findTrain(vehicleId) {
        const found = this.trains.find((train) => train.id === vehicleId)
        return found
    }

    debugDisplay() {
        const inTransitTrains = document.getElementById('inTransitTable')
        const atStationTrains = document.getElementById('atStationTable')

        const inTransitFrag = document.createDocumentFragment();
        const atStationFrag = document.createDocumentFragment();


        if (this.trainOrderNeedsUpdate) {

            this.trains.sort(compare)
            this.trains.sort(compareTimeToDeparture)
            this.trainOrderNeedsUpdate = false

            this.trains.forEach(train => {
                let content = ''
                const row = document.createElement('tr')
                content += `<td class='idCell'><b>${train.id}</b></td>`

                if (train.inTransit) {

                    content += `<td class='timeCell' id='${train.id}'>${train.timeToStation.toFixed(2)}</td>`
                    content += `<td>Approaching ${train.nextStation}</td>`

                    row.innerHTML = content

                    row.classList.add('inTransit')
                    const opacity = (100 - (train.timeToStation) / 2) / 100

                    row.style.opacity = opacity
                    row.style.filter = 'saturate(${opacity})'
                    if (train.timeSinceDeparture && train.timeSinceDeparture < 0.2) {
                        // flash recent departures
                        // so viewer can see they're changing from one table to the other
                        row.classList.add('rowFlash')
                    }

                } else {
                    const content = `<td>At ${train.currentStation}
                    <td id='${train.id}'>Departing ${train.timeToDeparture ? train.timeToDeparture.toFixed(2) : 'soon'}</td>

                    </td>`
                    row.innerHTML = content
                    row.classList.add('atStation')

                    const maxTime = 60;
                    let opacity = 1
                    if (train.timeToDeparture) {
                        opacity = 1.1 - ((train.timeToDeparture / maxTime) * 0.3);
                    } else opacity = 0.5

                    row.style.opacity = opacity
                }


                row.classList.add(train.line)

                if (row.style.opacity > 0) {
                    if (train.inTransit) {
                        inTransitFrag.append(row);
                    } else {
                        atStationFrag.append(row);
                    }
                }

            })

            inTransitTable.replaceChildren(inTransitFrag);
            atStationTable.replaceChildren(atStationFrag);
        } else {
            this.trains.forEach(train => {

                try {

                    const timeCell = document.getElementById(train.id)
                    if (train.inTransit) {
                        timeCell.innerText = train.timeToStation.toFixed(2)

                        if (train.timeSinceDeparture && train.timeSinceDeparture > 0.2) {
                            const row = timeCell.parentElement
                            row.classList.remove('rowFlash')
                        }
                    }

                    else {
                        timeCell.innerText = `Departing ${train.timeToDeparture ? train.timeToDeparture.toFixed(2) : 'soon'}`

                    }
                } catch {
                    null // this is to stop it freaking out abt the rows we've not inserted bc
                         // they're too far away
                }
            })
        }
    }

    getTrainData() {
        let trainsInTransit = 0
        let trainsAtStation = 0
        let recentArrivals = 0
        let bpm = 0

        this.trains.forEach(train => {

            if (train.inTransit) {
                trainsInTransit++
                let bpmaddition = (1 / (train.timeToStation)) * 10
                if (bpmaddition > 10) {bpmaddition = 10}
                bpm = bpm + bpmaddition
            } else {
                trainsAtStation++
            }



            if (train.recentArrival) {
                recentArrivals++
                train.recentArrival = false
            }
        })


        this.updateTrainsInTransit(trainsInTransit, trainsAtStation)
        return {
            'trainsInTransit': trainsInTransit,
            'trainsAtStation': trainsAtStation,
            'recentArrivals':  recentArrivals,
            'bpm': bpm
        }
    }

    garbageCollectTrains(batches) {
        const activeIds = Object.keys(batches);

        this.trains = this.trains.filter(train => {
            const isStillActive = activeIds.includes(train.id);

            if (!isStillActive) {
                console.log(`Garbage Collection: Removing train ${train.id}`);
            }

            return isStillActive;
        });

    }

    tickAllTrains(delta) {
        this.trains.forEach(train => {
            train.tick(delta)
        })

    }


}
