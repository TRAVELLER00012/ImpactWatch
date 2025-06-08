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
    freeview:false
}
export function setSelected(key,camera){
        Object.keys(o_selected).forEach(k => o_selected[k] = false)
        if (key && o_selected.hasOwnProperty(key)) o_selected[key] = true
        camera.rotation.set(0,0,0)
}

export function initialize(camera){
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

    const sun_o = document.getElementById("sun")
    const earth_o = document.getElementById("earth")
    const moon_o = document.getElementById("moon")
    const freeview_o = document.getElementById("freeview")

    sun_o.onclick = () => setSelected("sun",camera)
    moon_o.onclick = () => setSelected("moon",camera)
    earth_o.onclick = () => setSelected("earth",camera)
    freeview_o.onclick = () => setSelected("freeview",camera)
}

