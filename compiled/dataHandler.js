var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const updateHTMLEvent = new Event('updateHTMLList');
import * as tabHelper from './tabHelper.js';
import * as firefoxHandler from './firefoxHandler.js';
function updatePinnedTabs(elements, tabs) {
    var pinnedFolder = {
        name: "Pinned Tabs",
        open: (elements["pinned"] == undefined || elements["pinned"].open == undefined) ? true : elements["pinned"].open,
        folderID: "pinned",
        parentFolderID: "-1",
        elements: []
    };
    for (var key in tabs) {
        var tab = tabs[key];
        if (tab.pinned) {
            addTabSync(pinnedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden);
        }
    }
    elements["pinned"] = pinnedFolder;
}
function updateUnorderedTabs(elements, tabs) {
    var unorderedFolder = {
        name: "Unordered Tabs",
        open: (elements["unordered"] == undefined || elements["unordered"].open == undefined) ? true : elements["unordered"].open,
        folderID: "unordered",
        parentFolderID: "-1",
        elements: []
    };
    for (var tab of tabs) {
        var exist = tabExistsByTabID(tab.id, elements);
        if (!tab.pinned && !exist) {
            addTabSync(unorderedFolder, tab.title, tab.url, tab.favIconUrl, true, tab.id, createItemIDByTab(tab), tab.hidden);
        }
    }
    elements["unordered"] = unorderedFolder;
}
export function updateTabsOnStartUp(data, tabs) {
    for (var key in data.elements) {
        var element = data.elements[key];
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
void function updateOrganisedTabs(elements, tabs) {
};
export function updateTabs(elements, tabs) {
    updatePinnedTabs(elements, tabs);
    updateUnorderedTabs(elements, tabs);
}
export function renameFolder(folderID, newName) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield getDataStructFromFirefox();
        var folder = getFolderJSONObjectByID(folderID, data);
        folder.name = newName;
        yield saveDataInFirefox(data);
    });
}
export function moveItem(itemID, oldParentFolderID, newParentFolderID) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield getDataStructFromFirefox();
        var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data);
        var newParentFolder = getFolderJSONObjectByID(newParentFolderID, data);
        var item = getItemJSONObjectByItemID(itemID, data.elements);
        var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID);
        if (oldParentFolder != undefined && newParentFolder != undefined && item != undefined && key != undefined) {
            item.parentFolderID = newParentFolderID;
            newParentFolder.elements.push(item);
            delete oldParentFolder.elements[key];
            yield saveDataInFirefox(data);
            return true;
        }
        return false;
    });
}
export function moveFolder(folderID, oldParentFolderID, newParentFolderID) {
    return __awaiter(this, void 0, void 0, function* () {
        if (folderID == oldParentFolderID || folderID == newParentFolderID || oldParentFolderID == newParentFolderID)
            return true;
        var data = yield getDataStructFromFirefox();
        var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data);
        var newParentFolder = getFolderJSONObjectByID(newParentFolderID, data);
        var folder = getFolderJSONObjectByID(folderID, data);
        var key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID);
        if (oldParentFolder != undefined && newParentFolder != undefined && folder != undefined && key != undefined) {
            folder.parentFolderID = newParentFolderID;
            newParentFolder.elements.push(folder);
            delete oldParentFolder.elements[key];
            yield saveDataInFirefox(data);
            return true;
        }
        return false;
    });
}
export function removeFolder(folderID, oldParentFolderID) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield getDataStructFromFirefox();
        var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data);
        var folder = getFolderJSONObjectByID(folderID, data);
        for (var key in folder.elements) {
            var item = folder.elements[key];
            if ('itemID' in item) {
                if (item.tabID != "-1" && (yield tabHelper.tabExists(item.tabID)))
                    tabHelper.closeTab(item.tabID);
            }
            else if ('folderID' in item) {
                removeFolder(item.folderID, folderID);
            }
        }
        var key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID);
        if (oldParentFolder != undefined && folder != undefined && key != undefined) {
            delete oldParentFolder.elements[key];
            oldParentFolder.elements.length -= 1;
            yield saveDataInFirefox(data);
            return true;
        }
        return false;
    });
}
export function removeItem(itemID, oldParentFolderID) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield getDataStructFromFirefox();
        var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data);
        var item = getItemJSONObjectByItemID(itemID, data.elements);
        var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID);
        if (oldParentFolder != undefined && item != undefined && key != undefined) {
            delete oldParentFolder.elements[key];
            yield saveDataInFirefox(data);
            return true;
        }
        return false;
    });
}
export function addFolder(parentID, newFolderID, name) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield getDataStructFromFirefox();
        var parentFolder = getFolderJSONObjectByID(parentID, data);
        var folder = {
            open: true,
            name: name,
            elements: [],
            folderID: newFolderID,
            parentFolderID: parentID
        };
        parentFolder.elements.push(folder);
        yield saveDataInFirefox(data);
        return folder;
    });
}
function addTabSync(folder, title, url, favIconURL, tabExists, tabID, itemID, hidden) {
    var storedTab = {
        hidden: hidden,
        tabExists: tabExists,
        tabID: tabID,
        itemID: itemID,
        url: url,
        favIconURL: favIconURL,
        title: title,
        parentFolderID: folder.folderID
    };
    folder.elements.push(storedTab);
    return storedTab;
}
export function addTab(folderID, title, url, favIconURL, tabExists, tabID, itemID, hidden) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield getDataStructFromFirefox();
        var folder = getFolderJSONObjectByID(folderID, data);
        var item = addTabSync(folder, title, url, favIconURL, tabExists, tabID, itemID, hidden);
        yield saveDataInFirefox(data);
        return item;
    });
}
export function getItemJSONObjectByItemID(itemID, data) {
    return getItemJSONObjectByItemIDRecursion(itemID, data);
}
function getItemJSONObjectByItemIDRecursion(itemID, items) {
    var returnVal;
    for (var key in items) {
        var element = items[key];
        if ('itemID' in element) {
            if (element.itemID == itemID)
                return element;
        }
        else if ('folderID' in element) {
            returnVal = getItemJSONObjectByItemIDRecursion(itemID, element.elements);
            if (returnVal != undefined)
                return returnVal;
        }
    }
    return undefined;
}
export function getItemJSONObjectByTabID(tabID, data) {
    return getItemJSONObjectByTabIDRecursion(tabID, data);
}
function getItemJSONObjectByTabIDRecursion(tabID, items) {
    var returnVal;
    for (var key in items) {
        var element = items[key];
        if ('itemID' in element) {
            if (element.tabID == tabID)
                return element;
        }
        else if ('folderID' in element) {
            returnVal = getItemJSONObjectByTabIDRecursion(tabID, element.elements);
            if (returnVal != undefined)
                return returnVal;
        }
    }
    return undefined;
}
export function getFolderJSONObjectByID(id, data) {
    if (id == "-1")
        return data;
    return getFolderJSONObjectByIDRecursion(id, data.elements);
}
function getFolderJSONObjectByIDRecursion(id, folder) {
    var returnVal;
    for (var key in folder) {
        var element = folder[key];
        if ('folderID' in element) {
            if (element.folderID == id) {
                return element;
            }
            else {
                returnVal = getFolderJSONObjectByIDRecursion(id, element.elements);
                if (returnVal != undefined)
                    return returnVal;
            }
        }
    }
    return undefined;
}
function getKeyByIDAndType(elements, isFolder, id) {
    for (var key in elements) {
        var obj = elements[key];
        switch (isFolder) {
            case true:
                if ('folderID' in obj && obj.folderID == id)
                    return key;
                break;
            case false:
                if ('itemID' in obj && obj.itemID == id)
                    return key;
                break;
        }
    }
    return undefined;
}
export function getItemJSONObjectByUrl(elements, url) {
    return getItemJSONObjectByURLRecursion(elements, url);
}
function getItemJSONObjectByURLRecursion(items, url) {
    var returnVal;
    for (var key in items) {
        var element = items[key];
        if ('itemID' in element) {
            if (element.url == url)
                return element;
        }
        else if ('folderID' in element) {
            returnVal = getItemJSONObjectByURLRecursion(element.elements, url);
            if (returnVal != undefined)
                return returnVal;
        }
    }
    return undefined;
}
export function getFirefoxTabByURL(tabs, url) {
    for (var key in tabs) {
        var tab = tabs[key];
        if (tab.url == url)
            return tab;
    }
}
export function getFoldersInFolder(folder) {
    var folderArr;
    for (var key in folder.elements) {
        var item = folder.elements[key];
        if ('folderID' in item)
            folderArr.push(item);
    }
    return folderArr;
}
export function saveDataInFirefox(data) {
    return firefoxHandler.localStorageSet({ data });
}
export function getFirefoxStructFromFirefox() {
    return firefoxHandler.localStorageGet("data");
}
export function getDataStructFromFirefox() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getFirefoxStructFromFirefox()).data;
    });
}
export function getActiveTab() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield firefoxHandler.tabQuery({ currentWindow: true, active: true }))[0];
    });
}
export function getCurrentWindowTabs() {
    return firefoxHandler.tabQuery({ currentWindow: true });
}
export function generateFolderID() {
    return __awaiter(this, void 0, void 0, function* () {
        var collectedFolders = 0;
        var data = yield getDataStructFromFirefox();
        return getnumberOfFoldersAlreadyExisting(data.elements);
    });
}
export function getnumberOfFoldersAlreadyExisting(folderContainer) {
    var number = 0;
    for (var key in folderContainer) {
        var item = folderContainer[key];
        if ('folderID' in item) {
            number++;
            number += getnumberOfFoldersAlreadyExisting(item.elements);
        }
    }
    return number;
}
export function getnumberOfItemsAlreadyExisting(folderContainer) {
    var number = 0;
    for (var key in folderContainer) {
        var item = folderContainer[key];
        if (item.item)
            number++;
        if (item.folder)
            number += getnumberOfFoldersAlreadyExisting(item.elements);
    }
    return number;
}
function createItemIDByTab(tab) {
    return tab.url;
}
export function tabExistsByItemID(itemID, elements) {
    var item = getItemJSONObjectByItemID(itemID, elements);
    return item != undefined && item.parentFolderID != "unordered";
}
export function tabExistsByTabID(tabID, elements) {
    var item = getItemJSONObjectByTabID(tabID, elements);
    return item != undefined && item.parentFolderID != "unordered";
}
export function folderExists(folderID, elements) {
    var returnVal = undefined;
    for (var key in elements) {
        var item = elements[key];
        if (item.folder) {
            if (item.folderID == folderID) {
                return item;
            }
            else
                returnVal = folderExists(folderID, item.elements);
            if (returnVal != undefined)
                return returnVal;
        }
    }
}
//# sourceMappingURL=dataHandler.js.map