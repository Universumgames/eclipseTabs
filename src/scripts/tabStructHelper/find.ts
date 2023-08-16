import { ElementData, FolderData, IItemData, ItemData } from "../elementData";
import { folderIDType } from "../interfaces";
import { TabStructData } from "../tabStructData";

export function findFolderByID(this: TabStructData, folderID: folderIDType): FolderData | undefined {
    return findFolderByIDRecursive.call(this.rootFolder, folderID);
}

export function findFolderByIDRecursive(this: FolderData, folderID: folderIDType): FolderData | undefined {
    if (this.folderID === folderID) {
        return this;
    }
    for (const element of this.elements) {
        if (element instanceof FolderData) {
            const folder = findFolderByIDRecursive.call(element, folderID);
            if (folder) {
                return folder;
            }
        }
    }
    return undefined;
}

export function findItemByID(this: TabStructData, itemID: string): ItemData | undefined {
    return findItemByIDRecursive.call(this.rootFolder, itemID);
}

export function findItemByIDRecursive(this: FolderData, itemID: string): ItemData | undefined {
    for (const element of this.elements) {
        if (element instanceof FolderData) {
            const item = findItemByIDRecursive.call(element, itemID);
            if (item) {
                return item;
            }
        } else if ((element as ItemData).itemID === itemID) {
            return element as ItemData;
        }
    }
    return undefined;
}

export function findFolderByIDImmediate(this: FolderData, folderID: folderIDType): FolderData | undefined {
    return this.elements.find(element => element instanceof FolderData && element.folderID === folderID) as FolderData | undefined;
}

export function findItemByIDImmediate(this: FolderData, itemID: string): ItemData | undefined {
    return this.elements.find(element => element instanceof ItemData && element.itemID === itemID) as ItemData | undefined;
}

export function search(this: TabStructData, search: RegExp): ElementData[] {
    return searchRecursive.call(this.rootFolder, search);
}

export function searchRecursive(this: FolderData, search: RegExp): ElementData[] {
    const results: ElementData[] = [];
    if (search.test(this.name) || search.test(this.folderID)) results.push(this);
    for (const element of this.elements) {
        if (element instanceof FolderData) {
            results.push(...searchRecursive.call(element, search));
        } else if (element instanceof ItemData && (search.test(element.title) || search.test(element.itemID) || search.test(element.url))) {
            results.push(element);
        }
    }
    return results;
}

export function findUnusedItemID(this: TabStructData, url: string): string {
    let itemID = "0";
    let i = 1;
    while (this.findItemByID(itemID)) {
        itemID = itemID + i;
        i++;
    }
    return itemID;
}

export function containsElement(this: FolderData, element: ElementData): boolean {
    return this.elements.includes(element) || this.elements.some(e => e instanceof FolderData && containsElement.call(e, element));
}

export function getNumberOfOpenTabs(this: FolderData): number {
    let num = 0;
    for (const element of this.elements) {
        if (element instanceof FolderData) {
            num += getNumberOfOpenTabs.call(element);
        } else if (element instanceof ItemData && element.tabExists && element.tabID !== "-1") {
            num++;
        }
    }
    return num;
}

export function findItemByTabID(this: TabStructData, tabID: number): ItemData | undefined {
    return findItemByTabIDRecursive.call(this.rootFolder, tabID);
}

export function findItemByTabIDRecursive(this: FolderData, tabID: number): ItemData | undefined {
    for (const element of this.elements) {
        if (element instanceof FolderData) {
            const item = findItemByTabIDRecursive.call(element, tabID);
            if (item)
                return item;
        } else if ((element as ItemData).tabID === tabID.toString()) {
            return element as ItemData;
        }
    }
    return undefined;
}