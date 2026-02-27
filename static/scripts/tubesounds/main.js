import { apiManager } from './apimanager.js';
import { trainManager } from './trainmanager.js';
import { soundManager } from './soundManager.js';

const sound = new soundManager()
const trains = new trainManager(sound)
const api = new apiManager(trains)


let lastTick = performance.now();

function tick() {
    const now = performance.now();
    const delta = (now - lastTick) / 1000; // time passed in seconds (e.g., 0.0102)
    lastTick = now;

    trains.tickAllTrains(delta);
}

function updateUI() {

    trains.debugDisplay()
    requestAnimationFrame(updateUI)
}

function updateData() {

    const trainOverviewData = trains.getTrainData()
    //console.log('Trains in Transit: ', trainOverviewData.trainsInTransit, 'Trains at Station: ', trainOverviewData.trainsAtStation, '% of Trains in Transit: ', Math.trunc(100 / (trains.trains.length) * trainOverviewData.trainsInTransit), 'Recent arrivals: ', trainOverviewData.recentArrivals )
    sound.updateLoopBPM(trainOverviewData.bpm )
}

updateUI()

alert('hi!! you gotta click on the page once for the sound to play. i dont make the rules.')

document.body.addEventListener("click", async () => {

    await Tone.start()
    sound.init = true
    sound.playArrivalSynth('circl')
})


setInterval(tick, 10)

setInterval(updateData, 500)
