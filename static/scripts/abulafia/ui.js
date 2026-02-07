import { Company } from "./company.js";
import { Officer } from "./officer.js";
// import { Window } from "./windowsystem.js";

export class UI {

    constructor(api, state) {

        this.element = document.getElementById('contentWrapper')
        this.api = api
        this.state = state

        this.searchArea = this.initSearchArea()
        this.companyDisplay = this.initCompanyDisplay()

    }

    initSearchArea() {

        const searchArea = document.getElementById('searchArea')
        const searchBar = searchArea.querySelector('#companySearch')
        const searchResults = searchArea.querySelector('#searchResults')
        const activeOnlyCheckbox = searchArea.querySelector('#showOnlyActiveCompanies')

        // calling to display results of search query
        searchBar.addEventListener('keydown', async e => { // initial company search
            if (e.key === 'Enter') {

                const query = searchBar.value
                const results = await this.api.fetchCompanyList(query)

                searchResults.innerHTML = ''
                searchResults.appendChild(this.formatSearchResults(results.items))

            }
        })

        // setting up to load a company when a result is selected
        searchResults.addEventListener('click', async e => {

            const clickedCompany = e.target.closest('.searchResult')
            if (!clickedCompany) {return}

            const companyNumber = clickedCompany.dataset.companyNumber
            const companyData = await this.api.fetchCompanyDetails(companyNumber)
            const company = new Company(companyData, this.api)

            this.state.currentlySelectedCompany = company
            this.displayCompany(company)

            await company.loadOfficers()
            this.displayCompanyOfficers(company.officers)

        })

        // toggling active search results
        activeOnlyCheckbox.addEventListener('change', (e) => {
            document.body.classList.toggle(
                'show-inactive',
                e.target.checked
            )
        });

        return searchArea
    }


    initCompanyDisplay() {

        const companyDisplay = document.getElementById('companyDisplay')
        const officerLists = companyDisplay.querySelectorAll('.officerResults')

        officerLists.forEach(list => {
            list.addEventListener('click', async e => {

                const clickedOfficer = e.target.closest('.officerResult')
                if (!clickedOfficer) {return}

                const officerAppointmentLink = clickedOfficer.dataset.officerAppointmentLink
                const parts = officerAppointmentLink.split('/')
                const officerNumber = parts[2]

                const officerDetails = await this.api.fetchOfficerDetails(officerNumber)

                const officer = new Officer(officerDetails)

                this.displayOfficer(officer)


            })
        })

        return companyDisplay

    }

    /* Everything above this comment runs on init */

    formatSearchResults(results) {

        // this displays the search results from a query in a table

        const div = document.createElement('div')
        results.forEach(result => {

            const row = document.createElement('button')

            row.classList.add('searchResult')
            row.innerText = this.toTitleCase(result.title)
            row.dataset.companyNumber = result.company_number
            row.classList.add(result.company_status === 'active' ? 'activecompany' : 'inactivecompany')

            div.appendChild(row)

        })

        return div
    }

    displayCompany(company) {

        console.log(company)

        const name = this.companyDisplay.querySelector('#cName')
        name.innerText = company.name

        const status = this.companyDisplay.querySelector('#cStatus')
        status.innerText = this.toTitleCase(company.status)
        status.classList.add(company.status === 'active' ? 'activecompany' : 'inactivecompany')

        const number = this.companyDisplay.querySelector('#cNumber')
        number.innerText = 'Company Number: ' + company.companyNumber

        const dateEst = this.companyDisplay.querySelector('#cDateEst')
        dateEst.innerText = 'Est: ' + company.dateCreated.toDateString()

        const dateDissolved = this.companyDisplay.querySelector('#cDateDissolved')
        if (!company.isActive) {
            dateDissolved.innerText = 'Dissolved: ' + company.dateDissolved
        }

        const address = this.companyDisplay.querySelector('#cAddress')
        address.innerHTML = company.address.address_line_1 + '<br>' + company.address.locality + '<br>' + company.address.postal_code
        if (company.hasDisputedAddress) {
            address.innerHTML += '<br> ! DISPUTED !'
        }


        const activelabel = document.getElementById('cActiveOfficerLabel')
        activelabel.innerHTML = '<h3>Active Officers</h3>'
        const inactivelabel = document.getElementById('cPreviousOfficerLabel')
        inactivelabel.innerHTML = '<h3>Past Officers</h3>'
        const active = document.getElementById('cActiveOfficers')
        active.innerHTML = '<h3>Loading...</h3>'
        const inactive = document.getElementById('cPreviousOfficers')
        inactive.innerHTML = '<h3>Loading...</h3>'



    }

    displayCompanyOfficers(officers) {

        const active = document.getElementById('cActiveOfficers')
        const inactive = document.getElementById('cPreviousOfficers')

        active.innerHTML = ''
        inactive.innerHTML = ''
        officers.forEach(officer => {

            const row = document.createElement('button')

            row.innerText = officer.name
            row.classList.add('officerResult')
            row.dataset.officerAppointmentLink = officer.officerAppointmentLink

            if (officer.active) {

                active.appendChild(row)
            } else {
                inactive.appendChild(row)
            }


        })

    }

    displayOfficer(officer) {

        console.log(officer)
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
