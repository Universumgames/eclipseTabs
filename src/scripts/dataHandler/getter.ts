import { elementData, FirefoxTab, folderData, folderIDType, itemData, itemIDType, tabIDType, tabStructData } from "../interfaces"
import * as browserHandler from "../browserHandler"

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

export function search(query: { text?: string; regex?: RegExp; matchCase?: Boolean }, folder: folderData): elementData[] {
    let results: elementData[] = []

    let regex: RegExp
    if (query.regex) regex = query.regex
    else regex = new RegExp(query.text ?? "", query.matchCase ? "g" : "gi")

    for (const element of folder.elements) {
        if ("itemID" in element) {
            const item = element as itemData
            if (regex.test(item.itemID) || regex.test(item.title) || regex.test(item.url)) results.push(item)
        } else if ("folderID" in element) {
            const folder = element as folderData
            if (regex.test(folder.folderID) || regex.test(folder.name)) results.push(folder)
            results = [...results, ...search({ regex: regex }, folder)]
        }
    }
    return results
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
    return browserHandler.localStorageSet({ eclipseData })
}

async function getFirefoxStructFromFirefox() {
    return browserHandler.localStorageGetTabStructData("eclipseData")
}

export async function getDataStructFromFirefox(): Promise<tabStructData | undefined> {
    return await getFirefoxStructFromFirefox()
}
//#endregion

export async function getActiveTab() {
    return (await browserHandler.tabQuery({ currentWindow: true, active: true }))[0]
}

export function getCurrentWindowTabs() {
    return browserHandler.tabQuery({ currentWindow: true })
}

//#region generators
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

export function getNumberOfOpenedTabs(folder: folderData): number {
    let count = 0
    for (const element of folder.elements) {
        if ("itemID" in element && (element as itemData).tabID != "-1") count++
        else if ("folderID" in element) count += getNumberOfOpenedTabs(element as folderData)
    }
    return count
}

export function getHostname(url: string): string {
    if (url == undefined) return ""
    if (url.startsWith("about") || url.startsWith("chrome")) return url
    try {
        const urlObj = new URL(url)
        return urlObj.hostname
    } catch (e) {
        console.warn("Error while getting hostname from url:", url)
        return ""
    }
}

export function getFavIconUrl(eclipseData: tabStructData, url: string): string | undefined {
    const image = eclipseData.favIconStorage[getHostname(url)]
    // console.log("Image", image)

    return image?.imageSrc
}
