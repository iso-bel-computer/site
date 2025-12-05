document.addEventListener('DOMContentLoaded', function() {

const feedDiv = document.getElementById('rss')
    let articleText = ''

const feeds = [
    {
        title: 'Government Housing announcements',
        button: 'MHCLGNewsButton',
        url: 'https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=ministry-of-housing-communities-local-government',
        type: 'rss',
        www: 'https://www.gov.uk/search/all',
        searchOperator: 'keywords',
        additionalParamaters: '<input type="hidden" name="parent" value="ministry-of-housing-communities-local-government"> <input type="hidden" name="organisations[]" value="ministry-of-housing-communities-local-government"> ',
    },
    {
        title: 'MHCLG Policy Papers and Consultations', 
        button: 'MHCLGPolicyButton',
        url: 'https://www.gov.uk/search/policy-papers-and-consultations.atom?organisations%5B%5D=ministry-of-housing-communities-local-government',
        type: 'rss',
        www: 'https://www.gov.uk/search/all',
        searchOperator: 'keywords',
        additionalParamaters: '<input type="hidden" name="parent" value="ministry-of-housing-communities-local-government"> <input type="hidden" name="organisations[]" value="ministry-of-housing-communities-local-government"> ',


    },
    {
        title: 'MHCLG - Homelessness Stats', 
        button: 'HLessButton',
        url: 'https://www.gov.uk/search/research-and-statistics.atom?content_store_document_type=all_research_and_statistics&topic%5B%5D=dad5f9c9-410f-4320-aa14-860ccba2273e',
        type: 'rss',
        www: 'https://www.gov.uk/search/all',
        searchOperator: 'keywords',
        additionalParamaters: '<input type="hidden" name="parent" value="ministry-of-housing-communities-local-government"> <input type="hidden" name="organisations[]" value="ministry-of-housing-communities-local-government"> ',


    },

    {
        title: 'Regulator of Social Housing', 
        button: 'RSHButton',
        url: 'https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=regulator-of-social-housing',
        type: 'rss',
        www: 'https://www.gov.uk/search/all',
        searchOperator: 'keywords',
        additionalParamaters: '<input type="hidden" name="parent" value="regulator-of-social-housing"> <input type="hidden" name="organisations[]" value="regulator-of-social-housing"> <input type="hidden" name="order" value="updated-newest"> ',

    },

    {
        title: 'Housing Ombudsman', 
        button: 'HOButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMWbBmeUPpNS.json',
        type: 'json',
        www: 'https://www.housing-ombudsman.org.uk',
        searchOperator: 's',
        additionalParamaters: ''

    },

    {
        title: 'Local Government Association (Housing)', 
        button: 'LGAButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMTTte7A-Ami.json',
        type: 'json',
        searchOperator: '',
        www: 'https://www.local.gov.uk/search/',
        additionalParamaters: ''


    },
    {
        title: 'London Councils', 
        button: 'londonCouncilsButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMWUxamcNxly.json',
        type: 'json',
        www: 'https://www.londoncouncils.gov.uk/search?',
        searchOperator: 'keys',
        additionalParamaters: ''

    },

    {
        title: 'Chartered Institute of Housing', 
        button: 'CIHButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMTRWNUZcjai.json',
        type: 'json',
        www: 'https://www.cih.org/search',
        searchOperator: 'Term',
        additionalParamaters: ''

    },
    {
        title: 'Chartered Institute of Housing - Publications', 
        button: 'CIHPButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMiQh8fBg1hC.json',
        type: 'json',
        www: 'https://www.cih.org/search',
        searchOperator: 'Term',
        additionalParamaters: ''

    },


    {
        title: 'National Housing Federation',
        button: 'NHFButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMfiMeCes2qy.json',
        type: 'json',
        www: 'https://www.housing.org.uk/search-results/',
        searchOperator: 'q',
        additionalParamaters: ''

    },

    {
        title: 'Greater London Authority - Publications',
        button: 'GLAButton',
        url: 'https://www.london.gov.uk/rss-feeds/80636',
        type: 'rss',
        www: 'https://www.london.gov.uk/search',
        searchOperator: 'query',
        additionalParamaters: ''

    },

    {
        title: 'Homeless Link',
        button: 'HLButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMf8Gs8XeqJS.json',
        type: 'json',
        www: 'https://homeless.org.uk/search/',
        searchOperator: 'q',
        additionalParamaters: ''

    },

    {
        title: 'Office for National Statistics',
        button: 'ONSButton',
        url: 'https://www.ons.gov.uk/peoplepopulationandcommunity/housing/publications?rss&filter=bulletin',
        type: 'rss',
        www: 'https://www.ons.gov.uk/search',
        searchOperator: 'q',
        additionalParamaters: ''

    },
    {
        title: 'Shelter',
        button: 'ShelterButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMgVLgwjtvfD.json',
        type: 'json',
        www: 'https://england.shelter.org.uk/search',
        searchOperator: 'query',
        additionalParamaters: ''

    },

    {
        title: 'Trust for London',
        button: 'T4LButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMgZn2nb9TWS.json',
        type: 'json',
        www: 'https://trustforlondon.org.uk/search',
        searchOperator: 'q',
        additionalParamaters: ''

    },
    {
        title: 'Centre for London',
        button: 'C4LButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMgakQoJlN4k.json',
        type: 'json',
        www: 'https://centreforlondon.org/',
        searchOperator: 's',
        additionalParamaters: '<input type="hidden" name="list-type" value="list">'

    },
    {
        title: 'G15',
        button: 'G15Button',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMgfMIBVMKyS.json',
        type: 'json',
        www: 'https://centreforlondon.org/',
        searchOperator: 's',
        additionalParamaters: '<input type="hidden" name="list-type" value="list">'

    },
    {
        title: 'Lewisham Google Alert',
        button: 'LhamButton',
        url: 'https://www.google.com/alerts/feeds/04165496382308585712/6768391948173463387',
        type: 'rss',
        www: '',
        searchOperator: 'q',
        additionalParamaters: ''

    },
    {
        title: 'Nearly Legal',
        button: 'NLButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMgv57vP5SuT.json',
        type: 'json',
        www: 'https://nearlylegal.co.uk',
        searchOperator: 's',
        additionalParamaters: ''

    },
    {
        title: 'Centre for Regional Economic and Social Research ',
        button: 'CRESRButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMig-jVhqfIC.json',
        type: 'json',
        www: 'https://www.shu.ac.uk/search-results',
        searchOperator: 'q',
        additionalParamaters: ''

    },
    {
        title: 'Commonweal ',
        button: 'CWButton',
        url: 'https://fetchrss.com/feed/aMS63AlvXTyDaMihe0cD7xyC.json',
        type: 'json',
        www: 'https://www.commonwealhousing.org.uk',
        searchOperator: '',
        additionalParamaters: ''

    },






]
function createFeedButton(button, url, title, type, www, searchOperator, feedAddParam) {  // Remove 'div' parameter
  const feedButton = document.getElementById(button)
  if (!feedButton) {
    console.error(`Button with ID '${button}' not found`);
    return;
  }
  feedButton.addEventListener('click', function() {
    articleText = '';
    Promise.all([
        fetchFeed(url, type),
    ]).then(() => {
        displayRSSFeed(articleText, title, www, searchOperator, feedAddParam)})
  })
}

function fetchFeed(url, type) {
    if (type === 'json') {
        return fetchJSONFeed(url)
    }
    if (type === 'rss') {
        return fetchRSSFeed(url)
    }
    else return ''
}

function fetchJSONFeed(url) {
    return fetch(url)
    .then(response => response.json())
    .then(data => {
        data.items.map(article => {
            const title = article.title || ``;
            const link = article.link || ''
            const date_m = article.pubDate.substring(8, 11)
            const date_d = article.pubDate.substring(5, 7)
            const date_y = article.pubDate.substring(12, 16)
            let date_appendage = 'th'
            if (date_d === '01' || date_d === '21' || date_d === '31') {date_appendage = 'st'}
            if (date_d === '02' || date_d === '22') {date_appendage = 'nd'}
            if (date_d === '03' || date_d === '23') {date_appendage = 'rd'}
            const desc = article.description

            const searchTitle = title.replace(/ /g,"+");


            articleText += `<div class='newsLine'>
                <div class='rssDate'><b>${date_m} ${parseInt(date_d)}${date_appendage}</b><br><i>${date_y}</i><br><br><a target='_blank' href=https://www.google.com/search?q=${searchTitle}&tbm=nws>🔍</a> </div>
                <div class='newsTitle'><a target='_blank' class='whitelinks' href='${link}'><b>${title}</b></a><br>${desc}</div>
                </div>
                `;
            })
        }
        )
}

function fetchRSSFeed(url) {
    return fetch(url)
    .then (response => response.text())
    .then(xmlString => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        
        let items = xmlDoc.getElementsByTagName('item') || [];
        if (items.length === 0) {
            items = xmlDoc.getElementsByTagName('entry') || [];
        }
        for (let i = 0; i < items.length; i++) {
        const item = items[i]; // Get individual item
        
        // Extract data from this specific item
        const title = item.getElementsByTagName('title')[0].textContent;
        let link = item.getElementsByTagName('link')[0].textContent;
        const linkEl = item.getElementsByTagName('link')[0];
        console.log(linkEl)
        if(linkEl !== null) {link = linkEl.getAttribute('href')}

        console.log(link)
        const descElement = item.getElementsByTagName('description')[0];
        const summaryElement = item.getElementsByTagName('summary')[0];

        let description = '';
        if (descElement) {
            description = descElement.textContent;
        } else if (summaryElement) {
            description = summaryElement.textContent;
        }

        const updatedElement = item.getElementsByTagName('updated')[0];
        const pubDateElement = item.getElementsByTagName('pubDate')[0];

        let pubDate = '';
        let date_m = '';
        let date_d = '';
        let date_y = '';

        if (updatedElement) {
            pubDate = updatedElement.textContent;
            let tempmonth = pubDate.substring(5, 7)
            tempmonth = tempmonth - 1
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            date_m = months[tempmonth]
            date_d = pubDate.substring(8, 10)
            date_y = pubDate.substring(0, 4)

        } else if (pubDateElement) {
            
            pubDate = pubDateElement.textContent;
            date_m = pubDate.substring(8, 11)
            date_d = pubDate.substring(5, 7)
            date_y = pubDate.substring(12, 16)

        }

        let date_appendage = 'th'
        if (date_d === '01' || date_d === '21' || date_d === '31') {date_appendage = 'st'}
        if (date_d === '02' || date_d === '22') {date_appendage = 'nd'}
        if (date_d === '03' || date_d === '23') {date_appendage = 'rd'}

        if (date_d.substring(0, 1) === '0') {date_d = date_d.substring(1, 2)}

        const searchTitle = title.replace(/ /g,"+");

        
        articleText += `<div class='newsLine'>
                <div class='rssDate'><b>${date_m} ${date_d}${date_appendage}<br></b><i>${date_y}</i><br><br><a target='_blank' href=https://www.google.com/search?q=${searchTitle}&tbm=nws>🔍</a> </div>
                <div class='newsTitle'><a target='_blank' class='whitelinks' href='${link}'><b>${title}</b></a><br><br>${description} <br><br></div>
                </div>
                `;
    }
    
    
    
    
    
    
    
    
    })
}



function displayRSSFeed(articleText, feedTitle, feedWWW, feedSearchOperator, feedAddParam) {
    let feedTitleHTML
    let baseURL = new URL(feedWWW).origin
    if (baseURL === 'https://www.gov.uk') {baseURL = 'https://www.gov.uk/government/organisations/ministry-of-housing-communities-local-government'}
    if (feedTitle === 'Regulator of Social Housing') {baseURL = 'https://www.gov.uk/government/organisations/regulator-of-social-housing'}
 
    if (feedSearchOperator) {feedTitleHTML = `
    <div id='RSSFeedTitle'><a target='_blank' href='${baseURL}'>${feedTitle}</a>
    <form method="get" action="${feedWWW}" id='rssSearchBar'>
    ${feedAddParam}
    <input type="text" name="${feedSearchOperator}" size="31" placeholder="Search?">
    </form>
    </div>
    `}
    else {feedTitleHTML = `

    <div id='RSSFeedTitle'><a target='_blank' href='${baseURL}'>${feedTitle}</a>
    <form method="get" action="${feedWWW}" id='rssSearchBar'>
    ${feedAddParam}
    <input type="text" name="/" size="31" placeholder="Search?">
    </form>
    </div>
    </div>
    `}

    const rssStoriesDiv = document.getElementById('rssStories')
    const rssSearchHeader = document.getElementById('RSSSearchHeader') || null;

    rssStoriesDiv.innerHTML = articleText
    rssSearchHeader.innerHTML = feedTitleHTML
}

feeds.forEach(feed => {
            createFeedButton(feed.button, feed.url, feed.title, feed.type, feed.www, feed.searchOperator, feed.additionalParamaters)
    })

function showRandomFeed() {
    const randomIndex = Math.floor(Math.random() * feeds.length)
    const randomFeed = feeds[randomIndex]
    const button = document.getElementById(randomFeed.button)
    button.click() // Simulate clicking the button
}

showRandomFeed()

const hideRSSButton = document.getElementById('hideRSSButton')



let isVisible = true

function setupToggleButton() {
    function toggleRSS() {
        if (isVisible) {
            feedDiv.style.display = 'none'
            hideRSSButton.innerHTML = '<b>></b>'
            isVisible = false
        } else {
            feedDiv.style.display = 'block'
            hideRSSButton.innerHTML = '<b><</b>'
            isVisible = true
        }
    }
    
    hideRSSButton.addEventListener('click', toggleRSS)
}

setupToggleButton()

})

