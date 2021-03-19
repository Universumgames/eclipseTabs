import { elementData, folderIDType, itemIDType, tabIDType, tabStructData } from "../interfaces.js"
import { unorderedFolderID } from "./definitions.js"
import { getItemJSONObjectByItemID, getItemJSONObjectByTabID } from "./getter.js"

export function tabExistsByItemID(itemID: itemIDType, dataStruct: tabStructData): Boolean {
    var item = getItemJSONObjectByItemID(itemID, dataStruct.rootFolder)
    return item != undefined && item.parentFolderID != unorderedFolderID
}

export function tabExistsByTabID(tabID: tabIDType, elements: Array<elementData>): Boolean {
    var item = getItemJSONObjectByTabID(tabID, elements)
    return item != undefined && item.parentFolderID != unorderedFolderID
}

export function folderExists(folderID: folderIDType, elements) {
    var returnVal = undefined
    for (var key in elements) {
        var item = elements[key]
        if (item.folder) {
            if (item.folderID == folderID) {
                return item
            } else returnVal = folderExists(folderID, item.elements)
            if (returnVal != undefined) return returnVal
        }
    }
}
