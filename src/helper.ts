import * as firefoxHandler from './firefoxHandler.js'

export function toBoolean(bool: string): Boolean {
    if (bool == "true") return true
    if (bool == "false") return false
    return false
}

export function reloadExtension(): void {
    firefoxHandler.reload()
}

export function isFolder(element: HTMLElement): Boolean {
    return (element.getAttribute("isFolder") != undefined && toBoolean(element.getAttribute("isFolder")))
}

export function isItem(element: HTMLElement): Boolean {
    return (element.getAttribute("isItem") != undefined && toBoolean(element.getAttribute("isItem")))
}

export function isInbetween(element: HTMLElement): Boolean {
    return (element.getAttribute("isInbetween") != undefined && toBoolean(element.getAttribute("isInbetween")))
}

export function isTrashcan(element: HTMLElement) {

}