import { elementData, FirefoxTab, folderData, itemData, tabStructData } from "../interfaces.js"
import { recursiveSelectionSort } from "./sorting.js"
import * as defs from "./definitions.js"
import { getFirefoxTabByURL, getFolderJSONObjectByID, getItemJSONObjectByUrl } from "./getter.js"
import { addTabSync, createItemIDByTab } from "./adder.js"
import { tabExistsByTabID } from "./checker.js"
import { getCurrentTab } from "../tabHelper.js"

//#region update tabs
async function updatePinnedTabs(tabStruct: tabStructData, tabs): Promise<void> {
    var pinnedFolder: folderData = getFolderJSONObjectByID(defs.pinnedFolderID, tabStruct.rootFolder)
    if (pinnedFolder == undefined) {
        pinnedFolder = {
            name: "Pinned Tabs",
            open: true,
            folderID: defs.pinnedFolderID,
            parentFolderID: "-1",
            elements: [],
            index: defs.pinnedIndex,
        }
        tabStruct.rootFolder.elements[defs.pinnedIndex] = pinnedFolder
        console.warn(
            "Storage was cleared, imported or you transitioned to a newer version, datastructure is not like it should be, initizialising new Pinned Folder. New Struct: ",
            tabStruct
        )
    }
    pinnedFolder.index = defs.pinnedIndex
    pinnedFolder.elements = new Array<elementData>()
    for (var key in tabs) {
        var tab = tabs[key]
        if (tab.pinned) {
            addTabSync(pinnedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden)
        }
    }
}

async function updateUnorderedTabs(tabStruct: tabStructData, tabs): Promise<void> {
    var unorderedFolder: folderData = getFolderJSONObjectByID(defs.unorderedFolderID, tabStruct.rootFolder)
    if (unorderedFolder == undefined) {
        unorderedFolder = {
            name: "Unordered Tabs",
            open: true,
            folderID: defs.unorderedFolderID,
            parentFolderID: "-1",
            elements: [],
            index: defs.unorderedIndex,
        }
        tabStruct.rootFolder.elements[defs.unorderedIndex] = unorderedFolder
        console.warn(
            "Storage was cleared, imported or you transitioned to a newer version, datastructure is not like it should be, initizialising new unordered Folder. New Struct: ",
            tabStruct
        )
    }
    unorderedFolder.index = defs.unorderedIndex
    unorderedFolder.elements = new Array<elementData>()
    for (var tab of tabs) {
        var exist = tabExistsByTabID(tab.id, tabStruct.rootFolder.elements)
        if (!tab.pinned && !exist) {
            addTabSync(unorderedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden)
        }
    }
}

export async function updateTabsOnStartUp(data: folderData, tabs): Promise<void> {
    for (var key in data.elements) {
        var element = data.elements[key]
        if (element != undefined) {
            if ("folderID" in element) updateTabsOnStartUp(element as folderData, tabs)
            else {
                var item = element as itemData
                var firefoxTab = getFirefoxTabByURL(tabs, item.url)
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
    /*for(tabKey in tabs){
      var firefoxTab = tabs[tabKey]
      var item = getItemJSONObjectByUrl(firefoxTab.url, data.elements)
      item.tabID = firefoxTab.id
    }*/
}

export async function updateTabs(tabData: tabStructData, tabs: Array<FirefoxTab>): Promise<void> {
    updatePinnedTabs(tabData, tabs)
    updateUnorderedTabs(tabData, tabs)
    recursiveSelectionSort(tabData.rootFolder)

    /*var cur = await getCurrentTab()
    var item = getItemJSONObjectByUrl(tabData.rootFolder.elements, cur.url)
    if (item.favIconURL == undefined || item.favIconURL == "" || item.favIconURL.startsWith("http")) item.favIconURL = cur.favIconUrl*/
}

//#endregion
