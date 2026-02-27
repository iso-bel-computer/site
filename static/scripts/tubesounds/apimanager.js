import { compare } from './helpers.js';

export class apiManager {

    constructor(trainManager) {
        this.trainManager = trainManager
        this.lines = ['circle', 'district', 'central', 'bakerloo', 'northern', 'victoria', 'jubilee', 'metropolitan', 'piccadilly', 'hammersmith-city', 'waterloo-city']

        this.apiRefreshInterval = 5000 // refresh data every 15 seconds
        this.refresh = this.refresh.bind(this)  // Bind the correct context to refresh
        this.refresh()
        setInterval(() => this.refresh(), this.apiRefreshInterval)
    }

    async refresh() {
        console.log('refreshing api...')

        const batches = []

        try {

            const responses = await Promise.all(
                this.lines.map(line =>
                    fetch(`https://api.tfl.gov.uk/Line/${line}/Arrivals?app_key=60ca78e2c67c4537922a0daf322bb78f`)
                )
            )

            const results = await Promise.all(
                responses.map(r => r.json())
            )

            results.forEach(data => {

                data.sort(compare)

                data.forEach(arrivalData => {
                    const id = arrivalData.vehicleId
                    if (!batches[id]) batches[id] = []
                    batches[id].push(arrivalData)
                })

            })

            this.trainManager.updateData(batches)
            this.trainManager.garbageCollectTrains(batches)

        } catch (err) {
            console.error(err)
        }
    }
}
