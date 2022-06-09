import { elementData, folderData, itemData } from "./interfaces"

export function shareString(element: elementData, indent: number = 0) {
    let exportString = ""
    let indentString = ""
    for (let i = 0; i < indent; i++) {
        indentString += "  "
    }
    if ("itemID" in element) {
        const item = element as itemData
        exportString = `${indentString}${item.title}: ${item.url}`
    } else if ("folderID" in element) {
        const folder = element as folderData
        exportString = indentString + folder.name + "\n"
        for (const el of folder.elements) {
            exportString += shareString(el, indent + 1) + "\n"
        }
    }
    return exportString
}
