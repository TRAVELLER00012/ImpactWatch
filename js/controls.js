let isRightMouseDown = false;
export const keys = {
    "w":false,
    "s":false,
    "a":false,
    "d":false,
    "space":false,
    "shift":false
}
export const o_selected = {
    sun:false,
    earth:false,
    moon:false,
    freeview:false,
    asteroids: false
}
const elements = document.getElementsByClassName("elements")
const menu = document.getElementById("menu")
const sun_o = document.getElementById("sun")
const earth_o = document.getElementById("earth")
const moon_o = document.getElementById("moon")
const freeview_o = document.getElementById("freeview")
const asteroids_o = document.getElementById("asteroids")
const select_object_label = document.getElementById("select_object_label")

export function setSelectedCamera(key,camera,default_selected_val = true,default_other_val = false){
        Object.keys(o_selected).forEach(k => o_selected[k] = default_other_val)
        if (key && o_selected.hasOwnProperty(key)) o_selected[key] = default_selected_val
        if(camera) camera.rotation.set(0,0,0)
}
function setSelectedAsteroids(asteroids){
    setSelectedCamera("asteroids",null,!o_selected.asteroids)
    if (o_selected.asteroids){
        for (let asteroid of asteroids){
            const item = document.createElement("li")
            item.textContent = asteroid.name.slice(1,-2)
            item.classList.add("asteroid")
            elements[0].appendChild(item)
        }

        sun_o.style.display = "none"
        earth_o.style.display = "none"
        moon_o.style.display = "none"
        freeview_o.style.display = "none"
        asteroids_o.textContent = "(Click Again to disable)"
        select_object_label.textContent = "Asteroids"
    }else{
        sun_o.style.display = "block"
        earth_o.style.display = "block"
        moon_o.style.display = "block"
        freeview_o.style.display = "block"
        asteroids_o.textContent = "Asteroids"
        select_object_label.textContent = "Select An Object"
        const asteroids = document.getElementsByClassName("asteroid")
        for (let asteroid of asteroids) asteroid.style.display = "none"
    }
}

export function initialize(camera,asteroids = []){
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
    window.addEventListener("keydown",(event)=>{
        keys[event.key.toLowerCase()] = true
        if (event.key == " ") keys.space = true
    })
    window.addEventListener("keyup",(event)=>{
        keys[event.key.toLowerCase()] = false
        if (event.key == " ") keys.space = false
    })

    let hidden = false
    let options_hidden = false

    menu.onclick = () => {
        hidden = !hidden
        if(hidden){
            elements[0].style.display = "none"
        }else{
            elements[0].style.display = "inline"
        }
    }

    sun_o.onclick = () => setSelectedCamera("sun",camera)
    moon_o.onclick = () => setSelectedCamera("moon",camera)
    earth_o.onclick = () => setSelectedCamera("earth",camera)
    freeview_o.onclick = () => setSelectedCamera("freeview",camera)
    asteroids_o.onclick = () =>{
        setSelectedAsteroids(asteroids)
    }
}

