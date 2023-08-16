import { ElementData, IFolderData } from "./elementData"
import { FirefoxBookmarksRoot, itemIDType } from "./interfaces"
import { FolderData, ItemData } from "./elementData"
import { TabStructData } from "./tabStructData"
import * as defs from "./definitions"
import { closeTab, createTab, focusTab, getCurrentTab, getTabByTabID, getTabByURL, getTabByURLDirect, getTabs, pinTab } from "./tabHelper"
import { reloadExtension } from "./helper"
import { upgradeHandler } from "./eclipseHandler"
import { newElementID } from "./tabStructHelper/add"

export async function importData(
    json: string,
    settings: { overwrite: boolean; testRun: boolean; openTabs: boolean } = { overwrite: false, testRun: false, openTabs: true }
) {
    const data = await TabStructData.loadFromStorage()
    if (data == undefined) return
    const pinnedOld = data.getPinnedFolder()
    if (pinnedOld == undefined) return
    pinnedOld.open = false
    //await saveDataInFirefox(data)
    const importTabStructData = TabStructData.fromJSON(JSON.parse(json))
    console.log(importTabStructData)

    //if an item is inside of the root element application breaks...
    for (const key in importTabStructData.rootFolder.elements) {
        const element = importTabStructData.rootFolder.elements[key]
        if (!("folderID" in element)) {
            // console.log("deleted element from root folder", element)
            importTabStructData.rootFolder.elements.splice(importTabStructData.rootFolder.elements.indexOf(element), 1)
        }
    }

    upgradeHandler(importTabStructData)
    console.log("Upgraded data", importTabStructData)

    let toSave: TabStructData

    //when overwriting old data
    if (settings.overwrite) {
        console.warn("Replacing data, old data for recovery: ", data)
        toSave = importTabStructData

        console.log("new Data:", toSave)
    } else {
        //copying new settings values
        data.closeTabsInDeletingFolder = importTabStructData.closeTabsInDeletingFolder
        data.colorScheme = importTabStructData.colorScheme
        data.devMode = importTabStructData.devMode
        data.displayHowTo = importTabStructData.displayHowTo
        data.hideOrSwitchTab = importTabStructData.hideOrSwitchTab
        data.mode = importTabStructData.mode
        data.version = importTabStructData.version
        for (const key in importTabStructData.favIconStorage) {
            const element = importTabStructData.favIconStorage[key]
            data.favIconStorage[key] = element
        }
        importStructData(data, importTabStructData)
        toSave = data
        console.log("Combined data", data)
    }

    await toSave.save()

    if (settings.openTabs) {
        //reopening pinned tabs
        const pinned = importTabStructData.getPinnedFolder()
        if (pinned != undefined) {
            const tabs = await getTabs()
            for (const element of pinned.elements) {
                if (element == undefined) continue
                const tab = element as ItemData
                if (tab.url.startsWith("about")) continue
                let fireTab = getTabByURLDirect(tab.url, tabs)
                if (fireTab != undefined) {
                    await pinTab(fireTab.id)
                } else {
                    fireTab = await createTab(tab.url)
                    if (fireTab != undefined) await pinTab(fireTab.id)
                }
            }
        }

        //reopening other tabs
        const unordered = importTabStructData.getUnorderedFolder()
        if (unordered != undefined) {
            const tabs = await getTabs()

            for (const element of unordered.elements) {
                const tab = element as ItemData
                let fireTab = getTabByURLDirect(tab.url, tabs)
                if (fireTab == undefined) {
                    fireTab = await createTab(tab.url)
                    //while (fireTab == undefined) fireTab = await getTabByTabID()
                    console.log("Imported Unordered Tab: ", fireTab)
                }
            }
        }
    }

    setTimeout(async () => {
        if (!settings.testRun) await toSave.save()
        else console.log("Test run, not saving data", toSave)

        console.log("saved", toSave)
        reloadExtension()
    }, 300)
}

function importStructData(oldData: TabStructData, toImport: TabStructData) {
    importFolderRec(oldData.rootFolder, toImport.rootFolder)
}

function importFolderRec(storedFolder: FolderData, importFolder: FolderData) {
    if (storedFolder == undefined) {
        console.warn("Folder to import to is undefined")
        return
    }
    for (const importElement of importFolder.elements) {
        if (importElement instanceof ItemData) {
            const importItem = importElement
            if (storedFolder.findItemByID(importItem.itemID) == undefined) storedFolder.addElement(importElement)
        } else if ("folderID" in importElement) {
            const importSubFolder = importElement as FolderData
            const stored = storedFolder.findFolderByID(importSubFolder.folderID)
            if (stored == undefined) storedFolder.addElement(importSubFolder)
            else importFolderRec(stored, importSubFolder)
        }
    }
}

/**
 * @deprecated
 * @param old
 * @param toImport
 * @returns
 */
function importFolder(old: TabStructData, toImport: FolderData): TabStructData | undefined {
    const parent = old.findFolderByID(toImport.parentFolderID)
    if (parent == undefined) return undefined
    for (const element of toImport.elements) {
        if ("itemID" in element) {
            parent.elements.push(element as ItemData)
        } else {
            const folder = element as FolderData
            const exists = old.findFolderByID(folder.folderID) != undefined
            if (!exists) parent.elements.push(folder)
            else {
                importFolder(old, folder)
            }
        }
    }
    return old
}

export async function importBookmarks(bookmarks: FirefoxBookmarksRoot) {
    const data = await TabStructData.loadFromStorage()
    if (data == undefined) return
    let bookmarksFolder = data.getBookmarksFolder()
    if (bookmarksFolder == undefined) {
        bookmarksFolder = data.rootFolder.createFolder("Bookmarks")
        bookmarksFolder.folderID = defs.bookmarksID
        bookmarksFolder!.open = false
    }
    for (const folderKey in bookmarks.children) {
        await importBookmarkFolder(bookmarks.children[folderKey], bookmarksFolder!, data)
    }
    await data.save()
}

async function importBookmarkFolder(firefoxBookmarkFolder: any, parentFolder: FolderData, data: TabStructData) {
    let folder = parentFolder.findFolderByID(firefoxBookmarkFolder.id)
    if (folder == undefined) {
        folder = parentFolder.createFolder(firefoxBookmarkFolder.title)
        folder.folderID = firefoxBookmarkFolder.id
        folder!.open = false
    }
    for (const childKey in firefoxBookmarkFolder.children) {
        const child = firefoxBookmarkFolder.children[childKey]
        if (child.children != undefined) await importBookmarkFolder(child, folder!, data)
        else await importBookmark(child, folder!, data)
    }
}

async function importBookmark(firefoxBookmark: { title: string; url: string; id: string }, parentFolder: FolderData, data: TabStructData) {
    const bm = firefoxBookmark
    const item = parentFolder.addTab((itemID: itemIDType, url: string, favIcon: string) => { data.addFavIcon(itemID, url, favIcon) }, bm.title, bm.url, "")
}
