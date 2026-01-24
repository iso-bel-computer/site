

function tableConstructor(items) {

    const table = document.createElement('table')

    items.forEach(item => {

        let row = document.createElement('tr')
        row.classList.add('result')

        let name = document.createElement('td')
        name.innerText = item.name || "N/A"
        name.classList.add('resultName')

        // if its got this field it's a corporate appointment
        // so we reassign name
        if (item.appointed_to) {
            name.innerText = item.appointed_to.company_name
        }

        // adding classes if it's an individual officer
        if (item.links?.officer?.appointments) {
            name.classList.add(item.links.officer.appointments)
        }

        // storing this just in case. it might have occupation data in?
        if (item.links?.self) {
            name.classList.add(item.links.self)
        }

        // greying out resigned directors / appts
        if (item.resigned_on) {
            row.classList.add('faded')
        }

        // this works for both individuals and appointments thank GOD
        let dateAppointed = document.createElement('td')
        dateAppointed.classList.add('resultDate')
        dateAppointed.innerText = helpers.dateFormat(item.appointed_on, true) ?? helpers.dateFormat(item.notified_on, true) ?? 'N/A'

        row.appendChild(name)
        row.appendChild(dateAppointed)
        table.appendChild(row)
    })

    return table

}
function linkConstructor(query) {
    const searches = [
        //
        // TODO - change linkedin to work for companies and individuals.
        // will require passing extra params
        // also should add a links individually to result rather than += the html
        // as this destroys event listeners. not really a problem for a tags but could crop up later.
        //
        ['LinkedIn', 'https://www.linkedin.com/search/results/companies/?keywords=', '%20'],
        ['Google',   'https://www.google.com/search?q=', '+'],
    ]
    const result = document.createElement('div')
    searches.forEach(search => {
        const q = query.replaceAll(' ', search[2]) // replace spaces with whatever the search uses
        const link = search[1] + q // construct the link from the base url and urlified query
        result.innerHTML += `<a href=${link} target="_blank">${search[0]}</a> ` // include the label
    })
    return result
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
        'links': document.getElementById('companyLinks')
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
            const names = data.previous_company_names
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
    function displayLinks(data) {
        dom.links.replaceChildren (linkConstructor(data.company_name.toLowerCase()))
    }

    displayBasicInfo(data)
    displayAlerts(data)
   // displayLinks(data)

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

        people.sort((a, b) => new Date(b.appointed_on) - new Date(a.appointed_on))

        // we farm the table construction out to a global function
        // so we can reuse it for appointment displays etc
        table = tableConstructor(people)

        if (people.length === 0) {
            noneFound = document.createElement('try')
            noneFound.innerText = `No ${label} found`
            table.appendChild(noneFound)
        }

        result.appendChild(table)
        return result
    }

    dom.officers.replaceChildren(buildPeopleList(officers.items, 'Officers'))
    dom.pwsc.replaceChildren(buildPeopleList(pwsc.items, 'PwSC'))
}
function displayOfficerDetails(data) {
    const dom = {
        'name': document.getElementById('personName'),
        'age': document.getElementById('personAge'),
        'nationality': document.getElementById('personNationality'),
        'appointments': document.getElementById('personAppointments'),
    }

    dom.name.innerText = data.name

    if (data.date_of_birth) { // some officers don't have dob (eg secretaries)
        dom.age.innerText = `b. ${helpers.monthReturn(data.date_of_birth['month'] ?? '')} ${data.date_of_birth['year']} - ${helpers.ageFormat(data.date_of_birth)} y/o`
    } else dom.age.innerText = 'N/A'

    dom.appointments.replaceChildren(tableConstructor(data.items))
}

function init() {

    function initSearchResultsListener() {
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

    function initCompanyOfficersListener() {
        const peopleDisplays = document.getElementById('companyPeopleDisplays')
        peopleDisplays.addEventListener('click', e => {
            const clickedPerson = e.target.closest('.resultName')
            if (!clickedPerson) {return}
            const personUrl = clickedPerson.classList[1]
            searchForCompany('officerDetails', personUrl)
        })
        return
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
    initCompanyOfficersListener()
    debug()
}

window.addEventListener("load", e => {init()});
