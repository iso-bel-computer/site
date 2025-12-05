document.addEventListener('DOMContentLoaded', function() {
    const newsDiv = document.getElementById('newsDisplay')
    
    let allArticles = []

    function fetchNews(page) {
        return fetch(`https://content.guardianapis.com/search?page-size=40&show-fields=all&order-by=newest&section=politics${page}&show-tags=true&q=NOT%20(Obituary%20OR%20Letters%20OR%20Share%20your%20ORAs%20it%20happened%20OR%20Crace)&api-key=f4a2d67e-d80f-4c16-aee2-3b08192cf8f0`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const articles = data.response.results.map(story => {
                    const title = story.webTitle || ``;
                    const link = story.webUrl || ''
                    let tempmonth = parseInt(story.webPublicationDate.substring(5, 7))
                    if (tempmonth < 10) {tempmonth = tempmonth - 1}
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    const date_m = months[tempmonth]
                    const date_d = story.webPublicationDate.substring(8, 10)
                    const date_t = story.webPublicationDate.substring(11, 16)
                    const bodyText = story.fields.body
                    let date_appendage = 'th'
                    if (date_d === '01' || date_d === '21' || date_d === '31') {date_appendage = 'st'}
                    if (date_d === '02' || date_d === '22') {date_appendage = 'nd'}
                    if (date_d === '03' || date_d === '23') {date_appendage = 'rd'}
                    const articleText = `<div class='newsLine'>
                        <div class='newsDate'><b>${date_t}</b><i><br>${date_m} ${parseInt(date_d)}${date_appendage}</i> </div>
                        <div class='whitelinks newsTitle'>${title}</div>
                        </div>
                        <div class='newsContent' style='display: none;'><a target='_blank' href='${link}'>🔗</a>  <a target='_blank' href='https://www.google.com/search?q=${title}&tbm=nws'>🔍</a>${bodyText}</div>`;
                    
                    return articleText
                });
                newsDiv.insertAdjacentHTML('beforeEnd', articles.join(''))
            })
            .catch(error => {
                console.error('Error:', error);
                newsDiv.insertAdjacentHTML('beforeEnd', `<div>Error loading page ${page}</div>`)
            })
    }
    
    function addButtons() {
        var coll = document.getElementsByClassName("newsTitle");
        console.log(`Found ${coll.length} news titles`); // Debug log
        
        for (let i = 0; i < coll.length; i++) {
            // Remove existing listeners to avoid duplicates
            coll[i].replaceWith(coll[i].cloneNode(true));
        }
        
        // Re-get the collection after cloning
        coll = document.getElementsByClassName("newsTitle");
        
        for (let i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function(e) {
                // Prevent link clicks from triggering the toggle
                if (e.target.tagName === 'A') return;
                
                this.classList.toggle("activeNews");
                var content = this.parentElement.nextElementSibling;
                if (content && content.classList.contains('newsContent')) {
                    if (content.style.display === "block") {
                        content.style.display = "none";
                    } else {
                        content.style.display = "block";
                    }
                }
            });
        }
    }
    
    newsDiv.innerHTML = ''
    
    // Use Promise.all to wait for all fetches to complete
    Promise.all([
        fetchNews('&page=1'),
    ]).then(() => {
        // All fetches completed, now add the buttons
        addButtons();
    });

    /// 
})
