export function addCookie(key,value,expires_d = 30){
    const date = new Date()
    date.setTime(date.getTime() + expires_d * 24 * 60 * 60 * 1000)
    document.cookie = `${key}=${value};expires=${date.toUTCString()}`
}

export function getCookie(key) {
    if (!key) return null
    const cookiesSplit = document.cookie.split(";")
    for (let cookie of cookiesSplit){
        const cookiePair = cookie.split("=")
        if (cookiePair[0].slice(1) == key) return cookiePair[1]
    }
    return null
}
