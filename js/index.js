import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

const loader = new GLTFLoader()
let earth_model = null
loader.load("./assets/models/earth.glb", function(gltf){
    gltf.scene.scale.set(15, 15, 15)
    gltf.scene.position.set(0, 0, 0) 
    scene.add(gltf.scene)
    earth_model = gltf.scene
},undefined,function(err){
    console.log(err)
})

const light = new THREE.AmbientLight(0x404040,100)
scene.add(light)
 
camera.position.z = 10

window.addEventListener("mousemove",(event)=>{
    const x = (event.clientX / window.innerWidth) * 2 - 1 
    const y = (event.clientY / window.innerHeight) * 2 - 1
    camera.rotation.y = x
    camera.rotation.x = y
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
        earth_model.rotation.y += 0.0015
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
