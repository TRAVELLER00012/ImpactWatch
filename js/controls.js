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
export const asteroids_stat = {}
export const side_menu_stats = {
    is_open:false,
    stats:true,
    select:true,
    date:true,
    logs:true,
    speed:true
}

const elements = document.getElementsByClassName("elements")
const menu = document.getElementById("menu")
const parent_menu = document.getElementsByClassName("parent_menu")[0]
const sun_o = document.getElementById("sun")
const earth_o = document.getElementById("earth")
const moon_o = document.getElementById("moon")
const freeview_o = document.getElementById("freeview")
const asteroids_o = document.getElementById("asteroids")
const select_object_label = document.getElementById("select_object_label")
const speed_control = document.getElementById("speed_control")
const decrease_speed_button = document.getElementById("decrease_speed")
const increase_speed_button = document.getElementById("increase_speed")
const speed_label = document.getElementById("speed")
const date_submit = document.getElementById("submit_date")
const start_date_input = document.getElementById("start_date")
const end_date_input = document.getElementById("end_date")
const date_control = document.getElementById("date_control")
const logs = document.getElementById("logs")
const open_panel_button = document.getElementById("open_panel")
const close_panel_button = document.getElementById("close_panel")


const side_menu = document.getElementById("side_menu")
const option_stats = document.getElementById("option_stats")
const option_date = document.getElementById("option_date")
const option_select = document.getElementById("option_select")
const option_speed = document.getElementById("option_speed")
const option_logs = document.getElementById("option_logs")

export let start_date = null
export let end_date = null
export let speed_scale = 1

export function setSelectedCamera(key,camera,default_selected_val = true,default_other_val = false,object = o_selected){
        Object.keys(object).forEach(k => object[k] = default_other_val)
        if (key && object.hasOwnProperty(key)) {
            object[key] = default_selected_val
            add_log("Selected " + key)
        }
        if(camera) camera.rotation.set(0,0,0)
}
function setSelectedAsteroids(camera,asteroids){
    setSelectedCamera("asteroids",null,!o_selected.asteroids)
    if (o_selected.asteroids){
        for (let asteroid of asteroids){
            const item = document.createElement("li")
            item.textContent = asteroid.name.slice(1,-2)
            item.classList.add("asteroid")
            elements[0].appendChild(item)
            asteroids_stat[asteroid.name.slice(1,-2)] = false
        }
        const labels = document.getElementsByClassName("asteroid")
        for (let label of labels)
            label.onclick = () => setSelectedCamera(label.textContent,camera,true,false,asteroids_stat)
    

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

export function initialize(camera,asteroids = [],select_detection={}){
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

    menu.onclick = () => {
        hidden = !hidden
        if(hidden){
            elements[0].style.display = "none"
            parent_menu.style.height = "fit-content"
        }else{
            elements[0].style.display = "block"
            parent_menu.style.height = "30%"
        }
    }
    const detect_data = {...select_detection,camera}
    sun_o.onclick = () => setSelectedCamera("sun",camera)
    moon_o.onclick = () => setSelectedCamera("moon",camera)
    earth_o.onclick = () => setSelectedCamera("earth",camera)
    freeview_o.onclick = () => setSelectedCamera("freeview",camera)
    asteroids_o.onclick = () => setSelectedAsteroids(camera,asteroids)

    
    decrease_speed_button.onclick = () =>{
        if(speed_scale > 0) speed_scale-=0.5
        add_log("Speed was set to: " + speed_scale + "x")
    }
    increase_speed_button.onclick = () =>{
        if(speed_scale <= 9.5) speed_scale+= 0.5
        add_log("Speed was set to: " + speed_scale + "x")
    }

    date_submit.onclick = () =>{
        start_date = start_date_input.value
        end_date = end_date_input.value
        add_log("Collecting asteroids from date: " + start_date + " to date: "+end_date)
    }
    click_detection(detect_data,o_selected)

    open_panel_button.onclick = () => {
        open_panel_button.style.display = "none"
        side_menu.style.display = "block"
        side_menu_stats.is_open = true
    }
    
    close_panel_button.onclick = () =>{
        side_menu_stats.is_open = false
        open_panel_button.style.display = "block"
        side_menu.style.display = "none"
    }
    show_hide_menu(parent_menu,side_menu_stats.select)
    show_hide_menu(logs,side_menu_stats.logs)
    show_hide_menu(date_control,side_menu_stats.date)
    show_hide_menu(speed_control,side_menu_stats.speed,"grid")  
    option_stats.onclick = () =>{
        const statsFPS = document.getElementById("statsFPS")
        const statsMB = document.getElementById("statsMB")
        const statsMS = document.getElementById("statsMS")
        side_menu_stats.stats = !side_menu_stats.stats
        show_hide_menu(statsFPS,side_menu_stats.stats)
        show_hide_menu(statsMB,side_menu_stats.stats)
        show_hide_menu(statsMS,side_menu_stats.stats)
    }
    option_select.onclick = () =>{
        side_menu_stats.select = !side_menu_stats.select
        show_hide_menu(parent_menu,side_menu_stats.select)
    }
    option_logs.onclick = () =>{
        side_menu_stats.logs = !side_menu_stats.logs
        show_hide_menu(logs,side_menu_stats.logs)
    }
    option_date.onclick = () =>{
        side_menu_stats.date = !side_menu_stats.date
        show_hide_menu(date_control,side_menu_stats.date)
    }
    option_speed.onclick = () =>{
        side_menu_stats.speed = !side_menu_stats.speed
        show_hide_menu(speed_control,side_menu_stats.speed,"grid")  
    }
}
function show_hide_menu(menu,is_visible,display = "block"){
    if(!is_visible) menu.style.display = "none"
    else menu.style.display = display
}
export function update_speed_label(){speed_label.textContent = speed_scale}
function click_detection(select_detection,objects){
    select_detection.renderer.domElement.addEventListener("click",(event)=>{
        select_detection.mouse.x = (event.clientX / select_detection.renderer.domElement.clientWidth) * 2 - 1
        select_detection.mouse.y = (event.clientY / select_detection.renderer.domElement.clientHeight) * 2 - 1
        
        select_detection.raycaster.setFromCamera(select_detection.mouse,select_detection.camera)
    
        const intersects = select_detection.raycaster.intersectObjects(select_detection.scene.children)
        
        if (intersects.length > 0){
            let clickedObject = intersects[0].object
            while(clickedObject.parent && clickedObject.parent.name)
                clickedObject = clickedObject.parent
            console.log(clickedObject.name)

            for (let key of Object.keys(objects))
                if(key == clickedObject.name){
                    setSelectedCamera(key,select_detection.camera,true,false,objects)
                    break
                }
        }
    })
}

export function set_date_labels(start_date_val, end_date_val){
    start_date_input.value = start_date_val
    end_date_input.value = end_date_val
}

export function set_start_date(start_date_val){
    start_date = start_date_val
}
export function set_end_date(end_date_val){
    end_date = end_date_val
}

export function add_log(text){
    const item = document.createElement("p")
    item.textContent = text
    item.classList.add("log")
    logs.appendChild(item)
    logs.scrollTo(0,logs.scrollHeight)
}