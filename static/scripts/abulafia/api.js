export class API {


    constructor () {
        this.lastRequest = null
        this.rateLimit = 500
        this.queriesThisSession = 0
    }

    async fetchCompanyList(query) {

        await this.throttle()

        const response = await fetch(
            `/research/abulafia/fetchcompanylist?query=${encodeURIComponent(query)}`
        )

        const companyList = await response.json()

        return companyList

    }

    async fetchCompanyDetails(companyNumber) {

        await this.throttle()

        const response = await fetch(
            `/research/abulafia/fetchcompanydetails?companyNumber=${encodeURIComponent(companyNumber)}`
        )

        const company = await response.json()

        return company
    }


    async fetchOfficerList(companyNumber, index) {

        await this.throttle()

        const response = await fetch(
            `/research/abulafia/fetchofficerlist?companyNumber=${encodeURIComponent(companyNumber)}&index=${index}`
        )

        const officerList = await response.json()
        console.log(officerList)

        return officerList
    }

    async fetchOfficerDetails(officerAppointmentLink) {

        await this.throttle()

        const response = await fetch(
            `/research/abulafia/fetchofficerdetails?link=${encodeURIComponent(officerAppointmentLink)}`
        )

        const officerDetails = await response.json()

        return officerDetails
    }

    async throttle() {

        const now = Date.now();

        if (this.lastRequest && now - this.lastRequest < this.rateLimit) {
            console.warn(`Too many requests too quickly (ratelimit: ${this.rateLimit}). Throttling...`)
            await new Promise(r => setTimeout(r, this.rateLimit));
        }

        this.lastRequest = Date.now()
        this.queriesThisSession++

        console.log('Queries this session: ', this.queriesThisSession)


    }

}
