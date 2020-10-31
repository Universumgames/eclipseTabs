export const updateHTMLEvent = new Event('updateHTMLList')
import * as tabHelper from './tabHelper.js'
import { elementData, folderData, itemData, tabStructData, itemIDType, tabIDType, folderIDType } from './interfaces.js'
import * as firefoxHandler from './firefoxHandler.js'

//#region update tabs
function updatePinnedTabs(elements: Array<elementData>, tabs): void {
    var pinnedFolder: folderData = {
        name: "Pinned Tabs",
        open: (elements["pinned"] == undefined || elements["pinned"].open == undefined) ? true : elements["pinned"].open,
        folderID: "pinned",
        parentFolderID: "-1",
        elements: []
    }
    for (var key in tabs) {
        var tab = tabs[key]
        if (tab.pinned) {
            addTabSync(pinnedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden)
        }
    }
    elements["pinned"] = pinnedFolder
}

function updateUnorderedTabs(elements: Array<elementData>, tabs): void {
    var unorderedFolder: folderData = {
        name: "Unordered Tabs",
        open: (elements["unordered"] == undefined || elements["unordered"].open == undefined) ? true : elements["unordered"].open,
        folderID: "unordered",
        parentFolderID: "-1",
        elements: []
    }
    for (var tab of tabs) {
        var exist = tabExistsByTabID(tab.id, elements)
        if (!tab.pinned && !exist) {
            addTabSync(unorderedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden)
        }
    }
    elements["unordered"] = unorderedFolder
}

export function updateTabsOnStartUp(data: folderData | tabStructData, tabs): void {
    for (var key in data.elements) {
        var element = data.elements[key]
        if ('folderID' in element) updateTabsOnStartUp(element as folderData, tabs)
        else {
            var item = element as itemData
            var firefoxTab = getFirefoxTabByURL(tabs, item.url)
            if (firefoxTab == undefined) {
                item.tabID = "-1"
                item.hidden = true
            }
            else {
                item.tabID = firefoxTab.id
                item.hidden = firefoxTab.hidden
            }
        }
    }
    /*for(tabKey in tabs){
      var firefoxTab = tabs[tabKey]
      var item = getItemJSONObjectByUrl(firefoxTab.url, data.elements)
      item.tabID = firefoxTab.id
    }*/
}

void function updateOrganisedTabs(elements: tabStructData, tabs): void {

}

export function updateTabs(elements: Array<elementData>, tabs): void {
    updatePinnedTabs(elements, tabs)
    updateUnorderedTabs(elements, tabs)
}

//#endregion

export async function renameFolder(folderID: string, newName: string): Promise<void> {
    var data = await getDataStructFromFirefox()
    var folder = getFolderJSONObjectByID(folderID, data)
    folder.name = newName
    await saveDataInFirefox(data)
}

//#region mover
export async function moveItem(itemID: string, oldParentFolderID: string, newParentFolderID: string): Promise<Boolean> {
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
    var newParentFolder = getFolderJSONObjectByID(newParentFolderID, data)
    var item = getItemJSONObjectByItemID(itemID, data.elements)
    var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID)
    if (oldParentFolder != undefined && newParentFolder != undefined && item != undefined && key != undefined) {
        item.parentFolderID = newParentFolderID
        newParentFolder.elements.push(item)
        delete oldParentFolder.elements[key]
        await saveDataInFirefox(data)
        return true
    }
    return false
}

export async function moveFolder(folderID: string, oldParentFolderID: string, newParentFolderID: string): Promise<Boolean> {
    if(folderID == oldParentFolderID || folderID == newParentFolderID || oldParentFolderID == newParentFolderID) return true;
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
    var newParentFolder = getFolderJSONObjectByID(newParentFolderID, data)
    var folder = getFolderJSONObjectByID(folderID, data)
    var key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID)
    if (oldParentFolder != undefined && newParentFolder != undefined && folder != undefined && key != undefined) {
        folder.parentFolderID = newParentFolderID
        newParentFolder.elements.push(folder)
        delete oldParentFolder.elements[key]
        await saveDataInFirefox(data)
        return true
    }
    return false
}
//#endregion

//#region remover
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
        oldParentFolder.elements.length-= 1;
        await saveDataInFirefox(data)
        return true
    }
    return false
}

export async function removeItem(itemID: string, oldParentFolderID: string): Promise<Boolean> {
    var data = await getDataStructFromFirefox()
    var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
    var item = getItemJSONObjectByItemID(itemID, data.elements)
    var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID)
    if (oldParentFolder != undefined && item != undefined && key != undefined) {
        delete oldParentFolder.elements[key]
        await saveDataInFirefox(data)
        return true
    }
    return false
}
//#endregion

//#region adder
export async function addFolder(parentID: string, newFolderID: string, name: string): Promise<folderData> {
    var data = await getDataStructFromFirefox()
    var parentFolder = getFolderJSONObjectByID(parentID, data)
    var folder: folderData = {
        open: true,
        name: name,
        elements: [],
        folderID: newFolderID,
        parentFolderID: parentID
    }
    parentFolder.elements.push(folder)
    await saveDataInFirefox(data)
    return folder
}

function addTabSync(folder: tabStructData | folderData, title: string, url: string, favIconURL: string, tabExists: Boolean, tabID: string, itemID: string, hidden: Boolean): itemData {
    var storedTab: itemData = {
        hidden: hidden,
        tabExists: tabExists,
        tabID: tabID,
        itemID: itemID,
        url: url,
        favIconURL: favIconURL,
        title: title,
        parentFolderID: folder.folderID
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
//#endregion

//#region getter
export function getItemJSONObjectByItemID(itemID: itemIDType, data: Array<elementData>): itemData | undefined {
    return getItemJSONObjectByItemIDRecursion(itemID, data)
}

function getItemJSONObjectByItemIDRecursion(itemID: itemIDType, items: Array<elementData>): itemData | undefined {
    var returnVal: itemData | undefined
    for (var key in items) {
        var element = items[key]
        if ('itemID' in element) {
            if ((element as itemData).itemID == itemID) return element
        }
        else if ('folderID' in element) {
            returnVal = getItemJSONObjectByItemIDRecursion(itemID, (element as folderData).elements)
            if (returnVal != undefined) return returnVal
        }
    }
    return undefined
}

export function getItemJSONObjectByTabID(tabID: tabIDType, data: Array<elementData>): itemData | undefined {
    return getItemJSONObjectByTabIDRecursion(tabID, data)
}

function getItemJSONObjectByTabIDRecursion(tabID: tabIDType, items: Array<elementData>): itemData | undefined {
    var returnVal: itemData | undefined
    for (var key in items) {
        var element = items[key]
        if ('itemID' in element) {
            if ((element as itemData).tabID == tabID) return element
        }
        else if ('folderID' in element) {
            returnVal = getItemJSONObjectByTabIDRecursion(tabID, (element as folderData).elements)
            if (returnVal != undefined) return returnVal
        }
    }
    return undefined
}

export function getFolderJSONObjectByID(id: folderIDType, data: tabStructData | folderData): tabStructData | folderData | undefined {
    //for selectTab -1 is baseDir
    if (id == "-1") return data
    return getFolderJSONObjectByIDRecursion(id, data.elements)
}

function getFolderJSONObjectByIDRecursion(id: folderIDType, folder: Array<elementData>): folderData | undefined {
    var returnVal: folderData | undefined
    for (var key in folder) {
        var element = folder[key]
        if ('folderID' in element) {
            if ((element as folderData).folderID == id) {
                return element as folderData
            } else {
                returnVal = getFolderJSONObjectByIDRecursion(id, (element as folderData).elements)
                if (returnVal != undefined) return returnVal
            }
        }
    }
    return undefined
}

function getKeyByIDAndType(elements: Array<elementData>, isFolder: Boolean, id: string): string | undefined {
    for (var key in elements) {
        var obj = elements[key]
        switch (isFolder) {
            case true:
                if ('folderID' in obj && (obj as folderData).folderID == id) return key
                break
            case false:
                if ('itemID' in obj && (obj as itemData).itemID == id) return key
                break
        }
    }
    return undefined
}

export function getItemJSONObjectByUrl(elements: Array<elementData>, url: string): itemData | undefined {
    return getItemJSONObjectByURLRecursion(elements, url)
}

function getItemJSONObjectByURLRecursion(items: Array<elementData>, url: string): itemData | undefined {
    var returnVal: itemData | undefined
    for (var key in items) {
        var element = items[key]
        if ('itemID' in element) {
            if ((element as itemData).url == url) return element
        }
        else if ('folderID' in element) {
            returnVal = getItemJSONObjectByURLRecursion((element as folderData).elements, url)
            if (returnVal != undefined) return returnVal
        }
    }
    return undefined
}

export function getFirefoxTabByURL(tabs, url: string) {
    for (var key in tabs) {
        var tab = tabs[key]
        if (tab.url == url) return tab
    }
}

//#endregion

//#region firefox data
export function getFoldersInFolder(folder: folderData): Array<folderData> {
    var folderArr: Array<folderData>
    for (var key in folder.elements) {
        var item = folder.elements[key]
        if ('folderID' in item) folderArr.push(item as folderData)
    }
    return folderArr
}

export function saveDataInFirefox(data: tabStructData) {
    return firefoxHandler.localStorageSet({data})
}

export function getFirefoxStructFromFirefox() {
    return firefoxHandler.localStorageGet("data")
}

export async function getDataStructFromFirefox(): Promise<tabStructData> {
    return (await getFirefoxStructFromFirefox()).data
}
//#endregion

export async function getActiveTab() {
    return (await firefoxHandler.tabQuery({ currentWindow: true, active: true }))[0]
}

export function getCurrentWindowTabs() {
    return firefoxHandler.tabQuery({ currentWindow: true });
}

//#region genertators
export async function generateFolderID() {
    var collectedFolders = 0
    var data = await getDataStructFromFirefox()
    return getnumberOfFoldersAlreadyExisting(data.elements)
}

export function getnumberOfFoldersAlreadyExisting(folderContainer) {
    var number = 0
    for (var key in folderContainer) {
        var item = folderContainer[key]
        if ('folderID' in item) {
            number++
            number += getnumberOfFoldersAlreadyExisting(item.elements)
        }
    }
    return number
}

export function getnumberOfItemsAlreadyExisting(folderContainer) {
    var number = 0
    for (var key in folderContainer) {
        var item = folderContainer[key]
        if (item.item) number++
        if (item.folder) number += getnumberOfFoldersAlreadyExisting(item.elements)
    }
    return number
}

function createItemIDByTab(tab) {
    return tab.url
}

//#endregion

//#region exist functions
export function tabExistsByItemID(itemID: itemIDType, elements: Array<elementData>): Boolean {
    var item = getItemJSONObjectByItemID(itemID, elements)
    return item != undefined && item.parentFolderID != "unordered"
}

export function tabExistsByTabID(tabID: tabIDType, elements: Array<elementData>): Boolean {
    var item = getItemJSONObjectByTabID(tabID, elements)
    return item != undefined && item.parentFolderID != "unordered"
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
//#endregion