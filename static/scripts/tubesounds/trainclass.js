import { getRandomInt } from './helpers.js';
import { Emitter } from './emitter.js';

export class Train extends Emitter {

    constructor(nextStation) {
        super()
        this.line = nextStation.lineId
        this.id = nextStation.vehicleId
        this.previousStations = []
        this.currentStation = ''
        this.nextStation = this.cleanStationName(nextStation.stationName)
        this.timeToStation = (nextStation.timeToStation) + (Math.random() * 10)
        this.inTransit = true
        this.recentArrival = false // this flags the arrival for the event manager to pick up

        if (this.timeToStation < 10 && Math.random() < 0.5) { // assign some trains on first load to station
                                                                  // if it is likely they are
                                                                  // saving a big rush when the page first loads
            this.arriveAtStation()
        }
        this.timeToDeparture = null
        this.timeSinceDeparture = 9999

    }

    tick(delta) {

        if (this.inTransit) {

            if (this.timeToStation > 0) {
                this.timeToStation -= delta;
                this.timeSinceDeparture += delta;
            }
            if (this.timeToStation <= 0) {
                this.arriveAtStation();
            }
        }

        else {

            if (this.timeToDeparture) {
                this.timeToDeparture -= delta;
                if (this.timeToDeparture <= 0) {
                    this.departFromStation();
                }
            }
        }
    }

    arriveAtStation() {
        // we simulate arrivals at station
        // because the api doesnt distinguish between 'at station' and 'arriving at station in 5-10 seconds'
        // while the train is on the platform, it will just keep sending through the next arrival
        // this means we're not capturing when a train is sitting in a tunnel. but that's not the end of the world.
        // we can start editing the sound of the lines according to service status at some point maybe

        this.inTransit = false
        this.timeSinceDeparture = null
        this.recentArrival = true
        this.currentStation = this.nextStation
        this.nextStation = ''
        this.emit('arrival', {
            line: this.line,
            station: this.currentStation,
            trainId: this.id
        })

    }

    departFromStation() {


        this.previousStations.push(this.currentStation)
        this.currentStation = null
        this.inTransit = true
        this.timeToDeparture = null
        this.timeSinceDeparture = 0
        if (this.timeToStation < 3) {this.timeToStation = Math.random() + 3}
        this.emit('departure', {
            line: this.line,
            station: this.currentStation,
            trainId: this.id
        })

    }

    apiUpdate(trainData) {


        const nextStation = trainData[0]
        if (this.inTransit) { // if we haven't simulated the train reaching its destination,
                              // then we just update the time
            this.nextStation = this.cleanStationName(nextStation.stationName)
            if (nextStation.timeToStation > 60) {
                // if tfl are telling us it's arriving imminently, we just let it play out on our simulation end
                this.timeToStation = nextStation.timeToStation + (Math.random() * 10)
            } else if (nextStation.timeToStation < this.timeToStation) {
                this.timeToStation = nextStation.timeToStation + (Math.random())
            }
        }

        else {
            // if we're simulating the train at the station
            // and the 'next station' name tfl are returning
            // is different to the 'current station' name we've recorded
            // then the train has left the station and is in transit again
            if (this.currentStation != this.cleanStationName(nextStation.stationName)) {

                if (this.timeToDeparture === null) {
                        this.timeToDeparture =  (Math.random() * 5)
                        if (nextStation.timeToStation < 5) {
                            this.timeToDeparture = Math.random()
                        }
                        this.nextStation = this.cleanStationName(nextStation.stationName);
                        this.timeToStation = nextStation.timeToStation - this.timeToDeparture
                    }

            }


            
        }

    }


    cleanStationName(name) {
        return name.replace(' Underground Station', '')
    }


}
