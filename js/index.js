import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { Body } from "./objects"

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

const sun = new Body(gltf_loader,"sun",[30,30,30],null,scene)
sun.load()


const earth = new Body(gltf_loader,"earth",[20,20,20],[125,0,0],scene)
earth.load()

const moon = new Body(gltf_loader,"moon",[1,1,1],null,scene)
moon.load()

let isRightMouseDown = false;
window.addEventListener("mousedown", (event) => {
    if (event.button === 0)
        isRightMouseDown = true
});

window.addEventListener("mouseup", (event) => {
    if (event.button === 0)
        isRightMouseDown = false
});

window.addEventListener("mouseleave", () => {
    isRightMouseDown = false
});

window.addEventListener("mousemove", (event) => {
    if (!isRightMouseDown) return
    camera.rotation.y += event.movementX * 0.002
    camera.rotation.x += event.movementY * 0.002
})


const keys = {
    "w":false,
    "s":false,
    "a":false,
    "d":false,
    "space":false,
    "shift":false
}
window.addEventListener("keydown",(event)=>{
    console.log(event.key)
    keys[event.key.toLowerCase()] = true
    if (event.key == " ") keys.space = true
})
window.addEventListener("keyup",(event)=>{
    keys[event.key.toLowerCase()] = false
    if (event.key == " ") keys.space = false
})

function animate(){
    if (earth.model){
        earth.model.rotation.y += 0.001745
        earth.pivot.rotation.y += 0.0012
        const earth_pos = new THREE.Vector3()
        earth.model.getWorldPosition(earth_pos)

        if(moon.model){
            moon.pivot.position.set(earth_pos.x,earth_pos.y,earth_pos.z)
            moon.model.position.z = -25
            moon.model.rotation.y += 0.0005
            moon.pivot.rotation.y += 0.0005

            const moon_pos = new THREE.Vector3()
            moon.model.getWorldPosition(moon_pos)
            // camera.position.set(moon_pos.x,moon_pos.y ,moon_pos.z + 5)
        }
        
        // camera.position.set(earth_pos.x,earth_pos.y ,earth_pos.z + 20)
    }
    
    if (sun.model){
        sun.pivot.rotation.y += 0.003
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
