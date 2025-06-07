let isRightMouseDown = false;
export const keys = {
    "w":false,
    "s":false,
    "a":false,
    "d":false,
    "space":false,
    "shift":false
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
        console.log(event.key)
        keys[event.key.toLowerCase()] = true
        if (event.key == " ") keys.space = true
    })
    window.addEventListener("keyup",(event)=>{
        keys[event.key.toLowerCase()] = false
        if (event.key == " ") keys.space = false
    })
}