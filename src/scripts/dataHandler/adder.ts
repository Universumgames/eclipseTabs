import { getManifest } from "../firefoxHandler"
import { ColorScheme, FirefoxTab, folderData, itemData, Mode, tabStructData } from "../interfaces"
import { generateFolderID, getDataStructFromFirefox, getFolderJSONObjectByID, saveDataInFirefox } from "./getter"

export function createEmptyRoot(): folderData {
    return { folderID: "-1", name: "root", open: true, parentFolderID: "-1", index: 0, elements: [] } as folderData
}

export function createEmptyData(): tabStructData {
    const data = {
        mode: Mode.Default,
        rootFolder: { folderID: "-1", name: "root", open: true, parentFolderID: "-1", index: 0, elements: [] },
        colorScheme: ColorScheme.dark,
        devMode: false,
        closeTabsInDeletingFolder: false,
        version: getManifest().version,
        displayHowTo: true,
        hideOrSwitchTab: false
    } as tabStructData
    return data
}

export async function addFolder(parentID: string, newFolderID: string, name: string, data: tabStructData): Promise<folderData | undefined> {
    const parentFolder = getFolderJSONObjectByID(parentID, data.rootFolder)
    if (parentFolder == undefined) return undefined
    const folder: folderData = {
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

export async function addFolderDirect(parentFolder: folderData, newFolderID: string, name: string): Promise<folderData> {
    const folder: folderData = {
        open: true,
        name: name,
        elements: [],
        folderID: newFolderID,
        parentFolderID: parentFolder.folderID,
        index: generateIndexInFolder(parentFolder)
    }
    parentFolder.elements.push(folder)
    return folder
}

export function addTabSync(
    folder: folderData,
    title: string,
    url: string,
    favIconURL: string,
    tabExists: Boolean,
    tabID: string,
    itemID: string,
    hidden: Boolean
): itemData {
    const storedTab: itemData = {
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

/*export async function addTab(
    folderID: string,
    title: string,
    url: string,
    favIconURL: string,
    tabExists: Boolean,
    tabID: string,
    itemID: string,
    hidden: Boolean,
    data: tabStructData
): Promise<itemData> {
    var folder = getFolderJSONObjectByID(folderID, data.rootFolder)
    var item = addTabSync(folder, title, url, favIconURL, tabExists, tabID, itemID, hidden)
    await saveDataInFirefox(data)
    return item
}*/

export function createItemIDByTab(tab: FirefoxTab) {
    return tab.url
}

export function generateIndexInFolder(folder: folderData) {
    return folder.elements.length
}
