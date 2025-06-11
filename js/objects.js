import * as THREE from "three"
import axios from "axios"

export class Body{
    constructor(loader,model_name,scale,position,scene){
        this.loader = loader
        this.model_name = model_name
        this.scaleX = scale[0]
        this.scaleY = scale[1]
        this.scaleZ = scale[2]
        this.position = position
        if (position){
            this.positionX = position[0]
            this.positionY = position[1]
            this.positionZ = position[2]
        }

        this.scene = scene
        this.pivot = new THREE.Group()
        this.model = null
    }
    load(){
        this.loader.load(`./assets/models/${this.model_name}.glb`, (gltf) => {
            gltf.scene.scale.set(this.scaleX,this.scaleY,this.scaleZ)
            const box = new THREE.Box3().setFromObject(gltf.scene)
            const center = new THREE.Vector3()
            box.getCenter(center)

            gltf.scene.position.sub(center)

            if(this.position){
                gltf.scene.position.x = this.positionX
                gltf.scene.position.y = this.positionY
                gltf.scene.position.z = this.positionZ
            }
            
            
            this.pivot.add(gltf.scene)
            this.model = gltf.scene

            this.scene.add(this.pivot)
            
        }, undefined, function (err) {
            console.log(err);
        });
    }
}

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
                    "name":o.name,
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
