import { elementData } from "./../interfaces"
import { folderData, itemData, tabStructData } from "../interfaces"
import * as defs from "./definitions"
import {
    getDataStructFromFirefox,
    getFolderJSONObjectByID,
    getItemJSONObjectByItemID,
    getItemJSONObjectByTabID,
    getKeyByIDAndType,
    getNumberOfItemsAlreadyExisting,
    saveDataInFirefox
} from "./getter"
import * as tabHelper from "../tabHelper"
import { generateIndexInFolder } from "./adder"
import { tabExistsByItemID } from "./checker"

/** @deprecated should not be used anymore
 * */
export async function renameFolder(folderID: string, newName: string): Promise<void> {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    const folder = getFolderJSONObjectByID(folderID, data.rootFolder)
    if (folder != undefined) folder.name = newName
    await saveDataInFirefox(data)
}

/** @deprecated
 */
export async function renameItem(itemId: string, newName: string): Promise<void> {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    const item = getItemJSONObjectByItemID(itemId, data.rootFolder)
    if (item == undefined) return
    if (item.parentFolderID == defs.pinnedFolderID || item.parentFolderID == defs.unorderedFolderID) {
        console.warn("Item cannot be renamed because the renaming will be stored nowhere", item)
        return
    }
    item.title = newName
    await saveDataInFirefox(data)
}

/** @deprecated
 */
export async function moveItem(itemID: string, oldParentFolderID: string, newParentFolderID: string): Promise<Boolean> {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return false
    const oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data.rootFolder)
    const newParentFolder = getFolderJSONObjectByID(newParentFolderID, data.rootFolder)
    const item = getItemJSONObjectByItemID(itemID, data.rootFolder)

    if (oldParentFolder == undefined || item == undefined) return false

    const key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID)
    if (oldParentFolder != undefined && newParentFolder != undefined && item != undefined && key != undefined) {
        item.parentFolderID = newParentFolderID
        item.index = generateIndexInFolder(newParentFolder)
        newParentFolder.elements[item.index] = Object.assign({}, item)
        delete oldParentFolder.elements[key as any]
        //oldParentFolder.elements.splice(key as unknown as number, 1)
        await saveDataInFirefox(data)
        return true
    }
    return false
}

/** @deprecated
 */
export async function moveFolder(folderID: string, oldParentFolderID: string, newParentFolderID: string): Promise<Boolean> {
    if (folderID == oldParentFolderID || folderID == newParentFolderID || oldParentFolderID == newParentFolderID) return true
    const data = await getDataStructFromFirefox()
    if (data == undefined) return false
    const oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data.rootFolder)
    const newParentID = newParentFolderID == defs.unorderedFolderID ? "-1" : newParentFolderID
    const newParentFolder = getFolderJSONObjectByID(newParentID, data.rootFolder)
    const folder = getFolderJSONObjectByID(folderID, data.rootFolder)

    if (oldParentFolder == undefined || folder == undefined) return false

    const key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID)
    if (oldParentFolder != undefined && newParentFolder != undefined && folder != undefined && key != undefined) {
        folder.parentFolderID = newParentID
        folder.index = generateIndexInFolder(newParentFolder)
        newParentFolder.elements.push(folder)
        //delete oldParentFolder.elements[key]
        oldParentFolder.elements.splice((key as unknown) as number, 1)
        await saveDataInFirefox(data)
        return true
    }
    return false
}

export function moveElement(element: elementData, oldParent: folderData, newParent: folderData): boolean {
    if (oldParent == undefined || element == undefined || newParent == undefined) return false
    if (oldParent == newParent || element == newParent) return false
    if ("itemID" in element && newParent.folderID == defs.rootFolderID) return false

    if (newParent.folderID == defs.pinnedFolderID || (newParent.folderID == defs.unorderedFolderID && "folderID" in element)) return false

    const key = getKeyByIDAndType(
        oldParent.elements,
        "itemID" in element ? false : true,
        "itemID" in element ? (element as itemData).itemID : (element as folderData).folderID
    )
    /* const id = "itemID" in element ? (element as itemData).itemID : (element as folderData).folderID

    const elItem = "itemID" in element ? getItemJSONObjectByItemID(id, newParent) : undefined
    const elFolder = "folderID" in element ? getFolderJSONObjectByID(id, newParent) : undefined

    // eslint-disable-next-line no-debugger
    debugger

    // check if element is item and item is not in new folder
    if (elItem != undefined) return false
    // check if element is folder and folder is not in new folder
    if (elFolder != undefined) return false */

    if (oldParent != undefined && newParent != undefined && element != undefined && key != undefined) {
        element.parentFolderID = newParent.folderID
        element.index = generateIndexInFolder(newParent)
        newParent.elements[element.index] = Object.assign({}, element)
        oldParent.elements.splice(oldParent.elements.indexOf(element), 1)
        // delete oldParent.elements[key as any]
        // oldParent.elements.length--
        return true
    }
    return false
}

/** @deprecated
 */
export async function removeFolder(folderID: string, oldParentFolderID: string): Promise<Boolean> {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return false
    const oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data.rootFolder)
    const folder = getFolderJSONObjectByID(folderID, data.rootFolder)

    // console.log("Parent folder: ", oldParentFolder)
    // console.log("Folder deleted: ", folder)

    if (data.closeTabsInDeletingFolder == true && folder != undefined && oldParentFolder != undefined && folder.elements != undefined) {
        for (const key in folder.elements) {
            const item = folder.elements[key]
            if ("itemID" in item) {
                if (data.closeTabsInDeletingFolder && (item as itemData).tabID != "-1" && (await tabHelper.tabExists((item as itemData).tabID)))
                    tabHelper.closeTab((item as itemData).tabID)
            } else if ("folderID" in item) {
                removeFolder((item as folderData).folderID, folderID)
            }
        }
    }

    if (oldParentFolder != undefined && folder != undefined) {
        const key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID)
        if (key != undefined) {
            const ele = oldParentFolder.elements[key as any]
            oldParentFolder.elements.splice(oldParentFolder.elements.indexOf(ele), 1)
            // delete oldParentFolder.elements[key as any]
            // oldParentFolder.elements.length -= 1
            await saveDataInFirefox(data)
            return true
        }
    }
    return false
}

/** @deprecated
 */
export async function removeItem(itemID: string, oldParentFolderID: string): Promise<Boolean> {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return false
    const oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data.rootFolder)
    const item = getItemJSONObjectByItemID(itemID, data.rootFolder)

    if (oldParentFolder == undefined || item == undefined) return false

    const key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID)
    if (oldParentFolder != undefined && item != undefined && key != undefined) {
        delete oldParentFolder.elements[key as any]
        await saveDataInFirefox(data)
        return true
    }
    return false
}

export async function removeElement(element: itemData | folderData, parentFolder: folderData, data: tabStructData): Promise<boolean> {
    if (data == undefined || element == undefined || parentFolder == undefined) return false
    const key = getKeyByIDAndType(
        parentFolder.elements,
        "itemID" in element ? false : true,
        "itemID" in element ? (element as itemData).itemID : (element as folderData).folderID
    )

    if (data.closeTabsInDeletingFolder == true && "folderID" in element) {
        const folder = element as folderData
        if (folder != undefined && parentFolder != undefined && folder.elements != undefined) {
            for (const key in folder.elements) {
                const ele = folder.elements[key]
                if ("itemID" in ele) {
                    const tab = ele as itemData
                    if (data.closeTabsInDeletingFolder && tab.tabID != "-1" && (await tabHelper.tabExists(tab.tabID))) tabHelper.closeTab(tab.tabID)
                    tab.tabID = "-1"
                } else if ("folderID" in ele) {
                    removeElement(ele as folderData | itemData, folder, data)
                }
            }
        }
    } else if ("itemID" in element) tabHelper.closeTab(element.tabID)

    if (parentFolder != undefined && element != undefined && key != undefined) {
        parentFolder.elements.splice(parentFolder.elements.indexOf(element), 1)
        // delete parentFolder.elements[key as any]
        // parentFolder.elements.length--
        return true
    } else return false
}

export async function revealElement(element: elementData) {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    revealElementDirect(element, data)
    await saveDataInFirefox(data)
}

export async function revealElementDirect(element: elementData, data: tabStructData) {
    let currEl: elementData = element
    while (currEl != undefined) {
        const parentFolder = getFolderJSONObjectByID(currEl.parentFolderID, data.rootFolder)
        if (parentFolder == undefined || parentFolder == data.rootFolder) return
        parentFolder.open = true
        currEl = parentFolder
        console.log(currEl)
    }
}

/** @deprecated
 */
export async function expandAll() {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    expandRecursion(data.rootFolder)
    await saveDataInFirefox(data)
}

export function expandAllDirect(eclipseData: tabStructData) {
    expandRecursion(eclipseData.rootFolder)
}

export function expandRecursion(data: folderData) {
    data.elements.forEach(element => {
        if ("folderID" in element) {
            const folder = element as folderData
            folder.open = true
            expandRecursion(folder)
        }
    })
}

/** @deprecated
 */
export async function collapseAll() {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    collapseRecursion(data.rootFolder)
    await saveDataInFirefox(data)
}

export function collapseAllDirect(eclipseData: tabStructData) {
    collapseRecursion(eclipseData.rootFolder)
}

export function collapseRecursion(data: folderData) {
    data.elements.forEach(element => {
        if ("folderID" in element) {
            const folder = element as folderData
            folder.open = false
            expandRecursion(folder)
        }
    })
}

export function toggleExpandCascade(folder: folderData) {
    if (folder.open) collapseRecursion(folder)
    else expandRecursion(folder)
    folder.open = !folder.open
}
