import { folderData, itemData } from "../interfaces.js"
import { getDataStructFromFirefox, getFolderJSONObjectByID, getItemJSONObjectByItemID, getKeyByIDAndType, getNumberOfItemsAlreadyExisting, saveDataInFirefox } from "./getter.js"
import * as tabHelper from '../tabHelper.js'
import { generateIndexInFolder } from "./adder.js"

export async function renameFolder(folderID: string, newName: string): Promise<void> {
    var data = await getDataStructFromFirefox()
    var folder = getFolderJSONObjectByID(folderID, data)
    folder.name = newName
    await saveDataInFirefox(data)
}


export async function moveItem(itemID: string, oldParentFolderID: string, newParentFolderID: string): Promise<Boolean> {
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
    var newParentFolder = getFolderJSONObjectByID(newParentFolderID, data)
    var item = getItemJSONObjectByItemID(itemID, data)
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
    if (folderID == oldParentFolderID || folderID == newParentFolderID || oldParentFolderID == newParentFolderID) return true;
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
    var newParentFolder = getFolderJSONObjectByID(newParentFolderID, data)
    var folder = getFolderJSONObjectByID(folderID, data)
    var key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID)
    if (oldParentFolder != undefined && newParentFolder != undefined && folder != undefined && key != undefined) {
        folder.parentFolderID = newParentFolderID
        folder.index = generateIndexInFolder(newParentFolder)
        newParentFolder.elements.push(folder)
        delete oldParentFolder.elements[key]
        //oldParentFolder.elements.splice(key as unknown as number, 1)
        await saveDataInFirefox(data)
        return true
    }
    return false
}

export async function removeFolder(folderID: string, oldParentFolderID: string): Promise<Boolean> {
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
    var folder = getFolderJSONObjectByID(folderID, data)

    for (var key in folder.elements) {
        var item = folder.elements[key]
        if ('itemID' in item) {
            if ((item as itemData).tabID != "-1" && await tabHelper.tabExists((item as itemData).tabID)) tabHelper.closeTab((item as itemData).tabID)
        } else if ('folderID' in item) {
            removeFolder((item as folderData).folderID, folderID)
        }
    }

    var key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID)

    if (oldParentFolder != undefined && folder != undefined && key != undefined) {
        delete oldParentFolder.elements[key]
        oldParentFolder.elements.length -= 1;
        await saveDataInFirefox(data)
        return true
    }
    return false
}

export async function removeItem(itemID: string, oldParentFolderID: string): Promise<Boolean> {
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
    var item = getItemJSONObjectByItemID(itemID, data)
    var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID)
    if (oldParentFolder != undefined && item != undefined && key != undefined) {
        delete oldParentFolder.elements[key]
        await saveDataInFirefox(data)
        return true
    }
    return false
}