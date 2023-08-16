import { Mode, ColorScheme } from "./interfaces";
import { ElementData, FolderData, IFolderData, StoredFavIcon } from "./elementData";
import { bookmarksID, pinnedFolderID, pinnedIndex, rootFolderID, unorderedFolderID, unorderedIndex } from "./definitions";
import { getManifest, localStorageGetTabStructData } from "./browserHandler";
import * as find from "./tabStructHelper/find";
import * as remove from "./tabStructHelper/remove";
import * as change from "./tabStructHelper/change";
import * as add from "./tabStructHelper/add";
import * as browserHandler from "./browserHandler"
import * as tabHandler from "./tabStructHelper/tab"

export interface ITabStructData {
    mode: Mode;
    rootFolder: IFolderData;
    colorScheme: ColorScheme;
    devMode: Boolean;
    closeTabsInDeletingFolder: Boolean;
    version: String;
    displayHowTo: Boolean;
    hideOrSwitchTab: Boolean;
    favIconStorage: Record<string, StoredFavIcon>;
}

export class TabStructData implements ITabStructData {
    mode: Mode;
    rootFolder: FolderData;
    colorScheme: ColorScheme;
    devMode: Boolean;
    closeTabsInDeletingFolder: Boolean;
    version: String;
    displayHowTo: Boolean;
    hideOrSwitchTab: Boolean;
    favIconStorage: Record<string, StoredFavIcon>;

    // default constructor for tabStructData with all parameters
    constructor(mode: Mode, rootFolder: FolderData, colorScheme: ColorScheme, devMode: Boolean, closeTabsInDeletingFolder: Boolean, version: String, displayHowTo: Boolean, hideOrSwitchTab: Boolean, favIconStorage: Record<string, StoredFavIcon>) {
        this.mode = mode;
        this.rootFolder = rootFolder;
        this.colorScheme = colorScheme;
        this.devMode = devMode;
        this.closeTabsInDeletingFolder = closeTabsInDeletingFolder;
        this.version = version;
        this.displayHowTo = displayHowTo;
        this.hideOrSwitchTab = hideOrSwitchTab;
        this.favIconStorage = favIconStorage;
    }

    // default constructor for tabStructData with interface as parameter
    static fromJSON(data: ITabStructData): TabStructData {
        return new TabStructData(data.mode, FolderData.fromJSON(data.rootFolder), data.colorScheme, data.devMode, data.closeTabsInDeletingFolder, data.version, data.displayHowTo, data.hideOrSwitchTab, data.favIconStorage);
    }

    static async loadFromStorage(): Promise<TabStructData> {
        return this.fromJSON(await localStorageGetTabStructData("eclipseData") || createEmptyData());
    }

    async save(): Promise<void> {
        await browserHandler.localStorageSet({ eclipseData: JSON.stringify(this) });
    }

    findFolderByID = find.findFolderByID;

    findItemByID = find.findItemByID;

    findItemByTabID = find.findItemByTabID;

    removeElement = remove.removeElement;

    revealElement = change.revealElement;

    collapseAllFolders(): void {
        this.rootFolder.collapseAll();
    }

    expandAllFolders(): void {
        this.rootFolder.expandAll();
    }

    search = find.search;

    getPinnedFolder(): FolderData {
        return this.findFolderByID(pinnedFolderID)!;
    }

    getUnorderedFolder(): FolderData {
        return this.findFolderByID(unorderedFolderID)!;
    }

    getBookmarksFolder(): FolderData {
        return this.findFolderByID(bookmarksID)!;
    }

    moveElement = change.moveElement;

    addFavIcon = add.addFavIcon;

    findUnusedItemID = find.findUnusedItemID;

    validateFavIconCache = change.validateFavIconCache;

    updateTabs = tabHandler.updateTabs;

    sort = change.sort;
}


export function createEmptyData(): TabStructData {
    const data: ITabStructData = {
        mode: Mode.Default,
        rootFolder: {
            folderID: rootFolderID,
            name: "root",
            open: true,
            parentFolderID: rootFolderID,
            index: 0,
            elements: [
                {
                    name: "Pinned",
                    open: true,
                    folderID: pinnedFolderID,
                    parentFolderID: rootFolderID,
                    elements: new Array<ElementData>(),
                    index: pinnedIndex
                } as IFolderData,
                {
                    name: "Other",
                    open: true,
                    folderID: unorderedFolderID,
                    parentFolderID: rootFolderID,
                    elements: new Array<ElementData>(),
                    index: unorderedIndex
                } as IFolderData
            ]
        },
        colorScheme: ColorScheme.dark,
        devMode: false,
        closeTabsInDeletingFolder: false,
        version: getManifest().version,
        displayHowTo: true,
        hideOrSwitchTab: false,
        favIconStorage: {}
    }
    return TabStructData.fromJSON(data);
}