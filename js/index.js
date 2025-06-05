import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

const gltf_loader = new GLTFLoader()
let earth_model = null
let sun_model = null;

const world_center = new THREE.Group()
scene.add(world_center)

gltf_loader.load("./assets/models/sun.glb", function (gltf) {
    gltf.scene.scale.set(25,25,25)
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = new THREE.Vector3()
    box.getCenter(center)

    gltf.scene.position.sub(center)
    
    world_center.add(gltf.scene)
    sun_model = world_center

}, undefined, function (err) {
    console.log(err);
});


const light = new THREE.AmbientLight(0x404040,500)
scene.add(light)
 
camera.position.z = 100

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
    if (earth_model)
        earth_model.rotation.y += 0.001745
    
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
