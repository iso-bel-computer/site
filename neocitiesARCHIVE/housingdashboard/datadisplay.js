document.addEventListener('DOMContentLoaded', function() {

const iframewrapperdiv = document.getElementById('iframewrapper')
const iframecontrolsdiv = document.getElementById('iframecontrols')
const iframecontent = document.getElementById('iframecontentdiv')
const iframe = document.getElementById('iframe')

const sources = [
    {
        title: 'Households',
        url: 'https://app.powerbi.com/view?r=eyJrIjoiNGMzMjY1NDItOWRiNy00Yzc4LWFmMTAtZDM1NDdmM2FiMTRkIiwidCI6IjFjZTZkZDllLWIzMzctNDA4OC1iZTVlLThkYmJlYzA0YjM0YSIsImMiOjh9',
        button: document.getElementById('householdButton')
    },
    {
        title: 'Statutory Homelessness',
        url: 'https://app.powerbi.com/view?r=eyJrIjoiNmE4NDM3YjAtNzJjNS00MjUzLWI2ZTktYjhlZTE1ZjA1M2UxIiwidCI6ImJmMzQ2ODEwLTljN2QtNDNkZS1hODcyLTI0YTJlZjM5OTVhOCJ9',
        button: document.getElementById('hlessButton')
    },
    {
        title: 'Current Stock',
        url: 'https://app.powerbi.com/view?r=eyJrIjoiN2U1MWQ4YzAtNWMyYS00YjdmLTk5ZWItY2UyOTBhNGU0YjRkIiwidCI6IjFjZTZkZDllLWIzMzctNDA4OC1iZTVlLThkYmJlYzA0YjM0YSIsImMiOjh9',
        button: document.getElementById('stockButton')
    }


]





function createSourceButton(title, url, button) {

    
}

iframe.src = sources[2].url

sources.forEach(source => {
    createSourceButton(sources.title, sources.url, sources.button)
})



})

