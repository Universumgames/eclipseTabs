import { elementData, folderData, folderIDType, itemData, itemIDType, tabIDType, tabStructData } from "../interfaces"
import { unorderedFolderID } from "./definitions"
import { getFolderJSONObjectByID, getItemJSONObjectByItemID, getItemJSONObjectByTabID } from "./getter"

export function tabExistsByItemID(itemID: itemIDType, dataStruct: tabStructData): Boolean {
    const item = getItemJSONObjectByItemID(itemID, dataStruct.rootFolder)
    return item != undefined && item.parentFolderID != unorderedFolderID
}

export function tabExistsByTabID(tabID: tabIDType, elements: Array<elementData>): Boolean {
    const item = getItemJSONObjectByTabID(tabID, elements)
    return item != undefined && item.parentFolderID != unorderedFolderID
}

export function folderExists(folderID: folderIDType, elements: Array<elementData>): folderData | undefined {
    let returnVal = undefined
    for (const el of elements) {
        if ("folderID" in el) {
            const fold = el as folderData
            if (fold.folderID == folderID) {
                return fold
            } else returnVal = folderExists(folderID, fold.elements)
            if (returnVal != undefined) return returnVal
        }
    }
}

export function folderOrChildrenContainsElement(element: elementData, elements: Array<elementData>): Boolean {
    for (const el of elements) {
        if ("folderID" in el) {
            const fold = el as folderData
            if ("folderID" in element && fold.folderID == (element as folderData).folderID) return true
            if (folderOrChildrenContainsElement(element, fold.elements)) return true
        } else if ("itemID" in el && "itemID" in element) {
            const item = el as itemData
            if (item.itemID == (element as itemData).itemID) return true
        }
    }
    return false
}
