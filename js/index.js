import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { FontLoader } from "three/addons/loaders/FontLoader.js"
import { Body, Asteroids } from "./objects"
import { keys, o_selected, initialize, setSelectedCamera, asteroids_stat, update_speed_label, speed_scale, set_date_labels, end_date,start_date, set_start_date, set_end_date, add_log, asteroids_o, setSelectedAsteroids, show_error_screen, hide_loading_screen, show_loading_screen,statsFPS,statsMB,statsMS} from "./controls"

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
let sun = null
let earth = null
let moon = null
show_loading_screen()
setTimeout(async () =>{
    try{
        sun = new Body(gltf_loader,"sun",[30,30,30],null,scene)
        await sun.load()

        earth = new Body(gltf_loader,"earth",[20,20,20],[125,0,0],scene)
        await earth.load()

        moon = new Body(gltf_loader,"moon",[1,1,1],null,scene)
        await moon.load()
    }catch{
        show_error_screen()
    }finally{
        hide_loading_screen()
    }
},0)

const Asteroid = new Asteroids(gltf_loader,scene)
Asteroid.velocity_scale = Math.floor(Math.random() * (1e5 - 1e4 + 1) + 1e4)
let old_start_date = Asteroid.start_date
let old_end_date = Asteroid.end_date
set_start_date(old_start_date)
set_end_date(old_end_date)

let asteroids_data = null
let asteroids = null
async function initialize_asteroids(start_date_v=null,end_date_v=null){
    if (asteroids) {
        for (let body of asteroids) {
            if (!body || !body.pivot) continue
            scene.remove(body.pivot)
            body.pivot.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose()
                    if (Array.isArray(child.material)) child.material.forEach((mat) => mat.dispose())
                    else child.material.dispose()
                }
            })
            body.model = null
            body.pivot = null
        }
        asteroids = null
    }

    try{
        if(start_date_v && end_date_v) asteroids_data = await Asteroid.get_asteroid_data(start_date_v,end_date_v)
        else if(start_date_v) asteroids_data = await Asteroid.get_asteroid_data(start_date_v,old_end_date)
        else if(end_date_v) asteroids_data = await Asteroid.get_asteroid_data(old_start_date,end_date_v)
        else asteroids_data = await Asteroid.get_asteroid_data()
        asteroids = await Asteroid.get_asteroid_bodies(asteroids_data)
        Object.keys(asteroids_stat).forEach(key => delete asteroids_stat[key])
        asteroids_o.onclick = () => setSelectedAsteroids(camera,asteroids_data)
    }catch{
        show_error_screen()
    }
}
try{
    await initialize_asteroids()
}catch{
    show_error_screen()
}

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
set_date_labels(old_start_date,old_end_date)
initialize(camera,asteroids_data,{renderer,raycaster,mouse,scene},async () =>{
    try{
        show_loading_screen()
        if(old_start_date != start_date && old_end_date != end_date){
            await initialize_asteroids(start_date,end_date)
            old_start_date = start_date
            old_end_date = end_date
        }else if(old_start_date  != start_date){
            await initialize_asteroids(start_date)
            old_start_date = start_date
        }else if(old_end_date  != end_date){
            await initialize_asteroids(null,end_date)
            old_end_date = end_date
        }
    }catch{
        show_error_screen()
    }finally{
        hide_loading_screen()
    }
})
add_log("Welcome to Impact Watch!")
async function animate(){
    statsFPS.begin();
    statsMB.begin();
    statsMS.begin();

    update_speed_label()

    if (earth.model && earth.pivot){
        earth.model.rotation.y += 0.001745 * speed_scale
        earth.pivot.rotation.y += 0.0012 * speed_scale
        const earth_pos = new THREE.Vector3()
        earth.model.getWorldPosition(earth_pos)

        if(moon.model && moon.pivot){
            moon.pivot.position.set(earth_pos.x,earth_pos.y,earth_pos.z)
            moon.model.position.z = -25
            moon.model.rotation.y += 0.0005 * speed_scale
            moon.pivot.rotation.y += 0.0005 * speed_scale
            
            const moon_pos = new THREE.Vector3()
            moon.model.getWorldPosition(moon_pos)
            
            if(o_selected.moon){
                camera.position.set(moon_pos.x,moon_pos.y ,moon_pos.z + 5)
                try{
                    await moon.loadText(
                        fontLoader,
                        Body.generateInfo({
                            "Name":"Moon",
                            "Orbiting":"Earth",
                            "Diameter":"3,474 Km"
                        }),
                        {pos:new THREE.Vector3(moon_pos.x + moon.scaleX + 5, moon_pos.y + moon.scaleY+3,moon_pos.z)},
                        0.5
                    )}
                catch{
                    show_error_screen()
                }
            }else moon.clearText()
        }
        if (o_selected.earth){
            camera.position.set(earth_pos.x,earth_pos.y ,earth_pos.z + 20)
            try{
                earth.loadText(
                    fontLoader,
                    Body.generateInfo({
                        "Name":"Earth",
                        "Type":"Terrestrial",
                        "Diameter":"12,742 Km",
                        "Moons":"1",
                        "Orbital Periods":"365.25 Days"
                    }))
            }catch{show_error_screen()}
        }else earth.clearText()
    }

    
    if (sun.model && sun.pivot){
        sun.pivot.rotation.y += 0.003 * speed_scale
        const sunPos = new THREE.Vector3()
        sun.pivot.getWorldPosition(sunPos)
        if (o_selected.sun){
            camera.position.set(sunPos.x,sunPos.y ,sunPos.z + 80)
            try{
                sun.loadText(
                    fontLoader,
                    Body.generateInfo({
                        "Name":"Sun",
                        "Type":"G",
                        "Diameter":"1.39 million Km",
                        "Surface T":"5,778K"
                    }),
                {pos:new THREE.Vector3(sunPos.x + sun.scaleX + 5, sunPos.y + sun.scaleY+3,sunPos.z)})
            }catch{show_error_screen()}
        }
        else sun.clearText()
    }
    for (let i in asteroids){
        if(asteroids[i].model && asteroids[i].pivot){
            asteroids[i].model.rotation.y += 0.001745 * speed_scale
            asteroids[i].pivot.rotation.y += asteroids_data[i].velocity * speed_scale
        }
    }

    if(o_selected.freeview)
        setSelectedCamera(null)

    if(o_selected.asteroids){
        for (let i in Object.keys(asteroids_stat))
            if(asteroids[i]){
                if(Object.values(asteroids_stat)[i]){
                    const pos = new THREE.Vector3()
                    asteroids[i].model.getWorldPosition(pos)
                    camera.position.set(pos.x, pos.y,pos.z+8)
                    try{
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
                    }catch{show_error_screen()}
                }else asteroids[i].clearText()
            }
    }else
        if(asteroids)
            for (let asteroid of asteroids) 
                asteroid.clearText()

    if (keys.w) camera.position.z -= 0.03
    if (keys.s) camera.position.z += 0.03
    if (keys.a) camera.position.x -= 0.03
    if (keys.d) camera.position.x += 0.03

    if (keys.space) camera.position.y += 0.03
    if (keys.shift) camera.position.y -= 0.03

    statsFPS.end();
    statsMB.end();
    statsMS.end();
    
    renderer.render(scene, camera)  
}
renderer.setAnimationLoop(animate)
