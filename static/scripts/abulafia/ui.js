import { Company } from "./company.js";

export class UI {

    constructor(api, state) {

        this.element = document.getElementById('contentWrapper')
        this.api = api
        this.state = state

        this.companySearchBar = this.element.querySelector('#companySearch')
        this.searchResults = this.element.querySelector('#chSearchResults')
        this.companyDisplay = this.element.querySelector('#companyInfo')
        this.personDisplay = this.element.querySelector('#personInfo')

        this.addEventListeners()

    }

    addEventListeners() {
        this.searchBarEventListener()
        this.searchResultsEventListener()

    }

    searchBarEventListener() {

        this.companySearchBar.addEventListener('keydown', async e => { // initial company search
            if (e.key === 'Enter') {
                const query = this.companySearchBar.value
                const results = await this.api.fetchCompanyList(query)
                this.displaySearchResults(results.items)
            }
        })

    }

    searchResultsEventListener() {

        this.searchResults.addEventListener('click', async e => {

            const clickedCompany = e.target.closest('.searchResult')
            if (!clickedCompany) {return}

            const companyNumber = clickedCompany.dataset.companyNumber
            const companyData = await this.api.fetchCompanyDetails(companyNumber)
            const company = new Company(companyData, this.api)

            this.state.currentlySelectedCompany = company
            this.displayCompany(company)

            await company.loadOfficers()
            this.displayCompanyOfficers(company)


        })
    }

    /* Everything above this comment runs on init */

    displaySearchResults(results) {

        results.forEach(result => {

            const row = document.createElement('button')

            row.classList.add('searchResult')
            row.innerText = this.toTitleCase(result.title)
            row.dataset.companyNumber = result.company_number
            row.classList.add('company-status', result.company_status === 'active' ? 'active' : 'inactive')

            this.searchResults.appendChild(row)

        })
    }

    displayCompany(company) {

        this.companyDisplay.innerHTML = ''

        // Company header
        const header = document.createElement('div');
        header.classList.add('company-header');

        const name = document.createElement('h2');
        name.textContent = company.name;
        header.appendChild(name);

        const status = document.createElement('span');
        status.classList.add('company-status', company.isActive ? 'active' : 'inactive');
        status.textContent = company.companyStatus;
        header.appendChild(status);

        this.companyDisplay.appendChild(header);

        // Company details
        const details = document.createElement('div');
        details.classList.add('company-details');

        const companyNumber = document.createElement('p');
        companyNumber.innerHTML = `<strong>Company Number:</strong> ${company.companyNumber}`;
        details.appendChild(companyNumber);

        const dateCreated = document.createElement('p');
        dateCreated.innerHTML = `<strong>Date Created:</strong> ${company.dateCreated.toLocaleDateString()}`;
        details.appendChild(dateCreated);

        this.companyDisplay.appendChild(details);


    }

    displayCompanyOfficers() {

    }


    //// Helper Functions

    toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );
    }
    dateFormat(date, concise) {
        try {
            const split = date.split('-')
            const dateParts = {
                'dd': Number(split[2]),
                'mm': Number(split[1]),
                'yy': Number(split[0])
            }

            let date_appendage = 'th'
            if (dateParts['dd'] === 1 || dateParts['dd'] === 21 || dateParts['dd'] === 31) {date_appendage = 'st'}
            if (dateParts['dd'] === 2 || dateParts['dd'] === 22) {date_appendage = 'nd'}
            if (dateParts['dd'] === 3 || dateParts['dd'] === 23) {date_appendage = 'rd'}

            let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            if (concise) {
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }

            const imgDateMonth = months[dateParts['mm'] - 1]
            const dateStr = dateParts['dd'] +  date_appendage+ ' ' + imgDateMonth + ' ' + dateParts['yy']

            return dateStr
        }
        catch {
            console.error('Could not format date: ', date)
            return date
        }
    }
    monthReturn(month) {
        try {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            const result = months[month - 1]
            return result
        }
        catch {
            console.error('Could not format month: ', month)
            return month
        }
    }
    ageFormat(age) {
        const now = Date.now()
        const dob = new Date(age['year'], age['month'] + 1)
        const diffTime = Math.abs(now - dob);
        const diffYears = Math.floor((diffTime / (1000 * 60 * 60 * 24)) / 365 );
        return diffYears
    }
}
