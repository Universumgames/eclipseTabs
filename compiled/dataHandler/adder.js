var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ColorScheme, Mode } from "../interfaces.js";
import { getDataStructFromFirefox, getFolderJSONObjectByID, saveDataInFirefox } from "./getter.js";
export function createEmptyData() {
    return { elements: [], folderID: "-1", name: "root", open: true, parentFolderID: "-1", index: 0, mode: Mode.Default, colorScheme: ColorScheme.dark };
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
            parentFolderID: parentID,
            index: generateIndexInFolder(parentFolder)
        };
        parentFolder.elements.push(folder);
        yield saveDataInFirefox(data);
        return folder;
    });
}
export function addTabSync(folder, title, url, favIconURL, tabExists, tabID, itemID, hidden) {
    var storedTab = {
        hidden: hidden,
        tabExists: tabExists,
        tabID: tabID,
        itemID: itemID,
        url: url,
        favIconURL: favIconURL,
        title: title,
        parentFolderID: folder.folderID,
        index: generateIndexInFolder(folder)
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
export function createItemIDByTab(tab) {
    return tab.url;
}
export function generateIndexInFolder(folder) {
    return folder.elements.length;
}
//# sourceMappingURL=adder.js.map