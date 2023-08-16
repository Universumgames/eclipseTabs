import { ElementData, FolderData, ItemData } from "./elementData"

export function shareString(element: ElementData, indent: number = 0) {
    let exportString = ""
    let indentString = ""
    for (let i = 0; i < indent; i++) {
        indentString += "  "
    }
    if ("itemID" in element) {
        const item = element as ItemData
        exportString = `${indentString}${item.title}: ${item.url}`
    } else if ("folderID" in element) {
        const folder = element as FolderData
        exportString = indentString + folder.name + "\n"
        for (const el of folder.elements) {
            exportString += shareString(el, indent + 1) + "\n"
        }
    }
    return exportString
}
