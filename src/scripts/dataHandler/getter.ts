import { elementData, FirefoxTab, folderData, folderIDType, itemData, itemIDType, tabIDType, tabStructData } from "../interfaces"
import * as firefoxHandler from "../firefoxHandler"

//#region getter
export function getItemJSONObjectByItemID(itemID: itemIDType, data: folderData): itemData | undefined {
    return getItemJSONObjectByItemIDRecursion(itemID, data.elements)
}

function getItemJSONObjectByItemIDRecursion(itemID: itemIDType, items: Array<elementData>): itemData | undefined {
    let returnVal: itemData | undefined
    for (const key in items) {
        const element = items[key]
        if (element == undefined) {
            console.error("Element undefined (item array, element)", items, element)
            continue
        }
        if ("itemID" in element) {
            if ((element as itemData).itemID == itemID) return element as itemData
        } else if ("folderID" in element) {
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
    let returnVal: itemData | undefined
    for (const key in items) {
        const element = items[key]
        if (element != undefined) {
            if ("itemID" in element) {
                if ((element as itemData).tabID == tabID) return element as itemData
            } else if ("folderID" in element) {
                returnVal = getItemJSONObjectByTabIDRecursion(tabID, (element as folderData).elements)
                if (returnVal != undefined) return returnVal
            }
        }
    }
    return undefined
}

export function getFolderJSONObjectByID(id: folderIDType, data: folderData): folderData | undefined {
    //for selectTab -1 is baseDir
    if (id == "-1") return data
    return getFolderJSONObjectByIDRecursion(id, data.elements)
}

function getFolderJSONObjectByIDRecursion(id: folderIDType, folder: Array<elementData>): folderData | undefined {
    let returnVal: folderData | undefined
    for (const element of folder) {
        if (element != undefined) {
            if ("folderID" in element) {
                const fold = element as folderData
                if (fold.folderID == id) {
                    return element as folderData
                } else {
                    returnVal = getFolderJSONObjectByIDRecursion(id, fold.elements)
                    if (returnVal != undefined) return returnVal
                }
            }
        }
    }
    return undefined
}

export function getKeyByIDAndType(elements: Array<elementData>, isFolder: Boolean, id: string): string | undefined {
    for (const key in elements) {
        const obj = elements[key]
        switch (isFolder) {
            case true:
                if ("folderID" in obj && (obj as folderData).folderID == id) return key
                break
            case false:
                if ("itemID" in obj && (obj as itemData).itemID == id) return key
                break
        }
    }
    return undefined
}

export function getItemJSONObjectByUrl(elements: Array<elementData>, url: string): itemData | undefined {
    return getItemJSONObjectByURLRecursion(elements, url)
}

function getItemJSONObjectByURLRecursion(items: Array<elementData>, url: string): itemData | undefined {
    let returnVal: itemData | undefined
    for (const key in items) {
        const element = items[key]
        if ("itemID" in element) {
            if ((element as itemData).url == url) return element as itemData
        } else if ("folderID" in element) {
            returnVal = getItemJSONObjectByURLRecursion((element as folderData).elements, url)
            if (returnVal != undefined) return returnVal
        }
    }
    return undefined
}

export function getFirefoxTabByURL(tabs: Array<FirefoxTab>, url: string): FirefoxTab | undefined {
    for (const key in tabs) {
        const tab = tabs[key]
        if (tab.url == url) return tab
    }
}

//#endregion

//#region firefox data
export function getFoldersInFolder(folder: folderData): Array<folderData> {
    const folderArr: Array<folderData> = new Array()
    for (const key in folder.elements) {
        const item = folder.elements[key]
        if ("folderID" in item) folderArr.push(item as folderData)
    }
    return folderArr
}

export function saveDataInFirefox(eclipseData: tabStructData | undefined) {
    if (eclipseData == undefined) return false
    return firefoxHandler.localStorageSet({ eclipseData })
}

async function getFirefoxStructFromFirefox() {
    return firefoxHandler.localStorageGetTabStructData("eclipseData")
}

export async function getDataStructFromFirefox(): Promise<tabStructData | undefined> {
    return await getFirefoxStructFromFirefox()
}
//#endregion

export async function getActiveTab() {
    return (await firefoxHandler.tabQuery({ currentWindow: true, active: true }))[0]
}

export function getCurrentWindowTabs() {
    return firefoxHandler.tabQuery({ currentWindow: true })
}

//#region genertators
export async function generateFolderID(): Promise<Number | String> {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return -1
    return getNewUnusedFolderID(data)
}

function getNewUnusedFolderID(data: tabStructData): Number {
    let id = 0
    while (getFolderJSONObjectByID(id.toString(), data.rootFolder) != undefined) {
        id++
    }
    return id
}

/** @deprecated
 */
export function getNumberOfFoldersAlreadyExisting(folderContainer: elementData[]) {
    let number = 0
    for (const key in folderContainer) {
        const item = folderContainer[key]
        if (item == undefined) {
            console.error("Item undefined (folder struct, item)", folderContainer, item)

            continue
        }
        if ("folderID" in item) {
            number++
            number += getNumberOfFoldersAlreadyExisting((item as folderData).elements)
        }
    }
    return number
}

export function getNumberOfItemsAlreadyExisting(folderContainer: any) {
    let number = 0
    for (const key in folderContainer) {
        const item = folderContainer[key]
        if (item.item) number++
        if (item.folder) number += getNumberOfFoldersAlreadyExisting(item.elements)
    }
    return number
}
