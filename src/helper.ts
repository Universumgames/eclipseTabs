import * as chromiumHandler from './chromiumHandler.js'

export function toBoolean(bool: string): Boolean {
    if (bool == "true") return true
    if (bool == "false") return false
    return false
}

export function reloadExtension(): void {
    chromiumHandler.reload()
}

export function isFolder(element: HTMLElement): Boolean {
    return (element.getAttribute("isfolder") != undefined && toBoolean(element.getAttribute("isFolder")))
}

export function isItem(element: HTMLElement): Boolean {
    return (element.getAttribute("isitem") != undefined && toBoolean(element.getAttribute("isItem")))
}

export function isInbetween(element: HTMLElement): Boolean {
    return (element.getAttribute("isinbetween") != undefined && toBoolean(element.getAttribute("isInbetween")))
}

export function isTrashcan(element: HTMLElement) {

}