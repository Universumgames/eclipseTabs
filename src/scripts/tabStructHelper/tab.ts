import { pinnedFolderID, pinnedIndex, unorderedFolderID, unorderedIndex } from "../definitions";
import { ElementData, FolderData, ItemData } from "../elementData";
import { FirefoxTab, itemIDType } from "../interfaces";
import { TabStructData } from "../tabStructData";
import { sort } from "./change";

export function updateTabs(this: TabStructData, tabs: FirefoxTab[]) {
    // TODO

    updatePinnedTabs.call(this, tabs);
    updateUnorderedTabs.call(this, tabs);
    updateSavedTabs.call(this, tabs);

    sort.call(this);
}

function updatePinnedTabs(this: TabStructData, tabs: FirefoxTab[]) {
    let pinnedFolder = this.findFolderByID(pinnedFolderID);
    if (!pinnedFolder) {
        pinnedFolder = this.rootFolder.createFolder("Pinned");
        pinnedFolder.folderID = pinnedFolderID;
        pinnedFolder.index = pinnedIndex;
    }
    pinnedFolder.elements = new Array<ElementData>();
    const that = this
    for (const tab of tabs) {
        if (tab.pinned) {
            pinnedFolder.addFirefoxTab((itemID: itemIDType, url: string, favIcon: string) => { that.addFavIcon(itemID, url, favIcon) }, tab);
        }
    }
}

function updateUnorderedTabs(this: TabStructData, tabs: FirefoxTab[]) {
    let unorderedFolder = this.findFolderByID(unorderedFolderID);
    if (!unorderedFolder) {
        unorderedFolder = this.rootFolder.createFolder("Other");
        unorderedFolder.folderID = unorderedFolderID;
        unorderedFolder.index = unorderedIndex;
    }
    unorderedFolder.elements = new Array<ElementData>();
    const that = this
    for (const tab of tabs) {
        const exists = this.findItemByTabID(tab.id) != undefined;

        if (!tab.pinned && !exists) {
            unorderedFolder.addFirefoxTab((itemID: itemIDType, url: string, favIcon: string) => { that.addFavIcon(itemID, url, favIcon) }, tab);
        }
    }
}

function updateSavedTabs(this: TabStructData, tabs: FirefoxTab[]) {
    updateSavedTabsRecursive.call(this, tabs, this.rootFolder);
}

function updateSavedTabsRecursive(this: TabStructData, tabs: FirefoxTab[], folder: FolderData) {
    for (const element of folder.elements) {
        if (element instanceof FolderData) {
            updateSavedTabsRecursive.call(this, tabs, element);
        } else if (element instanceof ItemData) {
            const item = element as ItemData;
            const firefoxTab = getFirefoxTabByURL(tabs, item.url);
            if (firefoxTab) {
                item.tabID = firefoxTab.id.toString();
                item.tabExists = true;
                item.hidden = firefoxTab.hidden;
            } else {
                item.tabID = "-1";
                item.tabExists = false;
                item.hidden = true;
            }
        }
    }
}

function getFirefoxTabByURL(tabs: FirefoxTab[], url: string): FirefoxTab | undefined {
    for (const tab of tabs) {
        if (tab.url == url) {
            return tab;
        }
    }
    return undefined;
}