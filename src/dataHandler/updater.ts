import { elementData, folderData, itemData, tabStructData } from '../interfaces.js';
import { recursiveSelectionSort } from '../sorting.js'
import * as defs from './definitions.js'
import { getFirefoxTabByURL, getFolderJSONObjectByID } from './getter.js';
import { addTabSync, createItemIDByTab } from './adder.js'
import { tabExistsByTabID } from './checker.js'

//#region update tabs
function updatePinnedTabs(elements: Array<elementData>, tabs): void {
    var pinnedFolder: folderData = getFolderJSONObjectByID(defs.pinnedFolderID, { elements } as folderData)
    if (pinnedFolder == undefined) {
        pinnedFolder = {
            name: "Pinned Tabs",
            open: true,
            folderID: defs.pinnedFolderID,
            parentFolderID: "-1",
            elements: [],
            index: defs.pinnedIndex
        }
        elements[defs.pinnedIndex] = pinnedFolder
    }
    pinnedFolder.elements = new Array<elementData>();
    for (var key in tabs) {
        var tab = tabs[key]
        if (tab.pinned) {
            addTabSync(pinnedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden)
        }
    }
}

function updateUnorderedTabs(elements: Array<elementData>, tabs): void {
    var unorderedFolder: folderData = getFolderJSONObjectByID(defs.unorderedFolderID, { elements } as folderData)
    if (unorderedFolder == undefined) {
        unorderedFolder = {
            name: "Unordered Tabs",
            open: true,
            folderID: defs.unorderedFolderID,
            parentFolderID: "-1",
            elements: [],
            index: defs.unorderedIndex
        }
        elements[defs.unorderedIndex] = unorderedFolder
    }
    unorderedFolder.elements = new Array<elementData>();
    for (var tab of tabs) {
        var exist = tabExistsByTabID(tab.id, elements)
        if (!tab.pinned && !exist) {
            addTabSync(unorderedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden)
        }
    }
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
    updateUnorderedTabs(elements, tabs)
    updatePinnedTabs(elements, tabs)
    recursiveSelectionSort({ elements } as folderData)
}

//#endregion