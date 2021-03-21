import { recursiveSelectionSort } from './sorting.js';
import * as defs from './definitions.js';
import { getFirefoxTabByURL, getFolderJSONObjectByID } from './getter.js';
import { addTabSync, createItemIDByTab } from './adder.js';
import { tabExistsByTabID } from './checker.js';
function updatePinnedTabs(tabStruct, tabs) {
    var pinnedFolder = getFolderJSONObjectByID(defs.pinnedFolderID, tabStruct);
    if (pinnedFolder == undefined) {
        pinnedFolder = {
            name: "Pinned Tabs",
            open: true,
            folderID: defs.pinnedFolderID,
            parentFolderID: "-1",
            elements: [],
            index: defs.pinnedIndex
        };
        tabStruct.elements[defs.pinnedIndex] = pinnedFolder;
        console.warn("Storage was cleared, imported or you transitioned to a newer version, datastructure is not like it should be, initizialising new Pinned Folder. New Struct: ", tabStruct);
    }
    pinnedFolder.index = defs.pinnedIndex;
    pinnedFolder.elements = new Array();
    for (var key in tabs) {
        var tab = tabs[key];
        if (tab.pinned) {
            addTabSync(pinnedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden);
        }
    }
}
function updateUnorderedTabs(tabStruct, tabs) {
    var unorderedFolder = getFolderJSONObjectByID(defs.unorderedFolderID, tabStruct);
    if (unorderedFolder == undefined) {
        unorderedFolder = {
            name: "Unordered Tabs",
            open: true,
            folderID: defs.unorderedFolderID,
            parentFolderID: "-1",
            elements: [],
            index: defs.unorderedIndex
        };
        tabStruct.elements[defs.unorderedIndex] = unorderedFolder;
        console.warn("Storage was cleared, imported or you transitioned to a newer version, datastructure is not like it should be, initizialising new unordered Folder. New Struct: ", tabStruct);
    }
    unorderedFolder.index = defs.unorderedIndex;
    unorderedFolder.elements = new Array();
    for (var tab of tabs) {
        var exist = tabExistsByTabID(tab.id, tabStruct.elements);
        if (!tab.pinned && !exist) {
            addTabSync(unorderedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden);
        }
    }
}
export function updateTabsOnStartUp(data, tabs) {
    for (var key in data.elements) {
        var element = data.elements[key];
        if (element != undefined) {
            if ('folderID' in element)
                updateTabsOnStartUp(element, tabs);
            else {
                var item = element;
                var firefoxTab = getFirefoxTabByURL(tabs, item.url);
                if (firefoxTab == undefined) {
                    item.tabID = "-1";
                    item.hidden = true;
                }
                else {
                    item.tabID = firefoxTab.id;
                    item.hidden = firefoxTab.hidden;
                }
            }
        }
    }
}
void function updateOrganisedTabs(elements, tabs) {
};
export function updateTabs(tabData, tabs) {
    updatePinnedTabs(tabData, tabs);
    updateUnorderedTabs(tabData, tabs);
    recursiveSelectionSort(tabData);
}
//# sourceMappingURL=updater.js.map