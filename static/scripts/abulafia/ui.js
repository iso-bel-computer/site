import { Company } from "./company.js";
import { Window } from "./windowsystem.js";

export class UI {

    constructor(api, state) {

        this.element = document.getElementById('contentWrapper')
        this.api = api
        this.state = state

        this.searchResultsWindow = this.createSearchWindow()
        this.element.appendChild(this.searchResultsWindow.element)
        this.searchResultsWindow.position(10,10)



    }

    createSearchWindow() {

        const searchWindow = new Window('Search')

        const searchBar = document.createElement('input')
        searchBar.id = 'companySearch'
        searchWindow.addContent(searchBar)

        const searchResults = document.createElement('div')
        searchResults.id = 'chSearchResults'
        searchWindow.addContent(searchResults)

        searchBar.addEventListener('keydown', async e => { // initial company search
            if (e.key === 'Enter') {

                const query = searchBar.value
                const results = await this.api.fetchCompanyList(query)

                searchResults.innerHTML = this.formatSearchResults(results.items)
            }
        })

        searchResults.addEventListener('click', async e => {

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

        return searchWindow
    }

    /* Everything above this comment runs on init */

    formatSearchResults(results) {


        const div = document.createElement('div')
        results.forEach(result => {

            const row = document.createElement('button')

            row.classList.add('searchResult')
            row.innerText = this.toTitleCase(result.title)
            row.dataset.companyNumber = result.company_number
            row.classList.add('company-status', result.company_status === 'active' ? 'active' : 'inactive')

            div.appendChild(row)

        })

        return div
    }

    displayCompany(company) {

        const companyWindow = new Window()
        this.companyDisplay.appendChild(companyWindow)

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
