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
        this.officerDisplay = this.initOfficerDisplay()

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

        companyDisplay.addEventListener('click', async e => {

            const clickedOfficer = e.target.closest('.officerResult')
            if (!clickedOfficer) {return}

            const personNumber = clickedOfficer.classList[1]
            const officer = this.state.currentlyViewingOfficers.find(o => o.personNumber === personNumber)
            const parts = officer.officerAppointmentLink.split('/')
            const personNo = parts[2]

            const officerDetails = await this.api.fetchOfficerDetails(personNo)

            officer.addDetails(officerDetails)

            this.displayOfficer(officer)


        })

        return companyDisplay

    }

    initOfficerDisplay() {

        const officerDisplay = document.getElementById('officerDisplay')
        return officerDisplay
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


        const status = (company.status === 'active' ? 'activecompany' : 'inactivecompany')
        const dissolved = !company.isActive ? `Dissolved: ${company.dateDissolved}</div>` : ``;
        const address = company.address.address_line_1 + '<br>' + company.address.locality + '<br>' + company.address.postal_code
        if (company.hasDisputedAddress) {address += '<br> ! DISPUTED !'}

        this.companyDisplay.innerHTML = `
            <h1 id='cName'>${company.name}</h1>
            <span id='cStatus' class='${status}'>${company.status}</span><br>
            <span id='cNumber'>Company Number: ${company.companyNumber}</span>
            <div id='cDateEst'>Est: ${company.dateCreated.toDateString()}</div>
            <div id='cDateDissolved'>${dissolved}</div>
            <div id='cAddress'>${address}</div>
            <div class='flex'>
                <div class='flexColumn'>
                    <h3 id='cActiveOfficerLabel'>Active Officers</h3>
                    <div id='cActiveOfficers' class='officerResults'>Loading...</div>
                </div>
                <div class='flexColumn'>
                    <h3 id='cPreviousOfficerLabel'>Past Officers</h3>
                    <div id='cPreviousOfficers' class='officerResults'>Loading...</div>
                </div>
            </div>
            <div id='cPwsc'></div>
            `
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
            row.classList.add(officer.personNumber)
            row.dataset.officerAppointmentLink = officer.officerAppointmentLink

            if (officer.active) {

                active.appendChild(row)
            } else {
                inactive.appendChild(row)
            }


        })

        this.state.currentlyViewingOfficers = officers

    }

    displayOfficer(officer) {
        const currentAppointments = this.displayOfficerAppointments(officer.appointments.filter(appt => !appt.resigned_on))
        const pastAppointments = this.displayOfficerAppointments(officer.appointments.filter(appt => appt.resigned_on))

        this.officerDisplay.innerHTML = `
            <h1 id='oName'>${officer.name}</h1>
            <div id='oDob'>DOB: ${this.monthReturn(officer?.dob?.month || '?')} ${officer?.dob?.year || '?'}</div>
            <div class='flex'>
                <div class='flexColumn'>
                    <div id='oCurrentAppts'>${currentAppointments}</div>
                </div>
                <div class='flexColumn'>
                    <div id='oPastAppts'>${pastAppointments}</div>
                </div>
                </div>

            `

    }

    displayOfficerAppointments(appointments) {

        const div = document.createElement('div')
        if (appointments.length === 0) {div.innerHTML = '<button class="officerResult">None</button>'}

        appointments.forEach(app => {

            const row = document.createElement('button')
            row.innerText = app.appointed_to.company_name
            row.classList.add('officerResult')
            row.dataset.companyNumber = app.appointed_to.company_number
            div.appendChild(row)
        })

        return div.innerHTML
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
            return '?'
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
