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

export async function renameFolder(folderID: string, newName: string): Promise<void> {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    const folder = getFolderJSONObjectByID(folderID, data.rootFolder)
    if (folder != undefined) folder.name = newName
    await saveDataInFirefox(data)
}

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
    //TODO missing implementation of move element
    if (oldParent == undefined || element == undefined) return false

    const key = getKeyByIDAndType(
        oldParent.elements,
        "itemID" in element ? false : true,
        "itemID" in element ? (element as itemData).itemID : (element as folderData).folderID
    )
    if (oldParent != undefined && newParent != undefined && element != undefined && key != undefined) {
        element.parentFolderID = newParent.folderID
        element.index = generateIndexInFolder(newParent)
        newParent.elements[element.index] = Object.assign({}, element)
        delete oldParent.elements[key as any]
        //oldParentFolder.elements.splice(key as unknown as number, 1)
        return true
    }
    return false
}

export async function removeFolder(folderID: string, oldParentFolderID: string): Promise<Boolean> {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return false
    const oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data.rootFolder)
    const folder = getFolderJSONObjectByID(folderID, data.rootFolder)

    console.log("Parent folder: ", oldParentFolder)
    console.log("Folder deleted: ", folder)

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
            delete oldParentFolder.elements[key as any]
            oldParentFolder.elements.length -= 1
            await saveDataInFirefox(data)
            return true
        }
    }
    return false
}

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
    if (data == undefined) return false
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
                    if (data.closeTabsInDeletingFolder && (ele as itemData).tabID != "-1" && (await tabHelper.tabExists((ele as itemData).tabID)))
                        tabHelper.closeTab((ele as itemData).tabID)
                } else if ("folderID" in ele) {
                    removeElement(ele as folderData | itemData, folder, data)
                }
            }
        }
    } else if ("itemID" in element) tabHelper.closeTab(element.tabID)

    if (parentFolder != undefined && element != undefined && key != undefined) {
        delete parentFolder.elements[key as any]
        return true
    } else return false
}

export async function expandAll() {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    expandRecursion(data.rootFolder)
    await saveDataInFirefox(data)
}

export function expandAllDirect(eclipseData: tabStructData) {
    expandRecursion(eclipseData.rootFolder)
}

function expandRecursion(data: folderData) {
    data.elements.forEach(element => {
        if ("folderID" in element) {
            const folder = element as folderData
            folder.open = true
            expandRecursion(folder)
        }
    })
}

export async function collapseAll() {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    collapseAllRecursion(data.rootFolder)
    await saveDataInFirefox(data)
}

export function collapseAllDirect(eclipseData: tabStructData) {
    collapseAllRecursion(eclipseData.rootFolder)
}

function collapseAllRecursion(data: folderData) {
    data.elements.forEach(element => {
        if ("folderID" in element) {
            const folder = element as folderData
            folder.open = false
            expandRecursion(folder)
        }
    })
}
