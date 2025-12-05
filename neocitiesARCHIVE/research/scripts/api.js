/// wait until all page content has loaded before loading api.js
document.addEventListener('DOMContentLoaded', function() {

// load all DOM elements (buttons, divs, etc)
const DOMElements = {
    testDiv: document.getElementById('console'),
    peopleDiv: document.getElementById('people'),
    totalResultsDiv: document.getElementById('totalResults'),
    resultsNumberDiv: document.getElementById('resultsNumber'),
    newsDisplayDiv: document.getElementById('newsDisplay'),
    details: document.getElementById('details'),
    resetButtonDiv: document.getElementById('resetButton'),
    debugconsole: document.getElementById('debugconsole'),
    companieshousebutton: document.getElementById('companieshousebutton'),
    testButton: document.getElementById('testButton'),

    loadCouncillorsButton: document.getElementById('loadCouncillorsButton')


}

/// test button 

DOMElements.testButton.addEventListener('click', function(event) {
    searchCompany('local government association')

})


// config folder for auth tokens, return results, etc
const CONFIG = {
    newsAPIKey: 'dc64371d85514ec3b0c8433ebd4f6d4f',
    companiesHouseAPIKey: 'cede43d9-f791-46df-ac00-8efbec44f039',
    resultsPerSearch: 70,
}




let SICCodes = []
fetch('/research/SICCodes.json')
    .then(response => response.json())
    .then(data => {
        SICCodes = data;
    })
    .catch(error => {
        console.error('Error loading sic codes', error);
    });


/// RESEARCH INTERACTION ///

// search for list of officers. will display list of officers and their desscription provided by the api (usually just number of appointments and DOB). currently unclickable. 
// currently only invoked mannually. otherwise you will usually have the link for the specific officer. 
// need to integrate into fetchSpecificOfficerDetails() 
function searchOfficer(firstName, lastName) {
    const fullName = `${firstName} ${lastName}`;
    const searchUrl = `https://api.company-information.service.gov.uk/search/officers?q=${encodeURIComponent(fullName)}&items_per_page=15`;

    fetch(searchUrl, {
    headers: {
        'Authorization': 'Basic ' + btoa(CONFIG.companiesHouseAPIKey)
    }})

        .then(response => response.json())
        .then(data => {
            const titles = data.items.map(item => item.title);
            const desc = data.items.map(item => item.description)

            const combined = titles.map((title, index) => `${title} - ${desc[index]}`);
            DOMElements.testDiv.innerHTML = '<ul><li>' + combined.join('</li><li>') + '</li></ul>';

        })
        .catch(error => {
        console.error('Error:', error);
        DOMElements.testDiv.innerHTML = 'Error: ' + error.message;
        })
    
    DOMElements.peopleDiv.innerHTML = `
    <a href="https://www.linkedin.com/search/results/people/?keywords=%22${firstName}+${lastName}%22" target='_blank'>search linkedin?</a><br>
    <a href="https://x.com/search?q=${firstName}%20${lastName}&f=user" target='_blank'>search x dot com?</a> <br>
    <a href="https://en.wikipedia.org/w/index.php?fulltext=1&search=${firstName}+${lastName}" target='_blank'>search wikipedia?</a>    `

}

// this fetches the search list of companies from the api
// and creates a list of clickable links to fetch the specific company
function searchCompany(company) {
    // fetch from companies house 
    const searchUrl = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(company)}&items_per_page=${CONFIG.resultsPerSearch}`; 
    fetch(searchUrl, {
        headers: {'Authorization': 'Basic ' + btoa(CONFIG.companiesHouseAPIKey)}
    })
    .then(response => response.json())
    .then(data => {
        const titles = data.items.map(item => item.title)
        const titlesFormatted = titles.map(item => 
            item.toLowerCase().split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '))
        const links = data.items.map(item => item.links.self)
        const status = data.items.map(item => item.company_status)
        /* const companyType = data.items.map(item => item.company_type)*/
        const linkElements = titlesFormatted.map((title, index) => {
            return `<tr><td class="whitelinks ${status[index]}_" id='consoleTitleRow'><a href="#" class="company-link" data-company-link="${links[index]}">${title}</a></td></tr>`
        })  
        
        DOMElements.testDiv.innerHTML = '<table>' + linkElements.join('') + '</table>'

        let totalResults = data.total_results
        DOMElements.totalResultsDiv.innerHTML = "total results: " + totalResults
        DOMElements.resultsNumberDiv.innerHTML = "1 / " + Math.round(totalResults / CONFIG.resultsPerSearch) 
    })
    .catch(error => {
            DOMElements.testDiv.innerHTML = '<p style="color: red;">error loading companies. oops!</p>'
            console.error(error)
    })

    /// UGH NEWS API BLOCKS BROWSER REQUESTS. commenting this out until i bash my head together enough to figure out a backend. 
    // fetch from news api 
    /* const lastWeekDate = new Date(Date.now() - 604800000)
    const lastWeekDateFormatted = lastWeekDate.toISOString().split('T')[0]
    fetch(`https://newsapi.org/v2/everything?q=${company}&from=2025-09-07&sortBy=popularity&apiKey=${CONFIG.newsAPIKey}`)
        .then (response => response.json())
        .then (data => {
            DOMElements.newsDisplayDiv.innerHTML = JSON.stringify(data)
        }) */
}


function formatToTitleCase(foo) {
    if (typeof foo === 'string') {
        return foo.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    if (Array.isArray(foo)) {
        return foo.map(item => {
            if (typeof item === 'string') {
                return item.toLowerCase().split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            }
            return item; // Return non-strings unchanged
        });
    }
    return foo;
}

// this creates the links when you click on a specific company from the list of companies 
DOMElements.testDiv.addEventListener('click', function(event) {
    if (event.target.classList.contains('company-link')) {
        const companyLink = event.target.dataset.companyLink
        fetchCompanyDetails(companyLink)
    }
})


////////////////////////////////////////////////////////////////////////////////////////////////

// finding the specific API details once a link has been clicked on.
function fetchCompanyDetails(companyLink) {
   
    const fullURL = `https://api.company-information.service.gov.uk${companyLink}`
    const companyFieldsConfig = [

        {label: 'Industry',   key: 'sic_codes',              formatter: formatSicCodes},
        {label: 'Status',   key: 'company_status',              formatter: formatType},
        {label: 'Created',          key: 'date_of_creation'},
        {label: 'Dissolved',          key: 'date_of_cessation'},
        {label: 'Adress',          key: 'registered_office_address',   formatter: formatAddress},
        {label: 'Type',     key: 'type',                        formatter: formatType},
        {label: 'Prev Names',   key: 'previous_company_names',      formatter: formatPreviousNames},
        {label: 'Accounts',         key: 'links',                       formatter: formatAccounts},
        {label: 'Current Officers',         key: 'links',                       formatter: formatOfficers},
        {label: 'Former Officers',         key: 'links',                       formatter: formatPastOfficers},
        {label: 'Links',         key: 'company_name',                       formatter: formatCompanyLinks}

    ]

    fetch(fullURL, {
        headers: {'Authorization': 'Basic ' + btoa(CONFIG.companiesHouseAPIKey)}
    })
        .then (response => {
            if (!response.ok) {throw new Error (`HTTP error! status: ${response.status}`)}
            return response.json()})
        .then (data => {
            displayDetails(data, DOMElements.details, data.company_name, companyFieldsConfig)
            fetchOfficerData(data)
            fetchPWSC(data)
        })
        .catch(error => {
            DOMElements.details.innerHTML = '<p style="color: red;">error loading company details. oops!</p>'
            console.error(error)
        })
    

}

function displayDetails(data, div, nameField, fieldsConfig, flagField) {
    
    div.innerHTML = `
        <b>${nameField || 'N/A'}</b></div><div id=${flagField}></div>
        <table class="company-details-table">
            ${fieldsConfig.map(field => createTableRow(data, field)).join('')}
    `

    if (data.accounts && data.accounts.overdue === true) document.getElementById('accountsOverdueAlert').innerHTML = 'Overdue!'

}

function createTableRow(data, field) {
    const value = getFieldValue(data, field)
    if (value === 'None' || value === 'N/A') return '' 
    return `<tr><td id='detailLeft'>${field.label}</td><td id='detailRight'>${value}</td></tr>`
}

function getFieldValue(data, field) {
    let value = data[field.key]
    // Apply custom formatter if provided
    if (field.formatter && value) {
        return field.formatter(value)
    }
    return value || 'N/A'
}

// this gets the company list of officers, separate to the actual company information. 
function fetchOfficerData(data) {
    accountLink = data.links.officers

    fetch(`https://api.company-information.service.gov.uk${accountLink}`, {
        headers: {'Authorization': 'Basic ' + btoa(CONFIG.companiesHouseAPIKey)}
    })
    .then(response => response.json()) 
    .then(data => {
        displayOfficers(data)
    })
}

function fetchPWSC(data) {
    pwscLink = data.links.persons_with_significant_control || data.links.persons_with_significant_control_statements
    
    fetch(`https://api.company-information.service.gov.uk${pwscLink}`, {
        headers: {'Authorization': 'Basic ' + btoa(CONFIG.companiesHouseAPIKey)}
    })
    .then(response => response.json()) 
    .then(data => {
        DOMElements.debugconsole.innerHTML = JSON.stringify(data, null, 4)
    })

}

/// this displays the list of officers within the company list. 
function displayOfficers(data) {
        const activeOfficers = data.items.filter(officer => !officer.resigned_on)
        const pastOfficers = data.items.filter(officer => officer.resigned_on)
        const officersListDiv = document.getElementById('officersList')
        const pastOfficersDiv = document.getElementById('pastOfficers')

        const names = activeOfficers.map(item => item.name)
        const links = activeOfficers.map(item => item.links.officer.appointments)
        const appointedOn = activeOfficers.map(item => {
            const apptd = item.appointed_on
            return apptd ? apptd.toString().slice(2) : '' 
        })
        const officerRoles = activeOfficers.map(item => item.officer_role)
        const secretary = officerRoles.map(item => {if(item === 'secretary') {return '(secretary)'} else {return ''}})
        const secretaryFlag = officerRoles.map(item => {if(item === 'secretary') {return '<i>'} else {return ''}})
        const secretaryFlagEnd = officerRoles.map(item => {if(item === 'secretary') {return '</i>'} else {return ''}})

        /*const dob_d = activeOfficers.map(item => item.date_of_birth?.day || '')
        const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const dob_m = activeOfficers.map(item => {
            const monthNum = item.date_of_birth?.month
            return monthNum ? months[monthNum] : ''
        })
        const dob_y = activeOfficers.map(item =>    { 
            const year = item.date_of_birth?.year
            return year ? year.toString().slice(-2) : ''})*/

        const pastnames = pastOfficers.map(item => item.name)
        const pastlinks = pastOfficers.map(item => item.links.officer.appointments)
        const pastAppointedOn = pastOfficers.map(item => {
            const apptd = item.appointed_on
            return apptd ? apptd.toString().slice(2) : '' 
        })
        const pastResignedOn = pastOfficers.map(item => {
            const apptd = item.resigned_on
            return apptd ? apptd.toString().slice(2) : '' 
        })


        const linkElements = names.map((title, index) => {
            return `<tr><td class="whitelinks appointedOfficerName">${secretaryFlag[index]}<a href="#" class="officer-link" data-officer-link="${links[index]}">${title} ${secretary[index]} ${secretaryFlagEnd[index]}</a></td><td class='appointedOfficerDates'>${appointedOn[index] || ''}</td><td class='appointedOfficerDates'> </td></tr>`
        })  
        
        const pastLinkElements = pastnames.map((title, index) => {
            return `<tr><td class="whitelinks appointedOfficerName"><a href="#" class="officer-link" data-officer-link="${pastlinks[index]}">${title}</a></td><td class='appointedOfficerDates'><i>${pastAppointedOn[index] || '?'}</i></td><td class='appointedOfficerDates'><i> ${pastResignedOn[index] || '?'}</i></td></tr>`
        })  

        officersListDiv.innerHTML = '<table class="appointedOfficerTable">' + linkElements.join('') + '</table>'
        pastOfficersDiv.innerHTML = '<table class="appointedOfficerTable">' + pastLinkElements.join('') + '</table>'
        if (pastLinkElements.length == 0) {pastOfficersDiv.innerHTML = '-'}

}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// FORMATTING //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function formatAddress(address) {
    const parts = [
        address.address_line_1,
        address.address_line_2,
        address.locality,
        address.postal_code
    ].filter(part => part)
    
    return parts.join('<br>') || 'N/A'
}
function formatPastOfficers() {
    return `<div id='pastOfficers'></div>`
}
function formatType(companyType) {
    if (!companyType) return 'N/A'
    return companyType.replace(/-/g, ' ')
}
function formatPreviousNames(previousNames) {
    if (!Array.isArray(previousNames) || previousNames.length === 0) {
        return 'None'
    }

    return previousNames
        .map(nameObj => {
            let name = nameObj.name || 'Unknown'
            name = formatToTitleCase(name)
            const from = nameObj.effective_from || 'Unknown'
            const to = nameObj.ceased_on || 'Present'
            
            return `<div style='width: 100%'>${name}</div><div style='width: 100%' class='bottomMargin'><small>${from} to ${to}</small></div>`
        })
        .join('')
}
function formatAccounts(links) {
    if (!links || !links.filing_history) {
        return 'None'
    }
    const accountLink = links.filing_history


    return `
    <div id='accountsTableRow'>
    <div><a href='https://find-and-update.company-information.service.gov.uk${accountLink}' target="_blank">link</a></div>
    <div id='accountsOverdueAlert'></div>
    </div>`

}
function formatOfficers(links) {
    if (!links || !links.filing_history) {return 'None' }
    const accountLink = links.officers
    return `<div id='officersList'></div><a href='https://find-and-update.company-information.service.gov.uk${accountLink}' target="_blank"></a>`
}
function formatSicCodes(codes) {
    if (!codes) {return 'N/A' }
    const industries = codes.map(code => {
        return SICCodes.find(element => element['SIC Code'] === code);
        }).filter(industry => industry !== undefined); // Remove any codes that weren't found
    
    const industryDescriptions = industries.map(industry => industry.Description)

    return industryDescriptions.join('<br>');

}
function formatCompanyLinks(name) {
    
    cleanCompanyName(name)
    
    return `
    <a class='whitelinks' href="https://www.linkedin.com/search/results/companies/?keywords=${name}" target='_blank'>search linkedin?</a><br>
    <a class='whitelinks' href="https://x.com/search?q=${name}&f=user" target='_blank'>search x dot com?</a> <br>
    <a class='whitelinks' href="https://en.wikipedia.org/w/index.php?fulltext=1&search=${name}" target='_blank'>search wikipedia?</a><br>    
    <a class='whitelinks' href="https://bsky.app/search?q=${name}#people" target='_blank'>search bluesky?</a><br>
    <a class='whitelinks' href="https://www.google.com/search?q=${name}" target='_blank'>search google?</a>    
    `


} 

function formatDOB(dob) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const dob_m = months[dob.month - 1]
    const dob_y = dob.year
    const datey = new Date().getFullYear()
    const datem = new Date().getMonth()
    let age = datey - dob_y
    if((dob.month - 1) > datem) {age = age - 1}

    return `${dob_m} ${dob_y} <small>(${age}y/o)</small>`

    }

function cleanCompanyName(name) {
    const suffixesToRemove = ['Limited', 'Ltd', 'CIC', 'PLC', 'LLP', 'LLC']
    let cleanName = name
    
    suffixesToRemove.forEach(suffix => {
        cleanName = cleanName.replace(new RegExp(`\\b${suffix}\\b`, 'gi'), '')
    })
    
    return cleanName.trim()
}


DOMElements.details.addEventListener('click', function(event) {
    if (event.target.classList.contains('officer-link')) {
        event.preventDefault()  // ← Only prevent default for officer links
        const officerLink = event.target.dataset.officerLink
        fetchSpecificOfficerDetails(officerLink)
    }
})

function fetchSpecificOfficerDetails(officerLink) {
    const fullURL = `https://api.company-information.service.gov.uk${officerLink}`


    fetch(fullURL, {
        headers: {'Authorization': 'Basic ' + btoa(CONFIG.companiesHouseAPIKey) }
    })
        .then (response => {
            console.log(response)
            if (!response.ok) {throw new Error (`HTTP error! status: ${response.status}`)}
            return response.json()})
        .then (data => {
            const officerFieldsConfig = [
                {label: 'DOB',                       key: 'date_of_birth',    formatter: formatDOB},
                {label: 'Occupation',                       key: 'items',    formatter: formatOccupation},
                {label: 'Nationality',                       key: 'items',    formatter: formatNationality},
                {label: 'Current Appointments',                 key: 'items',    formatter: formatOfficerCurrentAppointments},
                {label: 'Past Appointments',               key: 'items',    formatter: formatOfficerPastAppointments},
                {label: 'Social Search',                     key: 'items',    formatter: formatSocialMediaLinks}
            ]
            displayDetails(data, DOMElements.peopleDiv, data.name, officerFieldsConfig, 'officerFlags')
            DOMElements.peopleDiv.insertAdjacentHTML('afterBegin',"<div id='politicalConnectionAlert'></div>")


            /// removing middle name to more easily match with councillor dataset
            const officerName = data.name
            let tmp = officerName.split(" ");
            officerNameNoMiddleName = tmp[0] + " " + tmp[tmp.length-1];
            checkPoliticalConnections(officerNameNoMiddleName)
        })
        .catch(error => {
            console.error(error)
        })
    

}

// COUNCILLOR DATA INTEGRATION
// loads councillorData as a blank array to start with 
let councillorData = []
fetch('/research/opencouncildata_councillors.json')
.then(response => response.json())
.then(data => {
    councillorData = data;})
.catch(error => {
    console.error('Error loading councillor data:', error);
});

function checkPoliticalConnections(officerName) {
    
    /// councillor check
    officerName = officerName.toLowerCase()
    const matchedCouncillor = councillorData.find((councillor => councillor['Councillor Name'].toLowerCase() === officerName)) 
    if (matchedCouncillor) {
        const message = `<i>${matchedCouncillor['Party Name']} councillor at ${matchedCouncillor['Council'] + ' Council? <i>'|| '<i>Possible Cllr at Unknown Council</i>'}`
        displayOfficerFlags(message)
        return {
            flag: 'Possible Cllr!',
            message: message,
            councillorData: matchedCouncillor
        }
    } else {
        return {
            flag: '',
            message: '',
            councillorData: null
        }
    }
}

function displayOfficerFlags(message) {
    const politicalConnectionAlertDiv = document.getElementById('officerFlags') 
    politicalConnectionAlertDiv.innerHTML = message
}

function formatOccupation(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'N/A'
  }
  
  const occupations = items.map(item => item.occupation)
    .filter(occupation => occupation && occupation.trim() !== '') // Filter out empty/blank strings
  
  if (occupations.length === 0) {
    return 'N/A' // Return N/A if no valid occupations remain
  }
  let uniqueOccupations = occupations.filter((value, index, array) => array.indexOf(value) === index);
  return uniqueOccupations.join('<br>')
}

function formatNationality(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'N/A'
  }
  
  const nationality = items.map(item => item.nationality)
    .filter(nationality => nationality && nationality.trim() !== '') // Filter out empty/blank strings
  
  if (nationality.length === 0) {
    return 'N/A' // Return N/A if no valid occupations remain
  }
  let uniqueNationalities = nationality.filter((value, index, array) => array.indexOf(value) === index);
  return uniqueNationalities.join('<br>')
}

function formatOfficerPastAppointments(items) {
    const inactiveCompanies = items.filter(items => items.resigned_on !== undefined)
    if (inactiveCompanies.length === 0) {return 'None'}
    return inactiveCompanies 
        .map(companies => {
            let names = companies.appointed_to.company_name || 'Unknown'
            names = formatToTitleCase(names)
            let appointedOn = `<small>${companies.appointed_on}</small>` || ''
            let resignedOn = `<small>${companies.resigned_on}</small>`
            return `<div style='width: 100%' class='inactiveCompany'>${names}</div><i><div style='width: 100%' class='bottomMargin inactiveCompany flexContainer'><div><small>${appointedOn} - ${resignedOn}</small></div><div></div></div></i>`
        })
        .join('')
}

function formatOfficerCurrentAppointments(items) {
  const activeCompanies = items.filter(item => item.resigned_on === undefined)
  
  return activeCompanies
    .map((item, index) => {
      const companyLink = item.links.company
      const companyName = formatToTitleCase(item.appointed_to.company_name || 'Unknown')
      const appointedOn = item.appointed_on ? `<small>${item.appointed_on}</small>` : ''
      let companyStatus = ''
      if(item.appointed_to.company_status === 'active') {'<div'} else {companyStatus = '<div class="inactiveCompany">'}  
      return `${companyStatus}<div style='width: 100%' class='officerCompanyList'><a href="#" class="company-link whitelinks" data-company-link="${companyLink}">${companyName}</a></div><i><div style='width: 100%' class='bottomMargin'>${appointedOn}</div></i></div>`
    })
    .join('')
}

DOMElements.peopleDiv.addEventListener('click', function(event) {
    if (event.target.classList.contains('company-link')) {
        event.preventDefault()
        const companyLink = event.target.dataset.companyLink
        fetchCompanyDetails(companyLink)
    }
})



function formatSocialMediaLinks(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return 'N/A'
    }

    const firstName = items[0].name_elements.forename
    const lastName = items[0].name_elements.surname

    return `
    <small>
    <a class='whitelinks' href="https://www.linkedin.com/search/results/people/?keywords=%22${firstName}+${lastName}%22" target='_blank'>search linkedin?</a><br>
    <a class='whitelinks' href="https://x.com/search?q=${firstName}%20${lastName}&f=user" target='_blank'>search x dot com?</a> <br>
    <a class='whitelinks' href="https://en.wikipedia.org/w/index.php?fulltext=1&search=${firstName}+${lastName}" target='_blank'>search wikipedia?</a><br>    
    <a class='whitelinks' href="https://bsky.app/search?q=${firstName}+${lastName}#people" target='_blank'>search bluesky??</a><br>
    <a class='whitelinks' href="https://www.google.com/search?q=${firstName}+${lastName}" target='_blank'>search google?</a>    
    </small>`

    

}



DOMElements.companieshousebutton.addEventListener('click', function(event) {
    const firstName = document.querySelector('input[name="fname"]').value;
    const lastName = document.querySelector('input[name="lname"]').value;
    const company = document.querySelector('input[name="company"]').value;

    if (firstName || lastName) {searchOfficer(firstName, lastName)}
    if (company) {searchCompany(company)}
})

DOMElements.resetButtonDiv.addEventListener('click', function(event) {
    clearDisplay()
})

function clearDisplay() {
    DOMElements.testDiv.innerHTML = '<div class="defaultDisplay"><img src="/research/search.png"></div>'
    DOMElements.details.innerHTML = '<div class="defaultDisplay"><img src="/research/business.png"></div>'
    DOMElements.peopleDiv.innerHTML = '<div class="defaultDisplay"><img src="/research/person.png"></div>'
}

})