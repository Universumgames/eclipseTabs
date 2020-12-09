import { folderData, itemData, tabStructData } from "../interfaces.js"
import { getDataStructFromFirefox, getFolderJSONObjectByID, saveDataInFirefox } from "./getter.js"

export function createEmptyData(): tabStructData {
    return { elements: [], folderID: "-1", name: "root", open: true, parentFolderID: "-1", index: 0 }
}

export async function addFolder(parentID: string, newFolderID: string, name: string): Promise<folderData> {
    var data = await getDataStructFromFirefox()
    var parentFolder = getFolderJSONObjectByID(parentID, data)
    var folder: folderData = {
        open: true,
        name: name,
        elements: [],
        folderID: newFolderID,
        parentFolderID: parentID,
        index: generateIndexInFolder(parentFolder)
    }
    parentFolder.elements.push(folder)
    await saveDataInFirefox(data)
    return folder
}

export function addTabSync(folder: tabStructData | folderData, title: string, url: string, favIconURL: string, tabExists: Boolean, tabID: string, itemID: string, hidden: Boolean): itemData {
    var storedTab: itemData = {
        hidden: hidden,
        tabExists: tabExists,
        tabID: tabID,
        itemID: itemID,
        url: url,
        favIconURL: favIconURL,
        title: title,
        parentFolderID: folder.folderID,
        index: generateIndexInFolder(folder)
    }
    folder.elements.push(storedTab)
    return storedTab
}

export async function addTab(folderID: string, title: string, url: string, favIconURL: string, tabExists: Boolean, tabID: string, itemID: string, hidden: Boolean): Promise<itemData> {
    var data = await getDataStructFromFirefox()
    var folder = getFolderJSONObjectByID(folderID, data)
    var item = addTabSync(folder, title, url, favIconURL, tabExists, tabID, itemID, hidden)
    await saveDataInFirefox(data)
    return item
}

export function createItemIDByTab(tab) {
    return tab.url
}

export function generateIndexInFolder(folder: folderData) {
    return folder.elements.length;
}