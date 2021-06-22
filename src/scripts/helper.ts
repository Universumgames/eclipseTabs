import * as firefoxHandler from "./firefoxHandler"

export function toBoolean(bool: string): Boolean {
    if (bool == "true") return true
    if (bool == "false") return false
    return false
}

export function reloadExtension(): void {
    firefoxHandler.reload()
}

export function isFolder(element: HTMLElement): Boolean {
    return element != undefined && element.getAttribute("isfolder") != undefined && toBoolean(element.getAttribute("isFolder") as any)
}

export function isItem(element: HTMLElement): Boolean {
    return element != undefined && element.getAttribute("isitem") != undefined && toBoolean(element.getAttribute("isItem") as any)
}

export function isInbetween(element: HTMLElement): Boolean {
    return element != undefined && element.getAttribute("isinbetween") != undefined && toBoolean(element.getAttribute("isInbetween") as any)
}

export function isTrashcan(element: HTMLElement) {}
