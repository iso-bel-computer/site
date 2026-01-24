export class Company {

    constructor(apiResponse, api) {

        this.apiResponse =   apiResponse
        this.api =           api

        this.name =          apiResponse.company_name
        this.companyNumber = apiResponse.company_number
        this.companyStatus = apiResponse.company_status
        this.isActive =      (this.companyStatus === 'active')

        this.dateCreated =   new Date(apiResponse.date_of_creation)

        if (!this.isActive) {
            this.dateDissolved = new Date(apiResponse.date_of_cessation)
        } else this.dateDissolved = null



        this.accounts =      apiResponse.accounts
        this.address =       apiResponse.registered_officer_address



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

        this.officers = officerData
    }








}
