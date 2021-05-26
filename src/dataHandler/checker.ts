import { elementData, folderData, folderIDType, itemIDType, tabIDType, tabStructData } from "../interfaces.js"
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

export function folderExists(folderID: folderIDType, elements: Array<elementData>) {
    var returnVal = undefined
    for (var el of elements) {
        if ("folderID" in el) {
            var fold = el as folderData
            if (fold.folderID == folderID) {
                return fold
            } else returnVal = folderExists(folderID, fold.elements)
            if (returnVal != undefined) return returnVal
        }
    }
}
