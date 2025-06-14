import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { FontLoader } from "three/addons/loaders/FontLoader.js"
import { Body, Asteroids } from "./objects"
import { keys, o_selected, initialize, setSelectedCamera, asteroids_stat} from "./controls"


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,100000)
camera.layers.enable(1)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)
camera.position.z = 100
const light = new THREE.AmbientLight(0x404040,200)
scene.add(light)

const gltf_loader = new GLTFLoader()
const fontLoader = new FontLoader()

const sun = new Body(gltf_loader,"sun",[30,30,30],null,scene)
sun.load()

const earth = new Body(gltf_loader,"earth",[20,20,20],[125,0,0],scene)
earth.load()

const moon = new Body(gltf_loader,"moon",[1,1,1],null,scene)
moon.load()

const Asteroid = new Asteroids(gltf_loader,scene)
Asteroid.velocity_scale = Math.floor(Math.random() * (1e5 - 1e4 + 1) + 1e4)

const asteroids_data = await Asteroid.get_asteroid_data()
const asteroids = Asteroid.get_asteroid_bodies(asteroids_data)

const decrease_speed_button = document.getElementById("decrease_speed")
const increase_speed_button = document.getElementById("increase_speed")
const speed_label = document.getElementById("speed")
let speed_scale = 1

decrease_speed_button.onclick = () =>{
    if(speed_scale > 0) speed_scale-=0.5
}
increase_speed_button.onclick = () =>{
    if(speed_scale <= 9.5) speed_scale+= 0.5
}

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

initialize(camera,asteroids_data,{renderer,raycaster,mouse,scene})
function animate(){
    speed_label.textContent = speed_scale.toString()
    if (earth.model){
        earth.model.rotation.y += 0.001745 * speed_scale
        earth.pivot.rotation.y += 0.0012 * speed_scale
        const earth_pos = new THREE.Vector3()
        earth.model.getWorldPosition(earth_pos)

        if(moon.model){
            moon.pivot.position.set(earth_pos.x,earth_pos.y,earth_pos.z)
            moon.model.position.z = -25
            moon.model.rotation.y += 0.0005 * speed_scale
            moon.pivot.rotation.y += 0.0005 * speed_scale
            
            const moon_pos = new THREE.Vector3()
            moon.model.getWorldPosition(moon_pos)
            
            if(o_selected.moon){
                camera.position.set(moon_pos.x,moon_pos.y ,moon_pos.z + 5)
                moon.loadText(
                    fontLoader,
                    Body.generateInfo({
                        "Name":"Moon",
                        "Orbiting":"Earth",
                        "Diameter":"3,474 Km"
                    }),
                    {pos:new THREE.Vector3(moon_pos.x + moon.scaleX + 5, moon_pos.y + moon.scaleY+3,moon_pos.z)},
                    0.5
                )
            }else moon.clearText()
        }
        if (o_selected.earth){
            camera.position.set(earth_pos.x,earth_pos.y ,earth_pos.z + 20)
            earth.loadText(
                fontLoader,
                Body.generateInfo({
                    "Name":"Earth",
                    "Type":"Terrestrial",
                    "Diameter":"12,742 Km",
                    "Moons":"1",
                    "Orbital Periods":"365.25 Days"
                }))
        }else earth.clearText()
    }

    
    if (sun.model){
        sun.pivot.rotation.y += 0.003 * speed_scale
        const sunPos = new THREE.Vector3()
        sun.pivot.getWorldPosition(sunPos)
        if (o_selected.sun){
            camera.position.set(sunPos.x,sunPos.y ,sunPos.z + 80)
            sun.loadText(
                fontLoader,
                Body.generateInfo({
                    "Name":"Sun",
                    "Type":"G",
                    "Diameter":"1.39 million Km",
                    "Surface T":"5,778K"
                }),
                {pos:new THREE.Vector3(sunPos.x + sun.scaleX + 5, sunPos.y + sun.scaleY+3,sunPos.z)})
        }
        else sun.clearText()
    }
    for (let i in asteroids){
        if(asteroids[i].model){
            asteroids[i].model.rotation.y += 0.001745 * speed_scale
            asteroids[i].pivot.rotation.y += asteroids_data[i].velocity * speed_scale
        }
    }

    if(o_selected.freeview)
        setSelectedCamera(null)

    if(o_selected.asteroids){
        for (let i in Object.keys(asteroids_stat)){
            if(Object.values(asteroids_stat)[i]){
                const pos = new THREE.Vector3()
                asteroids[i].model.getWorldPosition(pos)
                camera.position.set(pos.x, pos.y,pos.z+3)
                asteroids[i].loadText(
                    fontLoader,
                    Body.generateInfo({
                        "Name":Object.keys(asteroids_stat)[i], 
                        "Id": asteroids_data[i].id, 
                        "Velocity(Km/s)":asteroids_data[i].velocity * Asteroid.velocity_scale,
                        "AVG Diameter(KM)":asteroids_data[i].diameter * 2 * Asteroid.scale_size,
                        "Hazardous":asteroids_data[i].hazardous ? "YES" : "NO"
                    }),
                    {pos:new THREE.Vector3(pos.x + asteroids[i].scaleX + 5 , pos.y + asteroids[i].scaleY + 3 , pos.z)},
                    0.25
                )
            }else asteroids[i].clearText()
        }
    }else
        for (let asteroid of asteroids) 
            asteroid.clearText()

    if (keys.w) camera.position.z -= 0.03
    if (keys.s) camera.position.z += 0.03
    if (keys.a) camera.position.x -= 0.03
    if (keys.d) camera.position.x += 0.03

    if (keys.space) camera.position.y += 0.03
    if (keys.shift) camera.position.y -= 0.03
    
    renderer.render(scene, camera)

}
renderer.setAnimationLoop(animate)
