
class event {
    constructor() {}
}

class calendarManager {
    constructor() {}

    async init() {
        this.now = new Date()
        this.DOM = new DOM()
        this.monthArray = this.calculateMonthDays(this.now)
        this.events = await this.getEvents()
        this.mapEvents(this.events)
        this.DOM.renderMonth(this.monthArray)


    }

    async getData(url) {
        try {
            const response = await fetch(url);
            const json = response.json()
            return json

        } catch {
            console.error('Error fetching data:', url)
        }
    }
    async getEvents() {
        const events = await this.getData('https://calendar.permacomputing.net/calendar.events.json');
        const eventsByDate = {}
        events.forEach(event => {
             const date = new Date(event.start_date)
             const dateNoTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
             if (!eventsByDate[dateNoTime]) {eventsByDate[dateNoTime] = []}
             eventsByDate[dateNoTime].push(event)
        })
        return eventsByDate

    }
    calculateMonthDays(displayDate) {

        // ok so the aim here is to get an array with each cell we need.
        // inc event details for days, and blank cells for before the start and after the end of each month
        const monthArray = []

        function getDaysInMonth() {
            return new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();
        }

        // this gets the number of blank cells we need before the 1st of the month
        function getOffset() {
            let firstOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
            return (firstOfMonth.getDay() + 6) % 7
        }

        for (let i = 0; i < getOffset(); i++) {
            monthArray.push(null)
        }


        // this adds the actual days in the month
        for (let i = 1; i < (getDaysInMonth() + 1); i++) {
            const d = new Date(displayDate.getFullYear(), displayDate.getMonth(), i)

            monthArray.push({
                date: d,
            })
        }

        // this adds the blank cells after the month
        let lastOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), getDaysInMonth())
        let trailingDays = (7 - ((lastOfMonth.getDay() + 6) % 7) - 1) % 7

        for (let day = 0; day < trailingDays; day++) {
            monthArray.push(null)
        }

        return monthArray

    }
    mapEvents(events) {
        this.monthArray.forEach(day => {
            if (day?.date) {
                const key = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`

                if (events[key]) {
                    day.events = events[key]
                }

            }
        })
    }

}

class DOM {
    constructor() {

        this.eventDisplay = document.getElementById('eventDisplay')
        this.calendarSelect = document.getElementById('calendarSelect')
        this.table = document.getElementById('calendar')
    }

    renderMonth(monthArray) {

        const now = new Date()
        const fragment = document.createDocumentFragment()
        let row = document.createElement('tr')
        let i = 1
        monthArray.forEach(day => {

            const cell = document.createElement('td')
            const div = document.createElement('div')
            div.classList.add('cellContent')

            if (day?.date) {
                const date = new Date(day.date)
                cell.dataset.date = date.toISOString()

                // inserting date number
                if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                    div.innerHTML += '<img src="/files/pcm-flower.png">'
                    cell.classList.add('todayCell')
                } else {
                    div.innerHTML += `<div class='dateNumber'>${day.date.getDate()}</div>`

                }

                /// is it the weekend ?
                if (date.getDay() === 0 || date.getDay() === 6) {cell.classList.add('weekendCell')}

                // is it in the past?
                if (date.getTime() < now.getTime()) {cell.classList.add('pastCell')}

                // if (day?.events) {
                //     day.events.forEach(event => {
                //         const cal = STATE.calendars[event['calendar-index']]
                //         if (cal.display) {

                //             const eventDiv = document.createElement('div')
                //             let eventTitle = event.text

                //             // trim long titles
                //             const eventTrimLength = 28
                //             if (eventTitle.length > eventTrimLength) {eventTitle = eventTitle.substring(0,eventTrimLength) + ' [...]'}

                //             eventDiv.innerHTML += `<div><span style='color: ${cal.color};' class='event-flower'>${cal.icon}</span> ${eventTitle}</div>`
                //             eventDiv.addEventListener('click', () => {displayEvent(event)})
                //             eventDiv.classList.add('eventListing')
                //             eventDiv.classList.add(`calendar_${event["calendar-index"]}`)
                //             day.div.appendChild(eventDiv)

                //         }

                //     })

                // }

                cell.appendChild(div)

            } else {
                cell.innerText = '~'
                cell.classList.add('blankCell')
            }

            row.appendChild(cell)
            if (i % 7 === 0) {
                fragment.appendChild(row)
                row = document.createElement('tr')
            }

            cell.dataset.defaultText = cell.innerText


            i++

        })

        if (row.children.length > 0) {
            fragment.appendChild(row)
        }

        // const monthCell = this.table.querySelector('#month')
        // const yearCell = this.table.querySelector('#year')
        // const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        // monthCell.innerText = months[monthArray[15].date.getMonth()]
        // yearCell.innerText = String(monthArray[15].date.getFullYear())



        this.table.appendChild(fragment)


    }
}

const calendar = new calendarManager()
calendar.init()
