import { unorderedFolderID } from "./definitions.js";
import { getItemJSONObjectByItemID, getItemJSONObjectByTabID } from "./getter.js";
export function tabExistsByItemID(itemID, elements) {
    var item = getItemJSONObjectByItemID(itemID, elements);
    return item != undefined && item.parentFolderID != unorderedFolderID;
}
export function tabExistsByTabID(tabID, elements) {
    var item = getItemJSONObjectByTabID(tabID, elements);
    return item != undefined && item.parentFolderID != unorderedFolderID;
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
//# sourceMappingURL=checker.js.map