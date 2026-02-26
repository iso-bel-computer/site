import { apiManager } from './apimanager.js';
import { trainManager } from './trainmanager.js';

const trains = new trainManager()
const api = new apiManager(trains)


function tick() {
    trains.tickAllTrains()
    const trainOverviewData = trains.getTrainData()
    console.log('Trains in Transit: ', trainOverviewData.trainsInTransit, 'Trains at Station: ', trainOverviewData.trainsAtStation, '% of Trains in Transit: ', Math.trunc(100 / (trains.trains.length) * trainOverviewData.trainsInTransit), 'Recent arrivals: ', trainOverviewData.recentArrivals )
    trains.debugDisplay()
}

setInterval(tick, 1000)

