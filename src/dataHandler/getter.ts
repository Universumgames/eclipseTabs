import { elementData, folderData, folderIDType, itemData, itemIDType, tabIDType, tabStructData } from "../interfaces.js"
import * as firefoxHandler from '../firefoxHandler.js'

//#region getter
export function getItemJSONObjectByItemID(itemID: itemIDType, data: tabStructData | folderData): itemData | undefined {
    return getItemJSONObjectByItemIDRecursion(itemID, data.elements)
}

function getItemJSONObjectByItemIDRecursion(itemID: itemIDType, items: Array<elementData>): itemData | undefined {
    var returnVal: itemData | undefined
    for (var key in items) {
        var element = items[key]
        if (element == undefined) {
            console.error("Element undefined (item array, element)", items, element)
            continue
        }
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
        if (element != undefined) {
            if ('itemID' in element) {
                if ((element as itemData).tabID == tabID) return element
            }
            else if ('folderID' in element) {
                returnVal = getItemJSONObjectByTabIDRecursion(tabID, (element as folderData).elements)
                if (returnVal != undefined) return returnVal
            }
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
        if (element != undefined) {
            if ('folderID' in element) {
                if ((element as folderData).folderID == id) {
                    return element as folderData
                } else {
                    returnVal = getFolderJSONObjectByIDRecursion(id, (element as folderData).elements)
                    if (returnVal != undefined) return returnVal
                }
            }
        }
    }
    return undefined
}

export function getKeyByIDAndType(elements: Array<elementData>, isFolder: Boolean, id: string): string | undefined {
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
    return firefoxHandler.localStorageSet({ data })
}

function getFirefoxStructFromFirefox() {
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
    return getNumberOfFoldersAlreadyExisting(data.elements)
}

export function getNumberOfFoldersAlreadyExisting(folderContainer) {
    var number = 0
    for (var key in folderContainer) {
        var item = folderContainer[key]
        if (item == undefined) {
            console.error("Item undefined (folder struct, item)", folderContainer, item)

            continue
        }
        if ('folderID' in item) {
            number++
            number += getNumberOfFoldersAlreadyExisting(item.elements)
        }
    }
    return number
}

export function getNumberOfItemsAlreadyExisting(folderContainer) {
    var number = 0
    for (var key in folderContainer) {
        var item = folderContainer[key]
        if (item.item) number++
        if (item.folder) number += getNumberOfFoldersAlreadyExisting(item.elements)
    }
    return number
}