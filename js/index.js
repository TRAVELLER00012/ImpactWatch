import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

camera.position.z = 100
const light = new THREE.AmbientLight(0x404040,200)
scene.add(light)
 
const gltf_loader = new GLTFLoader()
let earth_model = null
let earth_pivot = null
let sun_model = null
const world_center = new THREE.Group()
scene.add(world_center)

let moon_model = null
let moon_pivot = null

gltf_loader.load("./assets/models/sun.glb", function (gltf) {
    gltf.scene.scale.set(30,30,30)
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = new THREE.Vector3()
    box.getCenter(center)

    gltf.scene.position.sub(center)
    
    world_center.add(gltf.scene)
    sun_model = world_center

}, undefined, function (err) {
    console.log(err);
});
gltf_loader.load("./assets/models/earth.glb", function (gltf) {
    gltf.scene.scale.set(20,20,20)

    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = new THREE.Vector3()
    box.getCenter(center)
    gltf.scene.position.sub(center)
    gltf.scene.position.x = 125
    earth_pivot = new THREE.Group()
    earth_pivot.add(gltf.scene)
    

    earth_model = gltf.scene
    scene.add(earth_pivot)

}, undefined, function (err) {
    console.log(err);
});

gltf_loader.load("./assets/models/moon.glb", function (gltf) {
    gltf.scene.scale.set(1,1,1)

    moon_pivot = new THREE.Group()
    moon_pivot.add(gltf.scene)

    moon_model = gltf.scene
    scene.add(moon_pivot)

}, undefined, function (err) {
    console.log(err);
});

// window.addEventListener("contextmenu",(event)=>event.preventDefault())

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
    if (earth_model){
        earth_model.rotation.y += 0.001745
        earth_pivot.rotation.y += 0.0012
        const earth_pos = new THREE.Vector3()
        earth_model.getWorldPosition(earth_pos)

        if(moon_model){
            moon_pivot.position.set(earth_pos.x,earth_pos.y,earth_pos.z)
            moon_model.position.z = -25
            moon_model.rotation.y += 0.0005
            moon_pivot.rotation.y += 0.0005

            const moon_pos = new THREE.Vector3()
            moon_model.getWorldPosition(moon_pos)
            camera.position.set(moon_pos.x,moon_pos.y ,moon_pos.z + 5)
        }
        
        // camera.position.set(earth_pos.x,earth_pos.y ,earth_pos.z + 20)
    }
    
    if (sun_model)
        sun_model.rotation.y += 0.003

    
    
    
    if (keys.w) camera.position.z -= 0.03
    if (keys.s) camera.position.z += 0.03
    if (keys.a) camera.position.x -= 0.03
    if (keys.d) camera.position.x += 0.03

    if (keys.space) camera.position.y += 0.03
    if (keys.shift) camera.position.y -= 0.03
    
    renderer.render(scene, camera)

}
renderer.setAnimationLoop(animate)
