var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getDataStructFromFirefox, getFolderJSONObjectByID, getItemJSONObjectByItemID, getKeyByIDAndType, saveDataInFirefox } from "./getter.js";
import * as tabHelper from '../tabHelper.js';
import { generateIndexInFolder } from "./adder.js";
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
        var item = getItemJSONObjectByItemID(itemID, data);
        var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID);
        if (oldParentFolder != undefined && newParentFolder != undefined && item != undefined && key != undefined) {
            item.parentFolderID = newParentFolderID;
            item.index = generateIndexInFolder(newParentFolder);
            newParentFolder.elements[item.index] = Object.assign({}, item);
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
            folder.index = generateIndexInFolder(newParentFolder);
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
        var item = getItemJSONObjectByItemID(itemID, data);
        var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID);
        if (oldParentFolder != undefined && item != undefined && key != undefined) {
            delete oldParentFolder.elements[key];
            yield saveDataInFirefox(data);
            return true;
        }
        return false;
    });
}
//# sourceMappingURL=changer.js.map