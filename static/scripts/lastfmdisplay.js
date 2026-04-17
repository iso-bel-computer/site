
 async function lastFMWindow() {

    async function getLastFMData(pageNo) {
        const response = await fetch(`/api/getlastfm?page=${pageNo}`)
        const data = await response.json()
        return data
    }

    const div = document.getElementById('lastfmtracks')
    const table = document.createElement('table')

    function truncate(string, length) {
        let newStr = string
        if (string.length > length) {newStr = string.substr(0, length) + ' [...]'}
        return newStr
    }

    let currentPage = 1
    async function loadTracks(pageNo) {
        const data = await getLastFMData(pageNo)
        const now = new Date()

        if (data?.recenttracks?.track) {
            const tracks = data.recenttracks.track
            tracks.forEach(track => {

                const name  = truncate(track?.name, 30) || 'UNKNOWN'
                const artist = truncate(track?.artist?.["#text"], 20) || 'UNKNOWN';
                const imgurl = track?.image[0]?.["#text"] || 'NA';
                const date = track?.date?.uts ? new Date(Number(track.date.uts) * 1000) : null;

                const timeSinceListen = ((now - date) / 1000) / 60 // time since listened in minutes

                const hrs = Math.floor(timeSinceListen / 60)
                const days = Math.floor(hrs / 24)
                let timeStr = ''
                if (days < 1) {timeStr = `${hrs}h`} else {timeStr = `${days}d`}

                const row = document.createElement('tr')
                row.innerHTML = `<td class='timecell'>${timeStr}</td><td class='albumartcell' ><img src='${imgurl}' ></td><td class='trackname'>${name}</td><td class='artistcell'>${artist}</td>`
                table.appendChild(row)
            })
            div.innerHTML = ''
            div.appendChild(table)
            div.innerHTML += '<button id="lastfmforward">More..?</button>'

            document.querySelector('#lastfmforward').addEventListener('click', function() {
                document.querySelector('#lastfmforward').innerText = 'Loading...'
                currentPage++
                loadTracks(currentPage)

            })
        } else {
            div.innerHTML += '<div style="padding: 5px; color: darkred ">Error fetching Last FM data :(</div>'
        }

     }
     await loadTracks(currentPage)
 }
 await lastFMWindow()
