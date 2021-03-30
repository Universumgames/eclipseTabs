import { folderData, itemData, tabStructData } from "../interfaces.js"
import * as defs from "./definitions.js"
import {
    getDataStructFromFirefox,
    getFolderJSONObjectByID,
    getItemJSONObjectByItemID,
    getItemJSONObjectByTabID,
    getKeyByIDAndType,
    getNumberOfItemsAlreadyExisting,
    saveDataInFirefox,
} from "./getter.js"
import * as tabHelper from "../tabHelper.js"
import { generateIndexInFolder } from "./adder.js"

export async function renameFolder(folderID: string, newName: string): Promise<void> {
    var data = await getDataStructFromFirefox()
    var folder = getFolderJSONObjectByID(folderID, data.rootFolder)
    folder.name = newName
    await saveDataInFirefox(data)
}

export async function renameItem(itemId: string, newName: string): Promise<void> {
    var data = await getDataStructFromFirefox()
    var item = getItemJSONObjectByItemID(itemId, data.rootFolder)
    if (item.parentFolderID == defs.pinnedFolderID || item.parentFolderID == defs.unorderedFolderID) {
        console.warn("Item cannot be renamed because the renaming will be stored nowhere", item)
        return
    }
    item.title = newName
    await saveDataInFirefox(data)
}

export async function moveItem(itemID: string, oldParentFolderID: string, newParentFolderID: string): Promise<Boolean> {
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data.rootFolder)
    var newParentFolder = getFolderJSONObjectByID(newParentFolderID, data.rootFolder)
    var item = getItemJSONObjectByItemID(itemID, data.rootFolder)
    var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID)
    if (oldParentFolder != undefined && newParentFolder != undefined && item != undefined && key != undefined) {
        item.parentFolderID = newParentFolderID
        item.index = generateIndexInFolder(newParentFolder)
        newParentFolder.elements[item.index] = Object.assign({}, item)
        delete oldParentFolder.elements[key]
        //oldParentFolder.elements.splice(key as unknown as number, 1)
        await saveDataInFirefox(data)
        return true
    }
    return false
}

export async function moveFolder(folderID: string, oldParentFolderID: string, newParentFolderID: string): Promise<Boolean> {
    if (folderID == oldParentFolderID || folderID == newParentFolderID || oldParentFolderID == newParentFolderID) return true
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data.rootFolder)
    var newParentID = newParentFolderID == defs.unorderedFolderID ? "-1" : newParentFolderID
    var newParentFolder = getFolderJSONObjectByID(newParentID, data.rootFolder)
    var folder = getFolderJSONObjectByID(folderID, data.rootFolder)
    var key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID)
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
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data.rootFolder)
    var folder = getFolderJSONObjectByID(folderID, data.rootFolder)

    console.log("Parent folder: ", oldParentFolder)
    console.log("Folder deleted: ", folder)

    if (data.closeTabsInDeletingFolder == true && folder != undefined && oldParentFolder != undefined && folder.elements != undefined) {
        for (var key in folder.elements) {
            var item = folder.elements[key]
            if ("itemID" in item) {
                if (data.closeTabsInDeletingFolder && (item as itemData).tabID != "-1" && (await tabHelper.tabExists((item as itemData).tabID)))
                    tabHelper.closeTab((item as itemData).tabID)
            } else if ("folderID" in item) {
                removeFolder((item as folderData).folderID, folderID)
            }
        }
    }

    if (oldParentFolder != undefined && folder != undefined) {
        var key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID)
        if (key != undefined) {
            delete oldParentFolder.elements[key]
            oldParentFolder.elements.length -= 1
            await saveDataInFirefox(data)
            return true
        }
    }
    return false
}

export async function removeItem(itemID: string, oldParentFolderID: string): Promise<Boolean> {
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data.rootFolder)
    var item = getItemJSONObjectByItemID(itemID, data.rootFolder)
    var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID)
    if (oldParentFolder != undefined && item != undefined && key != undefined) {
        delete oldParentFolder.elements[key]
        await saveDataInFirefox(data)
        return true
    }
    return false
}

export async function expandAll() {
    var data = await getDataStructFromFirefox()
    expandRecursion(data.rootFolder)
    await saveDataInFirefox(data)
}

function expandRecursion(data: folderData) {
    data.elements.forEach((element) => {
        if ("folderID" in element) {
            var folder = element as folderData
            folder.open = true
            expandRecursion(folder)
        }
    })
}

export async function collapseAll() {
    var data = await getDataStructFromFirefox()
    collapseAllRecursion(data.rootFolder)
    await saveDataInFirefox(data)
}

function collapseAllRecursion(data: folderData) {
    data.elements.forEach((element) => {
        if ("folderID" in element) {
            var folder = element as folderData
            folder.open = false
            expandRecursion(folder)
        }
    })
}
