export class Officer {
    constructor(apiResponse) {
        console.log(apiResponse)

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
    }


}
