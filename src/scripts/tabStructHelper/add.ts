import { eclipseStore } from "@/store";
import { ElementData, FolderData, ItemData, StoredFavIcon } from "../elementData";
import { getHostname } from "../helper";
import { FirefoxTab, itemIDType } from "../interfaces";
import { TabStructData } from "../tabStructData";
import { v4 as v4 } from 'uuid';

export function addElement(this: FolderData, element: ElementData) {
    this.elements.push(element);
}

export function newElementID(this: FolderData): string {
    return v4();
}

export function createFolder(this: FolderData, name: string): FolderData {
    const folder = new FolderData(this.folderID, this.elements.length, name, true, newElementID.call(this), []);
    this.addElement(folder);
    return folder;
}

export function addTab(this: FolderData, favIconAdd: (itemID: itemIDType, url: string, favIcon: string) => void, title: string, url: string, favIcon: string, tabExists: boolean = false, tabID: number = -1, hidden: boolean = false) {
    const tabIDS = tabID.toString();
    const itemID = newElementID.call(this);
    const item = new ItemData(this.folderID, this.elements.length, url, tabIDS, itemID, hidden, tabExists, title);
    favIconAdd(itemID, url, favIcon);
    //eclipseStore().state.eclipseData//.addFavIcon(itemID, url, favIcon);
    this.addElement(item);
    return item;
}

export function addFirefoxTab(this: FolderData, favIconAdd: (itemID: itemIDType, url: string, favIcon: string) => void, tab: FirefoxTab) {
    return addTab.call(this, favIconAdd, tab.title, tab.url, tab.favIconUrl, true, tab.id, tab.hidden);
}

export function addFavIcon(this: TabStructData, itemID: itemIDType, url: string, favIcon: string) {
    const fav = this.favIconStorage[getHostname(url)]
    if (fav != undefined) {
        if (fav.refBy.find(objA => objA == itemID) == undefined) fav.refBy.push(itemID)
        if (favIcon == undefined || favIcon == "" || favIcon.includes("<!DOCTYPE html>")) return true
        fav.imageSrc = favIcon
        return true
    } else {
        if (favIcon == undefined || favIcon == "" || favIcon.includes("<!DOCTYPE html>")) return false
        this.favIconStorage[getHostname(url)] = { key: getHostname(url), imageSrc: favIcon, refBy: [itemID] } as StoredFavIcon
        return true
    }
}