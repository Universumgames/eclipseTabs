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
} from "./getter.js"
import * as tabHelper from "../tabHelper.js"
import { generateIndexInFolder } from "./adder.js"

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

export async function expandAll() {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    expandRecursion(data.rootFolder)
    await saveDataInFirefox(data)
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

function collapseAllRecursion(data: folderData) {
    data.elements.forEach(element => {
        if ("folderID" in element) {
            const folder = element as folderData
            folder.open = false
            expandRecursion(folder)
        }
    })
}
