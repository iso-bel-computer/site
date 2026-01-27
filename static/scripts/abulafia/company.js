import { Officer } from "./officer.js";

export class Company {

    constructor(apiResponse, api) {

        this.apiResponse =   apiResponse
        this.api =           api

        this.name =          apiResponse.company_name
        this.companyNumber = apiResponse.company_number
        this.status =        apiResponse.company_status
        this.isActive =      (this.status === 'active')

        const parts = apiResponse.date_of_creation.split('-')
        this.dateCreated =   new Date(parts[0], parts[1], parts[2])
        this.dateDissolved = apiResponse.date_of_cessation ? new Date(apiResponse.date_of_cessation) : null

        this.hasCharges =    apiResponse.has_charges

        this.hasInsolvencyHistory =       apiResponse.has_insolvency_history
        this.isLiquidated =               apiResponse.has_been_liquidated
        this.hasUndeliverableAddress =    apiResponse.undeliverable_offfice_address
        this.hasDisputedAddress =         apiResponse.registered_office_is_in_dispute
        this.hasSecretPscs =              apiResponse.has_super_secure_pscs
        this.hasOverdueAccounts =         apiResponse.accounts.overdue



        this.accounts =      apiResponse.accounts
        this.address =       apiResponse.registered_office_address



    }

    async loadOfficers() {

        let officersFetched = 0;
        let totalOfficers = null;
        let officerData = [];

        // First fetch to get total count
        const firstResponse = await this.api.fetchOfficerList(this.companyNumber, officersFetched);
        totalOfficers = firstResponse.total_results;
        officerData = firstResponse.items;
        officersFetched = firstResponse.items.length;

        // Fetch remaining pages
        while (officersFetched < totalOfficers) {

            const response = await this.api.fetchOfficerList(this.companyNumber, officersFetched);
            officerData = officerData.concat(response.items);
            officersFetched += response.items.length;

        }

        const officerObjects = []

        officerData.forEach(officer => {
            const obj = new Officer(officer)
            officerObjects.push(obj)
        })

        this.officers = officerObjects
    }










}
