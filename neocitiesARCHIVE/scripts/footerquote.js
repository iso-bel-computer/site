
let docpath = document.location.pathname 
let quoteBlock = false;
let newQuoteSeen = true;

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}


// Remove leading slash if present
if (docpath.startsWith('/')) {
    docpath = docpath.substring(1);
}

if (!docpath) {docpath = 'index'}

// URL encode the path for the Neocities editor
let encodedPath = encodeURIComponent(docpath + '.html');

// Create the Neocities editor URL
let neocitiesURL = `https://neocities.org/site_files/text_editor?filename=${encodedPath}`;


function randomQuote()  {

fetch('/misc_resources/footerquotes.txt')
.then(response => response.text())
.then(data => {
    const quotes = data.trim().split('\n');
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('random-quote').innerHTML = `<div style='margin-left: 6px'><a href='${neocitiesURL}'>✏️</a></div>` + `<div>${randomQuote}<div>`;
})
.catch(error => {
    document.getElementById('random-quote').innerHTML = 'sites borked. did you know that the word borked comes from supreme court justice and noted cunt, robert bork?';
})}

document.addEventListener('DOMContentLoaded', function() {randomQuote(), console.log('random quote loaded')})


function isVisibleInViewport(elem)
{
    var y = elem.offsetTop;
    var height = elem.offsetHeight;

    while ( elem = elem.offsetParent )
        y += elem.offsetTop;

    var maxHeight = y + height;
    var isVisible = ( y < ( window.pageYOffset + window.innerHeight ) ) && ( maxHeight >= window.pageYOffset );
    return isVisible; 

}

function check()
{
    if(isVisibleInViewport(footer)) {newQuoteSeen = true}
    else
    
    if (newQuoteSeen == true && quoteBlock == false) {
    
    let random = getRandomArbitrary(0,5);
    if (random < 1) {
    randomQuote()}
    quoteBlock = true
    newQuoteSeen = false
    setTimeout(function() {quoteBlock = false}, 500)

};


}

window.addEventListener("scroll", check);
