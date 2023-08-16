import { rootFolderID } from "../definitions";
import { ElementData, FolderData, ItemData } from "../elementData";
import { itemIDType } from "../interfaces";
import { TabStructData } from "../tabStructData";

export function collapseAll(this: FolderData) {
    this.elements.forEach(element => {
        if (element instanceof FolderData) collapseAll.call(element);
    });
    this.open = false;
}

export function expandAll(this: FolderData) {
    this.elements.forEach(element => {
        if (element instanceof FolderData) expandAll.call(element);
    });
    this.open = true;
}

export function toggleAll(this: FolderData) {
    if (this.open) collapseAll.call(this);
    else expandAll.call(this);
}

export function revealElement(this: TabStructData, element: ElementData) {
    let currentParentID = element.parentFolderID;
    const parentList: FolderData[] = [];
    while (currentParentID != rootFolderID) {
        const parent = this.findFolderByID(currentParentID);
        if (parent == null) break;
        parentList.push(parent);
        currentParentID = parent.parentFolderID;
    }
    parentList.reverse().forEach(parent => {
        parent.open = true;
    });
}

export function moveElement(this: TabStructData, toMove: ElementData, newParent: FolderData): boolean {
    const oldParent = this.findFolderByID(toMove.parentFolderID);
    if (oldParent == null) return false;
    this.removeElement(toMove, toMove.parentFolderID);
    newParent.addElement(toMove);
    toMove.parentFolderID = newParent.folderID;
    return true;
}

export function validateFavIconCache(this: TabStructData) {
    const favIcons = this.favIconStorage;
    for (const key in favIcons) {
        const refs = getRefsToUrl(this.rootFolder, key);
        if (refs.length == 0) delete favIcons[key];
        else favIcons[key].refBy = refs;
    }
}

function getRefsToUrl(folder: FolderData, url: string): itemIDType[] {
    const refs: string[] = [];
    folder.elements.forEach(element => {
        if (element instanceof FolderData) {
            refs.push(...getRefsToUrl(element, url));
        } else if (element instanceof ItemData && element.url.includes(url)) {
            refs.push(element.itemID);
        }
    });
    return refs;
}

export function sort(this: TabStructData) {
    selectionSortRecursive.call(this, this.rootFolder);
}

function selectionSortRecursive(this: TabStructData, folder: FolderData) {
    folder.elements.sort(compareItems);
    folder.elements.forEach(element => {
        if (element instanceof FolderData) selectionSortRecursive.call(this, element);
    });
}

function compareItems(a: ElementData, b: ElementData): number {
    return a.index - b.index;
}