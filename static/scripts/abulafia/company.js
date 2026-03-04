import { Officer } from "./officer.js";
import { sicreference } from './data/siccodes.js';

export class Company {

    constructor(apiResponse, api) {

        console.log(apiResponse)
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

        this.alerts = [

            {'Has insolvency history':        apiResponse.has_insolvency_history},
            {'Has been liquidated':                apiResponse.has_been_liquidated},
            {'Has undeliverable address':    apiResponse.undeliverable_offfice_address},
            {'Has disputed address':          apiResponse.registered_office_is_in_dispute},
            {'Has sceret PSCS':              apiResponse.has_super_secure_pscs},
            {'Accounts overdue':         apiResponse.accounts.overdue}
        ]

        this.accounts =      apiResponse.accounts
        this.address =       apiResponse.registered_office_address

        this.siccodes =      apiResponse.sic_codes
        this.industries =    this.interpretSIC(this.siccodes)


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
            const match = officerObjects.find(o =>
                o.name === obj.name &&
                o?.dob?.year === obj?.dob?.year
            )
            if (!match) {

                officerObjects.push(obj)
            }
        })

        this.officers = officerObjects
    }

    interpretSIC(siccodes) {

        const industries = []

        siccodes.forEach(code => {
            sicreference.forEach(referenceCode => {
                if (referenceCode['SIC Code'] === code) {
                    industries.push(referenceCode['Description'])
                }
            })
        })

        if (industries.length === 0) {industries.push('Unknown Industry')}
        console.log(industries)
        return industries
    }








}
