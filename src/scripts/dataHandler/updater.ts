import { elementData, FirefoxTab, folderData, itemData, tabStructData } from "../interfaces"
import { recursiveSelectionSort } from "./sorting"
import * as defs from "./definitions"
import { getFirefoxTabByURL, getFolderJSONObjectByID, getItemJSONObjectByUrl, saveDataInFirefox } from "./getter"
import { addTabSync, createItemIDByTab } from "./adder"
import { tabExistsByTabID } from "./checker"
import { getCurrentTab } from "../tabHelper"

//#region update tabs
async function updatePinnedTabs(tabStruct: tabStructData, tabs: any): Promise<void> {
    let pinnedFolder: folderData | undefined = getFolderJSONObjectByID(defs.pinnedFolderID, tabStruct.rootFolder)
    if (pinnedFolder == undefined) {
        pinnedFolder = {
            name: "Pinned",
            open: true,
            folderID: defs.pinnedFolderID,
            parentFolderID: defs.rootFolderID,
            elements: [],
            index: defs.pinnedIndex
        }
        tabStruct.rootFolder.elements[defs.pinnedIndex] = pinnedFolder
        console.warn(
            "Storage was cleared, imported or you transitioned to a newer version, datastructure is not like it should be, initialising new Pinned Folder. New Struct: ",
            tabStruct
        )
    }
    pinnedFolder.index = defs.pinnedIndex
    pinnedFolder.elements = new Array<elementData>()
    for (const key in tabs) {
        const tab = tabs[key]
        if (tab.pinned) {
            addTabSync(pinnedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden)
        }
    }
}

async function updateUnorderedTabs(tabStruct: tabStructData, tabs: any): Promise<void> {
    let unorderedFolder: folderData | undefined = getFolderJSONObjectByID(defs.unorderedFolderID, tabStruct.rootFolder)
    if (unorderedFolder == undefined) {
        unorderedFolder = {
            name: "Other",
            open: true,
            folderID: defs.unorderedFolderID,
            parentFolderID: defs.rootFolderID,
            elements: [],
            index: defs.unorderedIndex
        }
        tabStruct.rootFolder.elements.push(unorderedFolder)
        console.warn(
            "Storage was cleared, imported or you transitioned to a newer version, datastructure is not like it should be, initialising new unordered Folder. New Struct: ",
            tabStruct
        )
    }
    unorderedFolder.index = defs.unorderedIndex
    unorderedFolder.elements = new Array<elementData>()
    for (const tab of tabs) {
        const exist = tabExistsByTabID(tab.id, tabStruct.rootFolder.elements)
        if (!tab.pinned && !exist) {
            addTabSync(unorderedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden)
        }
    }
}

export async function updateTabsOnStartUp(data: folderData, tabs: any) {
    for (const key in data.elements) {
        const element = data.elements[key]
        if (element != undefined) {
            if ("folderID" in element) updateTabsOnStartUp(element as folderData, tabs)
            else {
                const item = element as itemData
                const firefoxTab = getFirefoxTabByURL(tabs, item.url)
                if (firefoxTab == undefined) {
                    item.tabID = "-1"
                    item.hidden = true
                } else {
                    item.tabID = (firefoxTab.id as unknown) as string
                    item.hidden = firefoxTab.hidden
                    if (item.favIconURL == undefined || item.favIconURL == "" || item.favIconURL.startsWith("http"))
                        item.favIconURL = firefoxTab.favIconUrl
                }
            }
        }
    }
}

export async function updateTabs(tabData: tabStructData, tabs: Array<FirefoxTab>): Promise<void> {
    updatePinnedTabs(tabData, tabs)
    updateUnorderedTabs(tabData, tabs)
    recursiveSelectionSort(tabData.rootFolder)
}

//#endregion
