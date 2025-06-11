import axios from "axios"

const api_key = import.meta.env.VITE_API_KEY

export class Asteroids{
    constructor(start_date = new Date(),end_date = new Date(), scale_size = 0.225, distance_scale = 1.2e6, velocity_scale = 1e4){
        this.scale_size = scale_size
        this.distance_scale = distance_scale
        this.velocity_scale = velocity_scale
        this.start_date = `${start_date.getFullYear()}-${start_date.getMonth()}-${start_date.getDate()}`
        if(end_date) this.end_date = `${end_date.getFullYear()}-${end_date.getMonth()}-${end_date.getDate()}`
        else this.end_date = null
    }
    async get_asteroid_data(){
        let result = {}
        if (!this.end_date)
            result = await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${this.start_date}&api_key=${api_key}`)
        else
            result = await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${this.start_date}&end_date=${this.end_date}&api_key=${api_key}`)
        result = result.data.near_earth_objects
        const keys = Object.keys(result)
        const converted_result = []
        for (let key of keys){
            const obj = result[key]
            for (let o of obj ){
                // console.log(o)
                converted_result.push({
                    "id":o.id,
                    "diameter":(o.estimated_diameter.kilometers.estimated_diameter_max + o.estimated_diameter.kilometers.estimated_diameter_min) / (2*this.scale_size),
                    "hazardous": o.is_potentially_hazardous_asteroid,
                    "miss_distance":parseFloat(o.close_approach_data[0].miss_distance.kilometers)/this.distance_scale,
                    "velocity": parseFloat(o.close_approach_data[0].relative_velocity.kilometers_per_second)/this.velocity_scale
                })
            }
        }
        // console.log(converted_result)
        return converted_result
    }
}
