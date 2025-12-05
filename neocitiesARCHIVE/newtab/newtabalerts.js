document.addEventListener('DOMContentLoaded', function(event) {
    let isAlertToday
    const alertsDiv = document.getElementById('alertWrapper') 
    const alertsSchedule = [
        
        /// remember to zero index months! 

        {   name: "Mum's birthday",
            type: 'birthday',
            date: {
                day: 20,
                month: 7
            },
            message: "It's Mum's birthday today!"

        },
        {   name: "Catherine's birthday",
            type: 'birthday',
            date: {
                day: 19,
                month: 11
            },
            message: "It is Catherine's birthday today!"

        },
        {   name: "Al's birthday",
            type: 'birthday',
            date: {
                day: 11,
                month: 2
            },
            message: "It is Al's birthday today!"

        },
        {   name: "Emily's birthday",
            type: 'birthday',
            date: {
                day: 18,
                month: 2
            },
            message: "It is Emily's birthday today!"

        },
        {   name: "Owain's birthday",
            type: 'birthday',
            date: {
                day: 28,
                month: 5
            },
            message: "It is Owain's birthday today!"

        },
        {   name: "Ian's birthday",
            type: 'birthday',
            date: {
                day: 31,
                month: 6
            },
            message: "It is Ian's birthday today!"

        },
        {   name: "Dan and Eliza's birthday",
            type: 'birthday',
            date: {
                day: 1,
                month: 3
            },
            message: "It is Dan and Eliza's birthday today!"

        },
        {   name: "your birthday",
            type: 'birthday',
            date: {
                day: 29,
                month: 3
            },
            message: 'test'

        },
        {   name: "leo's birthday",
            type: 'birthday',
            date: {
                day: 17,
                month: 10
            },
            message: "It's Leo's birthday today!"

        },

        {   name: "Trans Day of Rememberance",
            type: 'event',
            date: {
                day: 20,
                month: 10
            },
            message: "It's Trans Day of Rememberance today."

        },

        {   name: "Bins reminder",
            type: 'reminder',
            date: {
                day: null,
                month: null,
                weekday: 'Sunday',
            },
            message: 'Have you put the bins out today?'

        },
        {   name: "Paid rent?",
            type: 'reminder',
            date: {
                day: 18,
                month: null,
                weekday: null
            },
            message: 'Have you paid your rent today?'

        },



    ]

    let currentDate = new Date();
    let currentDay = currentDate.getDate();
    let currentMonth = currentDate.getMonth();
    let currentWeekday = currentDate.getDay();
    let currentYear = currentDate.getFullYear();

    const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
    ];


function checkAlerts() {
    isAlertToday = alertsSchedule.filter((alert) => {
        if (alert.date?.day !== null && (alert.date?.month == null || alert.date?.month === undefined)) {
            return alert.date.day === currentDay
        }

        // Check if it's a date-based alert (has day and month)
        if (alert.date?.day !== null && alert.date?.month !== null) {
            return alert.date.day === currentDay && alert.date.month === currentMonth;
        }
        
        // Check if it's a weekday-based alert
        if (alert.date?.weekday !== null && alert.date?.weekday !== undefined) {
            // Convert weekday name to number for comparison
            const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const alertWeekday = weekdays.indexOf(alert.date.weekday);
            return alertWeekday === currentWeekday;
        }


        return false; // Skip if neither condition is met
    });
    console.log(isAlertToday)
    if (isAlertToday) return isAlertToday;
}


function displayAlerts() {
    if (isAlertToday && isAlertToday.length > 0) {
        alertsDiv.style.display = 'flex'

        let alertsHTML = '<div><img src="/research/alert.png"></div><div>';
        
        isAlertToday.forEach(alert => {
            const alertMessage = alert.message || `It's ${alert.name} today!`; // Fallback message
            alertsHTML += `<div class="alertMessage" id='alertMessage'>${alertMessage}</div>`;
        });
        
        alertsDiv.innerHTML = alertsHTML + '<div>';

    }
}



checkAlerts()


displayAlerts()
})
