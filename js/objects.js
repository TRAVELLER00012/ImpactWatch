import * as THREE from "three"
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import axios from "axios"

export class Body{
    constructor(loader,model_name,scale,position,scene,detection_name = null){
        this.loader = loader
        this.model_name = model_name
        this.detection_name = detection_name ? detection_name : model_name
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
        this.textMesh = null
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
            this.model.name = this.detection_name
            this.scene.add(this.pivot)
            
        }, undefined, function (err) {
            console.log(err);
        });
    }
    loadText(fontLoader,text,pos_stat = {model: this.model},size=2,Material=THREE.MeshStandardMaterial){
        fontLoader.load("./assets/fonts/helvetiker_regular.typeface.json",(font) => {
            const geo = new TextGeometry(text,{
                font: font,
                size: size,
                depth: 0,
                curveSegments: 0.5,
                bevelEnabled: false,
            })
        
            const material = new Material({color:0xffffff})
            const mesh = new THREE.Mesh(geo,material)
            geo.center()
            
            if(this.textMesh){
                this.textMesh.removeFromParent()
            }
            this.textMesh = mesh
            if(pos_stat.model && !pos_stat.pos){
                const pos = new THREE.Vector3()
                pos_stat.model.getWorldPosition(pos)
                mesh.position.set(pos.x+this.scaleX,pos.y+this.scaleY,pos.z)
            }else{
                mesh.position.set(pos_stat.pos.x,pos_stat.pos.y,pos_stat.pos.z)
            }
            this.scene.add(mesh)
            
        })
    }

    clearText(){
        if(this.textMesh)
            this.textMesh.removeFromParent()
    }
    static generateInfo(info){
        let text = ""
        for (let key of Object.keys(info))
            text += `${key}: `+info[key]+"\n"
        return text
    }
}

const api_key = import.meta.env.VITE_API_KEY

export class Asteroids{
    constructor(loader,scene,start_date = new Date(),end_date = new Date(), scale_size = 0.225, distance_scale = 1.2e6, velocity_scale = 1e4){
        this.loader = loader
        this.scene = scene
        this.scale_size = scale_size
        this.distance_scale = distance_scale
        this.velocity_scale = velocity_scale

        if(typeof start_date == "string"){
            this.start_date = start_date
        }else{
            const start_month = start_date.getMonth() < 10 ? "0"+(start_date.getMonth()+1) : start_date.getMonth()+1
            this.start_date = `${start_date.getFullYear()}-${start_month}-${start_date.getDate()}`
        }
        if(typeof end_date == "string"){
            this.end_date = end_date
        }else{
            if(end_date) {
                const end_month = end_date.getMonth() < 10 ? "0"+(end_date.getMonth()+1) : end_date.getMonth()+1
                this.end_date = `${end_date.getFullYear()}-${end_month}-${end_date.getDate()}`
            }    
            else this.end_date = null
        }
    }
    async get_asteroid_data(start_date=this.start_date,end_date=this.end_date){
        console.log(start_date,end_date)
        let result = {}
        // console.log(start_date,end_date)
        // if (!this.end_date)
        //     result = await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${this.start_date}&api_key=${api_key}`)
        // else
        //     result = await axios.get(`https://awpi.nasa.gov/neo/rest/v1/feed?start_date=${this.start_date}&end_date=${this.end_date}&api_key=${api_key}`)
        // result = result.data.near_earth_objectsw
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

    get_asteroid_bodies(data){
        const asteroids = []
        for (let asteroid of data){
            const new_asteroid = new Body(
                this.loader,
                 "asteroid", 
                 [asteroid.diameter/2,asteroid.diameter/2,asteroid.diameter/2],  
                 [125+asteroid.miss_distance,
                    Math.floor(Math.random() * (50 - (-50) + 1) + (-50)),
                    Math.floor(Math.random() * (100 - (-100) + 1) + (-100))],
                    this.scene,asteroid.name.slice(1,-2)
                )
            asteroids.push(new_asteroid)
            new_asteroid.load()
        }
        return asteroids
    }
}
