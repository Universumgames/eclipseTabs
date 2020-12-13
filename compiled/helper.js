import * as firefoxHandler from './firefoxHandler.js';
export function toBoolean(bool) {
    if (bool == "true")
        return true;
    if (bool == "false")
        return false;
    return false;
}
export function reloadExtension() {
    firefoxHandler.reload();
}
export function isFolder(element) {
    return (element.getAttribute("isfolder") != undefined && toBoolean(element.getAttribute("isFolder")));
}
export function isItem(element) {
    return (element.getAttribute("isitem") != undefined && toBoolean(element.getAttribute("isItem")));
}
export function isInbetween(element) {
    return (element.getAttribute("isinbetween") != undefined && toBoolean(element.getAttribute("isInbetween")));
}
export function isTrashcan(element) {
}
//# sourceMappingURL=helper.js.map