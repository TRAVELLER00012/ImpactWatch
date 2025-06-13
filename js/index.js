import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { FontLoader } from "three/addons/loaders/FontLoader.js"
import { Body, Asteroids } from "./objects"
import { keys, o_selected, initialize, setSelectedCamera, asteroids_stat} from "./controls"


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,1000)
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

const Asteroid = new Asteroids()
Asteroid.velocity_scale = Math.floor(Math.random() * (1e5 - 1e4 + 1) + 1e4)
const asteroids = []
const asteroids_data = await Asteroid.get_asteroid_data()

for (let asteroid of asteroids_data){
    const new_asteroid = new Body(gltf_loader, "asteroid", [asteroid.diameter/2,asteroid.diameter/2,asteroid.diameter/2],  [125+asteroid.miss_distance,Math.floor(Math.random() * (50 - (-50) + 1) + (-50)),Math.floor(Math.random() * (100 - (-100) + 1) + (-100))],scene)
    asteroids.push(new_asteroid)
    new_asteroid.load()
}


const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

renderer.domElement.addEventListener("click",(event)=>{
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
    mouse.y = (event.clientY / renderer.domElement.clientHeight) * 2 - 1
    
    raycaster.setFromCamera(mouse,camera)

    const intersects = raycaster.intersectObjects(scene.children)

    if (intersects.length > 0){
        let clickedObject = intersects[0].object
        while(clickedObject.parent && clickedObject.parent.name)
            clickedObject = clickedObject.parent


        if(clickedObject.name == sun.model_name) console.log("CLICKED ON SUN")
        if(clickedObject.name == earth.model_name) console.log("CLICKED ON EARTH")
        if(clickedObject.name == moon.model_name) console.log("CLICKED ON MOON")
    }
})


initialize(camera,asteroids_data)
function animate(){
    if (earth.model){
        earth.model.rotation.y += 0.001745
        earth.pivot.rotation.y += 0.0012
        const earth_pos = new THREE.Vector3()
        earth.model.getWorldPosition(earth_pos)
        earth.loadText(fontLoader,"hello world")

        if(moon.model){
            moon.pivot.position.set(earth_pos.x,earth_pos.y,earth_pos.z)
            moon.model.position.z = -25
            moon.model.rotation.y += 0.0005
            moon.pivot.rotation.y += 0.0005
            
            const moon_pos = new THREE.Vector3()
            moon.model.getWorldPosition(moon_pos)
            moon.loadText(fontLoader,"Hello",{pos:new THREE.Vector3(moon_pos.x + 3, moon_pos.y + 3, moon_pos.z)})
            
            if(o_selected.moon)
                camera.position.set(moon_pos.x,moon_pos.y ,moon_pos.z + 5)
        }
        if (o_selected.earth)
            camera.position.set(earth_pos.x,earth_pos.y ,earth_pos.z + 20)
    }

    
    if (sun.model){
        sun.loadText(fontLoader,"Hello world",{model:sun.pivot})
        sun.pivot.rotation.y += 0.003
        const sunPos = new THREE.Vector3()
        sun.pivot.getWorldPosition(sunPos)
        if (o_selected.sun)
            camera.position.set(sunPos.x,sunPos.y ,sunPos.z + 80)
    }
    for (let i in asteroids){
        if(asteroids[i].model){
            asteroids[i].model.rotation.y += 0.001745
            asteroids[i].pivot.rotation.y += asteroids_data[i].velocity
        }
    }

    if(o_selected.freeview)
        setSelectedCamera(null)

    if(o_selected.asteroids){
        for (let i in Object.keys(asteroids_stat)) 
            if(Object.values(asteroids_stat)[i]){
                const pos = new THREE.Vector3()
                asteroids[i].model.getWorldPosition(pos)
                camera.position.set(pos.x, pos.y,pos.z+3)
            }
    }

    if (keys.w) camera.position.z -= 0.03
    if (keys.s) camera.position.z += 0.03
    if (keys.a) camera.position.x -= 0.03
    if (keys.d) camera.position.x += 0.03

    if (keys.space) camera.position.y += 0.03
    if (keys.shift) camera.position.y -= 0.03
    
    renderer.render(scene, camera)

}
renderer.setAnimationLoop(animate)
