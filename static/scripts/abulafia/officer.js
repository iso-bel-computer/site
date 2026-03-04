export class Officer {
    constructor(apiResponse) {

        this.name = apiResponse.name
        this.dob = apiResponse.date_of_birth
        this.address = apiResponse.address
        this.appointmentDate = apiResponse.appointed_on
        this.country = apiResponse.country_of_residence
        this.nationality = apiResponse.nationality
        this.role = apiResponse.officer_role
        this.personNumber = apiResponse.person_number
        if (apiResponse.resigned_on) {
            this.resignedOn = apiResponse.resigned_on
            this.active = false
        } else {
            this.resignedOn = null
            this.active = true
        }

        this.officerAppointmentLink = apiResponse?.links?.officer?.appointments

        this.appointments = null
    }

    addDetails(details) {
        this.appointments = details.items

        /// working out how long someone was a director for for each appt
        this.appointments.forEach(appt => {
            const startDate = new Date(appt.appointed_on)
            let endDate
            if (appt.resigned_on) {endDate = new Date(appt.resigned_on)}
            else {endDate = new Date()}

            let months = (endDate.getFullYear() - startDate.getFullYear()) * 12
                    + (endDate.getMonth() - startDate.getMonth())
            const years = Math.floor(months / 12)
            months = months % 12

            appt.timeInPost = {'months': months, 'years': years}

        })

        console.log(this.appointments)
    }

}
