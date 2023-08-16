import { folderIDType, tabIDType, itemIDType } from "./interfaces";
import * as find from "./tabStructHelper/find";
import * as add from "./tabStructHelper/add";
import * as remove from "./tabStructHelper/remove";
import * as check from "./tabStructHelper/check";
import * as change from "./tabStructHelper/change";
import { TabStructData } from "./tabStructData";

export interface IElementData {
    parentFolderID: string;
    index: number;
}

export type StoredFavIcon = {
    key: string;
    imageSrc: string;
    refBy: Array<string>;
}

export interface IFolderData extends IElementData {
    name: string;
    open: Boolean;
    folderID: folderIDType;
    elements: Array<IElementData>;
}

export interface IItemData extends IElementData {
    url: string;
    tabID: tabIDType;
    itemID: itemIDType;
    hidden: Boolean;
    tabExists: Boolean;
    title: string;
}

enum ElementType {
    Folder = "folder",
    Item = "item"
}

export abstract class ElementData implements IElementData {
    parentFolderID: string;
    index: number;
    // parentTabStructData: TabStructData;

    constructor(parentFolderID: string, index: number) {
        this.parentFolderID = parentFolderID;
        this.index = index;
        // this.parentTabStructData = parentTabStructData;
    }

    abstract get isFolder(): Boolean

    abstract get isItem(): Boolean

    static fromJSON(json: IElementData): ItemData | FolderData {
        if ("itemID" in json) {
            return ItemData.fromJSON(json as IItemData);
        }
        else {
            return FolderData.fromJSON(json as IFolderData);
        }
    }
}

export class ItemData extends ElementData implements IItemData {
    url: string;
    tabID: string;
    itemID: string;
    hidden: Boolean;
    tabExists: Boolean;
    title: string;

    constructor(parentFolderID: string, index: number, url: string, tabID: string, itemID: string, hidden: Boolean, tabExists: Boolean, title: string) {
        super(parentFolderID, index);
        this.url = url;
        this.tabID = tabID;
        this.itemID = itemID;
        this.hidden = hidden;
        this.tabExists = tabExists;
        this.title = title;
    }

    static fromJSON(json: IItemData): ItemData {
        return new ItemData(json.parentFolderID, json.index, json.url, json.tabID, json.itemID, json.hidden, json.tabExists, json.title);
    }

    get isFolder(): Boolean {
        return false;
    }

    get isItem(): Boolean {
        return true;
    }

}

export class FolderData extends ElementData implements IFolderData {
    name: string;
    open: Boolean;
    folderID: string;
    elements: Array<ElementData>;

    constructor(parentFolderID: string, index: number, name: string, open: Boolean, folderID: string, elements: Array<ElementData>) {
        super(parentFolderID, index);
        this.name = name;
        this.open = open;
        this.folderID = folderID;
        this.elements = elements;
    }

    static fromJSON(json: IFolderData): FolderData {
        return new FolderData(json.parentFolderID, json.index, json.name, json.open, json.folderID, json.elements.map((element) => ElementData.fromJSON(element)));
    }

    get isFolder(): Boolean {
        return true;
    }

    get isItem(): Boolean {
        return false;
    }

    addElement = add.addElement;

    removeItemByID = remove.removeItemByID;

    removeFolderByID = remove.removeFolderByID;

    findFolderByID = find.findFolderByIDRecursive;

    findItemByID = find.findItemByIDRecursive

    findFolderByIDImmediate = find.findFolderByIDImmediate;

    findItemByIDImmediate = find.findItemByIDImmediate;

    folderExistsByID = check.folderExistsByID;

    collapseAll = change.collapseAll;

    expandAll = change.expandAll;

    toggleAll = change.toggleAll;

    private newElementID = add.newElementID;

    createFolder = add.createFolder;

    addTab = add.addTab;

    addFirefoxTab = add.addFirefoxTab;

    containsElement = find.containsElement;

    getNumberOfOpenTabs = find.getNumberOfOpenTabs;
}
