const helpers = {
    // helper function dumping ground
    toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );
    },

    dateFormat(date, concise) {
        try {
            split = date.split('-')
            console.log(split, date)
            dateParts = {
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

            imgDateMonth = months[dateParts['mm'] - 1]
            const dateStr = dateParts['dd'] +  date_appendage+ ' ' + imgDateMonth + ' ' + dateParts['yy']

            return dateStr
        }
        catch {
            console.error("Couldn't process date: ", date)
            return date
        }
    }
}


async function searchForCompany(searchType, searchData) {

    const searchResultsDiv = document.getElementById('chSearchResults')

    let q

    if (searchType === 'companyList') { /// defining what we want to search to the server
        searchResultsDiv.innerHTML = '<div class="loading">Loading...</div>' // clear previous results
        q = document.getElementById("query").value;
    }

    else if (searchType === 'companyDetails') {
        document.getElementById('companyName').innerHTML = '<div class="loading">Loading...</div>' // clear previous results
        q = searchData
    }

    else if (searchType === 'officerList') {
        q = searchData // just passing the company number again
    }

    try {
        const res = await fetch(
            `/research/abulafia/chsearch?query=${encodeURIComponent(q)}&searchType=${searchType}`
        );

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (searchType === 'companyList') {displaySearchResults(data)}
        if (searchType === 'companyDetails') {
            displayCompany(data)
            searchForCompany('officerList', searchData) // we send another api call for the officer details
        }
        if (searchType === 'officerList') {
            displayOfficersAndPwsc(data)
        }
        console.log(data)

    } catch (error) {
        console.error('Search error:', error);
        searchResultsDiv.innerHTML = 'Error: ' + error.message;
    }

}

function displaySearchResults(data) {
    const searchResultsDiv = document.getElementById('chSearchResults')

    const companies = data.items
    searchResultsDiv.innerHTML = '' // clear loading display
    companies.forEach(company => {

        resultRow = document.createElement('button')
        resultRow.classList.add('searchResult')
        resultRow.innerText = helpers.toTitleCase(company.title)
        resultRow.dataset.companyNumber = company.company_number
        searchResultsDiv.appendChild(resultRow)

    })
}
function displayCompany(data) {

    const dom = {
        'companyInfo': document.getElementById('companyInfo'),
        'name': document.getElementById('companyName'),
        'sic': document.getElementById('companySIC'),
        'number': document.getElementById('companyNumber'),
        'type': document.getElementById('companyType'),
        'status': document.getElementById('companyStatus'),
        'alerts': document.getElementById('companyAlerts'),
        'line': document.getElementById('companyInfoLine'),
        'aliasBtn': document.getElementById('companyAliasButton'),
        'previouslyKnown': document.getElementById('companyPreviouslyKnownAs'),
        'dateCreated': document.getElementById('companyDateCreated'),
        'dateDissolved': document.getElementById('companyDateDissolved'),
        'address': document.getElementById('companyAddress'),
    }


    function displayBasicInfo(data) {

        nameSuffixes = ['LIMITED', 'PLC', 'LTD.', 'LTD', 'LLP']
        let displayName = data.company_name
        nameSuffixes.forEach(s => { // removing these suffixes as we display company type below
            displayName = displayName.replace(s, '')
        })

        const address = data.registered_office_address

        // things that every company really should have
        dom.name.innerText =            helpers.toTitleCase(displayName)             || 'N/A'
        dom.sic.innerText =             data.sic_codes?.join(', ')           || 'N/A'
        dom.number.innerText =          data.company_number                  || 'N/A'
        dom.type.innerText =            data.type.toUpperCase()              || 'N/A'
        dom.dateCreated.innerText =     'Est: ' + helpers.dateFormat(data.date_of_creation)                || 'N/A'
        dom.address.innerHTML =         address['address_line_1']  + (', ' + address['address_line_2'] || '') + '<br>' + address['locality'] + '<br>' + address['postal_code'] || 'N/A'

        dom.status.innerText =          helpers.toTitleCase(data.company_status)     || 'N/A'
        dom.status.className =          ''
        dom.status.className =          'COMPANYSTATUS_' + data.company_status

        dom.line.style.display =        'block'
        // things that only some companies have

        if (data.date_of_cessation) {
            dom.dateDissolved.innerText =   'Dissolved: ' + data.date_of_cessation || ''
            dom.dateDissolved.classList = ''
        } else {dom.dateDissolved.innerHTML = ''}

        dom.previouslyKnown.innerHTML = ''
        if (data.previous_company_names) {
            names = data.previous_company_names
            names.forEach(name => {
                dom.previouslyKnown.insertAdjacentHTML('afterBegin', `<div class='previousName'>${name.name}</div><div class='previousNameDate'>${name.effective_from} - ${name.ceased_on}</div>`)
            })
            dom.aliasBtn.style.display = 'block'
        } else {
            dom.aliasBtn.style.display = 'none'
        }
    }
    function displayAlerts(data) {
        alerts = [ // these are all booleans. if any are true, we create an alert.
            [data.has_insolvency_history ?? false, 'Has insolvency history'],
            [data.accounts.overdue ?? false, 'Accounts overdue'],
            [data.has_been_liquidated ?? false, 'Company liquidated'],
            [data.registered_office_is_in_dispute ?? false, 'Registered office in dispute'], // dont really know what this would mean
            [data.confirmation_statement?.overdue ?? false, 'Confirmation overdue'],
            [data.has_super_secure_pscs ?? false, 'Super Secure PwSC (Identity withheld)'],
            [data.has_charges ?? false, 'Creditors have charges on assets'], // also check what this means
            [data.undeliverable_registered_office_address ?? false, 'Office address undeliverable'], // also check what this means
        ]
        dom.alerts.innerHTML = ''
        alerts.forEach(alert => {
            if (alert[0]) {
                const alertNotification = document.createElement('div')
                alertNotification.classList.add('alert')
                alertNotification.innerText = alert[1]

                dom.alerts.appendChild(alertNotification)

            }
        })

    }

    displayBasicInfo(data)
    displayAlerts(data)


    console.log(data)
}
function displayOfficersAndPwsc(data) {
    const officers = data.officers
    const pwsc = data.pwsc

    const dom = {
        'officers': document.getElementById('companyDirectors'),
        'pwsc': document.getElementById('companyPWSC')
    }

    function buildPeopleList(people, label) {
        let result = document.createElement('div')
        const header = document.createElement('h3')
        header.innerHTML = label
        result.appendChild(header)

        let table = document.createElement('table')
        console.log(people, result)
        if (people.length === 0) {
            noneFound = document.createElement('try')
            noneFound.innerText = `No ${label} found`
            table.appendChild(noneFound)
        }
        people
            .sort((a, b) => new Date(b.appointed_on) - new Date(a.appointed_on))
            .forEach(person => {
                if (!person.resigned_on) {
                    let row = document.createElement('tr')
                    row.classList.add('personResult')

                    let name = document.createElement('td')
                    name.innerText = person.name || "N/A"

                    let dateAppointed = document.createElement('td')
                    dateAppointed.innerText = helpers.dateFormat(person.appointed_on, true) ?? helpers.dateFormat(person.notified_on, true) ?? 'N/A'

                    row.appendChild(name)
                    row.appendChild(dateAppointed)
                    table.appendChild(row)
                }
            })

        result.appendChild(table)
        return result
    }

    dom.officers.replaceChildren(buildPeopleList(officers.items, 'Officers'))
    dom.pwsc.replaceChildren(buildPeopleList(pwsc.items, 'PwSC'))
}

function init() {

    function initSearchResultsListener() {
        const searchResultsDiv = document.getElementById('chSearchResults')
        searchResultsDiv.addEventListener('click', e => {
            const clickedCompany = e.target.closest('.searchResult')
            if (!clickedCompany) {return}
            const companyNumber = clickedCompany.dataset.companyNumber
            searchForCompany('companyDetails', companyNumber)
        })
    }
    function initAliasListener() {
        const aliasDiv = document.getElementById('companyPreviouslyKnownAs')
        const aliasBtn = document.getElementById('companyAliasButton')
        aliasBtn.addEventListener('click', e => {
            if (aliasDiv.style.display === 'none') {
                aliasDiv.style.display = 'block'
                aliasBtn.innerText = 'Aliases ▾'
            } else {
                aliasDiv.style.display = 'none'
                aliasBtn.innerText = 'Aliases ▸'
            }
        })
    }
    function initSearchBar() {
        const input = document.getElementById('query')
        input.addEventListener('keydown', e => { // initial company search
            if (e.key === 'Enter') {searchForCompany('companyList', null)}
        })
    }
    function debug() {
        searchForCompany('companyDetails', '00302132') // DEBUG OPTION TO FETCH NHF IMMEDIATELY
    }

    initSearchResultsListener()
    initAliasListener()
    initSearchBar()
    debug()
}

window.addEventListener("load", e => {init()});
