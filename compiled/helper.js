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
    return (element.getAttribute("isFolder") != undefined && toBoolean(element.getAttribute("isFolder")));
}
export function isItem(element) {
    return (element.getAttribute("isItem") != undefined && toBoolean(element.getAttribute("isItem")));
}
//# sourceMappingURL=helper.js.map