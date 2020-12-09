var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as firefoxHandler from '../firefoxHandler.js';
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
export function getKeyByIDAndType(elements, isFolder, id) {
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
        return getNumberOfFoldersAlreadyExisting(data.elements);
    });
}
export function getNumberOfFoldersAlreadyExisting(folderContainer) {
    var number = 0;
    for (var key in folderContainer) {
        var item = folderContainer[key];
        if ('folderID' in item) {
            number++;
            number += getNumberOfFoldersAlreadyExisting(item.elements);
        }
    }
    return number;
}
export function getNumberOfItemsAlreadyExisting(folderContainer) {
    var number = 0;
    for (var key in folderContainer) {
        var item = folderContainer[key];
        if (item.item)
            number++;
        if (item.folder)
            number += getNumberOfFoldersAlreadyExisting(item.elements);
    }
    return number;
}
//# sourceMappingURL=getter.js.map