import * as browserHandler from "./browserHandler"
import { TabStructData } from "./tabStructData"

export function toBoolean(bool: string): Boolean {
    if (bool == "true") return true
    if (bool == "false") return false
    return false
}

export function reloadExtension(): void {
    browserHandler.reload()
}

export function getHostname(url: string): string {
    if (url == undefined) return ""
    if (url.startsWith("about") || url.startsWith("chrome")) return url
    try {
        const urlObj = new URL(url)
        return urlObj.hostname
    } catch (e) {
        console.warn("Error while getting hostname from url:", url)
        return ""
    }
}

export function getFavIconUrl(eclipseData: TabStructData, url: string): string | undefined {
    const image = eclipseData.favIconStorage[getHostname(url)]
    // console.log("Image", image)

    return image?.imageSrc
}