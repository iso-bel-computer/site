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
        const historyButton = searchArea.querySelector('#showHistory')

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
            if (!companyNumber) {return}
            const company = await this.getCompany(companyNumber)

            this.displayCompany(company)

            this.displayCompanyOfficers(company.officers)

        })

        // toggling active search results
        activeOnlyCheckbox.addEventListener('change', (e) => {
            document.body.classList.toggle(
                'show-inactive',
                e.target.checked
            )
        });

        historyButton.addEventListener('click', e => {
            searchResults.innerHTML = ''
            const historyButtons = (this.formatSearchResults(this.state.cachedCompanies.reverse()))
            searchResults.innerHTML = historyButtons.innerHTML
        })

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
        officerDisplay.addEventListener('click', async e => {

            const clickedCompany = e.target.closest('.officerResult')
            if (!clickedCompany ) {return}

            const companyNumber = clickedCompany.dataset.companyNumber
            if (!companyNumber) {return}

            const company = await this.getCompany(companyNumber)

            this.displayCompany(company)

            this.displayCompanyOfficers(company.officers)


        })
        return officerDisplay
    }

    async getCompany(companyNumber) {
        this.companyDisplay.innerHTML = '<div class="placeholder">Loading...</div>'
        console.log(this.state.cachedCompanies)
        const found = this.state.cachedCompanies.find(c => c.companyNumber === companyNumber)
        if (found) return found
        else {
            const newCompany = this.fetchNewCompany(companyNumber)
            return newCompany
        }
    }

    async fetchNewCompany(companyNumber) {

        const companyData = await this.api.fetchCompanyDetails(companyNumber)
        const company = new Company(companyData, this.api)
        await company.loadOfficers()

        this.state.cachedCompanies.push(company)

        return company
    } 
    /* Everything above this comment runs on init */

    formatSearchResults(results) {

        // this displays the search results from a query in a table

        const div = document.createElement('div')
        results.forEach(result => {

            const row = document.createElement('button')

            row.classList.add('searchResult')
            row.innerText = this.toTitleCase(result?.title || result.name)
            row.dataset.companyNumber = result?.company_number || result.companyNumber
            row.classList.add(
                (result?.company_status === 'active' || result?.status === 'active')
                    ? 'activecompany'
                    : 'inactivecompany'
            )

            div.appendChild(row)

        })
        console.log(results, div)

        return div
    }

    displayCompany(company) {



        this.state.currentlySelectedCompany = company
        let alerts = ''

        company.alerts
            .filter(alert => Object.values(alert)[0]) // only truthy ones
            .map(alert => {
                const key = Object.keys(alert)[0]
                alerts += `<div class='calert'>⚠ ${key}</div>`
            })
        const status = (company.status === 'active' ? 'activecompany' : 'inactivecompany')
        const industries = company.industries.join('<br>')
        const dissolved = company.dateDissolved ? `Dissolved: ${company.dateDissolved.toDateString()}</div>` : ``;
        const address = company.address.address_line_1 + '<br>' + company.address.locality + '<br>' + company.address.postal_code
        if (company.hasDisputedAddress) {address += '<br> ! DISPUTED !'}
        const companyURIName = encodeURIComponent(company.name).replace('LIMITED','')

        this.companyDisplay.innerHTML = `

            <h1 id='cName'>${company.name}</h1>
            <div style='display: flex'>
                ${alerts}
            </div>
            <table>
                <tr>
                    <td>
                        ${industries}
                    </td><td class='leftalign'>
                        <span id='cStatus' class='${status}'>${this.toTitleCase(company.status)}</span><br>
                    </td>
                </tr><tr>
                    <td>
                        <div id='cDateEst'>Est: ${company.dateCreated.toDateString()}</div>
                        <div id='cDateDissolved'>${dissolved}</div>
                    </td><td  class='leftalign'>
                        ${address}
                    </td>
                </tr>
            </table>
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

            <div style='display: flex; align-items: center; margin-top: 10px'>
                <a class='socialLinks' href="https://www.linkedin.com/search/results/companies/?keywords=${companyURIName}" target='_blank'><img src='https://upload.wikimedia.org/wikipedia/commons/6/65/Linkedin-png-linkedin-icon-1600.png'></a><br>
                <a class='socialLinks' href="https://x.com/search?q=${companyURIName}&f=user" target='_blank'><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/960px-Logo_of_Twitter.svg.png'></a><br>
                <a class='socialLinks' href="https://en.wikipedia.org/w/index.php?fulltext=1&search=${companyURIName}" target='_blank'><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Notification-icon-Wikipedia-logo.svg/640px-Notification-icon-Wikipedia-logo.svg.png'></a><br>
                <a class='socialLinks' href="https://bsky.app/search?q=${companyURIName}#people" target='_blank'><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Bluesky_Logo.svg/960px-Bluesky_Logo.svg.png'></a><br>
                <a class='socialLinks' href="https://www.google.com/search?q=${companyURIName}" target='_blank'><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/60px-Google_%22G%22_logo.svg.png?_=20230822192911'></a>
            </div>
            <p id='cNumber'>${company.companyNumber}</p>

            `

        this.displayCompanyOfficers(company.officers)
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
        this.officerDisplay.innerHTML = '<div class="placeholder">Loading...</div>'
        const currentAppointments = this.displayOfficerAppointments(officer.appointments.filter(appt => !appt.resigned_on))
        const pastAppointments = this.displayOfficerAppointments(officer.appointments.filter(appt => appt.resigned_on))

        this.officerDisplay.innerHTML = `
            <h1 id='oName'>${officer.name}</h1>
            <div id='oDob'>DOB: ${this.monthReturn(officer?.dob?.month || '?')} ${officer?.dob?.year || '?'} - ${this.ageFormat(officer?.dob)} years old</div>
            <hr>
            <div class='flex'>
                <div class='flexColumn'>
                    <h3>Current Appts</h3>
                    <div id='oCurrentAppts' class='officerResults'>${currentAppointments}</div>
                </div>
                <div class='flexColumn'>
                    <h3>Past Appts</h3>
                    <div id='oPastAppts' class='officerResults'>${pastAppointments}</div>
                </div>
                </div>

            `

    }

    displayOfficerAppointments(appointments) {

        const div = document.createElement('div')
        if (appointments.length === 0) {div.innerHTML = '<button class="officerResult">None</button>'}

        appointments.forEach(app => {

            const row = document.createElement('button')
            const apptTitle = `<b>${app.appointed_to.company_name}</b>`
            let   timeFromTo = `<br><div class='spacebetween'><span>${this.dateFormat(app.appointed_on, true)}</span>`
            if (app.resigned_on) {
                timeFromTo += `<span>→</span><span>${this.dateFormat(app.resigned_on, true)}</span>`
            } else {
                timeFromTo += `<span>→</span><span>Present</span>`
            }
            timeFromTo += `</div>`
            const timeInPost = `${app.timeInPost['years']}y, ${app.timeInPost['months']}m`
            row.innerHTML = apptTitle
            row.innerHTML += timeFromTo
            row.innerHTML += timeInPost
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
        if (!age) return '?'
        const now = Date.now()
        const dob = new Date(age['year'], age['month'] + 1)
        const diffTime = Math.abs(now - dob);
        const diffYears = Math.floor((diffTime / (1000 * 60 * 60 * 24)) / 365 );
        return diffYears
    }
}
