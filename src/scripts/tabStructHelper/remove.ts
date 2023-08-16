import { ElementData, FolderData, ItemData } from "../elementData";
import { folderIDType, itemIDType } from "../interfaces";
import { TabStructData } from "../tabStructData";

export function removeItemByID(this: FolderData, itemID: itemIDType): Boolean {
    const index = this.elements.findIndex(element => element instanceof ItemData && element.itemID === itemID);
    if (index === -1) return false;
    this.elements.splice(index, 1);
    return true;
}

export function removeFolderByID(this: FolderData, folderID: itemIDType): Boolean {
    const index = this.elements.findIndex(element => element instanceof FolderData && element.folderID === folderID);
    if (index === -1) return false;
    this.elements.splice(index, 1);
    return true;
}

export function removeElement(this: TabStructData, element: ElementData, parentFolderID: folderIDType): Boolean {
    const parentFolder = this.findFolderByID(parentFolderID);
    if (!parentFolder) return false;
    if (element instanceof ItemData) return parentFolder.removeItemByID(element.itemID);
    if (element instanceof FolderData) return parentFolder.removeFolderByID(element.folderID);
    return false;
}