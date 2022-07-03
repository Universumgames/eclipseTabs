import { elementData } from "./../interfaces"
import { FirefoxBookmarksRoot, folderData, itemData, tabStructData } from "../interfaces"
import { addFolder, addTabSync } from "./adder"
import { getDataStructFromFirefox, getFolderJSONObjectByID, getItemJSONObjectByItemID, saveDataInFirefox } from "./getter"
import * as defs from "./definitions"
import { closeTab, createTab, focusTab, getCurrentTab, getTabByTabID, getTabByURL, getTabByURLDirect, getTabs, pinTab } from "../tabHelper"
import { reloadExtension } from "../helper"
import { folderExists, tabExistsByItemID } from "./checker"
import { upgradeHandler } from "../eclipseHandler"

export async function importData(
    json: string,
    settings: { overwrite: boolean; testRun: boolean; openTabs: boolean } = { overwrite: false, testRun: false, openTabs: true }
) {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    const pinnedOld = getFolderJSONObjectByID(defs.pinnedFolderID, data.rootFolder)
    if (pinnedOld == undefined) return
    pinnedOld.open = false
    //await saveDataInFirefox(data)
    const newJSONData = JSON.parse(json)
    console.log(newJSONData)

    //if an item is inside of the root element application breaks...
    for (const key in newJSONData.rootFolder.elements) {
        const element = newJSONData.rootFolder.elements[key]
        if (!("folderID" in element)) {
            // console.log("deleted element from root folder", element)
            newJSONData.rootFolder.elements.splice(newJSONData.rootFolder.elements.indexOf(element), 1)
        }
    }

    upgradeHandler(newJSONData)
    console.log("Upgraded data", newJSONData)

    let toSave: tabStructData

    //when overwriting old data
    if (settings.overwrite) {
        console.warn("Replacing data, old data for recovery: ", data)
        toSave = Object.assign({}, newJSONData)

        console.log("new Data:", toSave)
    } else {
        //copying new settings values
        data.closeTabsInDeletingFolder = newJSONData.closeTabsInDeletingFolder
        data.colorScheme = newJSONData.colorScheme
        data.devMode = newJSONData.devMode
        data.displayHowTo = newJSONData.displayHowTo
        data.hideOrSwitchTab = newJSONData.hideOrSwitchTab
        data.mode = newJSONData.mode
        data.version = newJSONData.version
        Object.assign(data.favIconStorage, newJSONData.favIconStorage)
        importStructData(data, newJSONData)
        toSave = Object.assign({}, data)
        console.log("Combined data", data)
    }

    if (settings.openTabs) {
        //reopening pinned tabs
        const pinned = getFolderJSONObjectByID(defs.pinnedFolderID, newJSONData.rootFolder)
        if (pinned != undefined) {
            const tabs = await getTabs()
            for (const element of pinned.elements) {
                if (element == undefined) continue
                const tab = element as itemData
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
        const unordered = getFolderJSONObjectByID(defs.unorderedFolderID, newJSONData.rootFolder)
        if (unordered != undefined) {
            const tabs = await getTabs()

            for (const element of unordered.elements) {
                const tab = element as itemData
                let fireTab = getTabByURLDirect(tab.url, tabs)
                if (fireTab == undefined) {
                    fireTab = await createTab(tab.url)
                    //while (fireTab == undefined) fireTab = await getTabByTabID()
                    console.log("Imported Unordered Tab: ", fireTab)
                }
            }
        }
    }

    setTimeout(() => {
        if (!settings.testRun) saveDataInFirefox(toSave)
        else console.log("Test run, not saving data", toSave)

        console.log("saved", toSave)
        // reloadExtension()
    }, 3000)
}

function importStructData(oldData: tabStructData, toImport: tabStructData) {
    importFolderRec(oldData.rootFolder, toImport.rootFolder)
}

function importFolderRec(storedFolder: folderData, importFolder: folderData) {
    if (storedFolder == undefined) {
        console.warn("Folder to import to is undefined")
        return
    }
    for (const importElement of importFolder.elements) {
        if ("itemID" in importElement) {
            const importItem = importElement as itemData
            if (getItemJSONObjectByItemID(importItem.itemID, storedFolder) == undefined) storedFolder.elements.push(importElement)
        } else if ("folderID" in importElement) {
            const importFolder2 = importElement as folderData
            const stored = getFolderJSONObjectByID(importFolder2.folderID, storedFolder)
            if (stored == undefined) storedFolder.elements.push(importFolder2)
            else importFolderRec(stored, importFolder2)
        }
    }
}

/**
 * @deprecated
 * @param old
 * @param toImport
 * @returns
 */
function importFolder(old: tabStructData, toImport: folderData): tabStructData | undefined {
    const parent = getFolderJSONObjectByID(toImport.folderID, old.rootFolder)
    if (parent == undefined) return undefined
    for (const element of toImport.elements) {
        if ("itemID" in element) {
            parent.elements.push(element as itemData)
        } else {
            const folder = element as folderData
            const exists = folderExists(folder.folderID, old.rootFolder.elements)
            if (!exists) parent.elements.push(folder)
            else {
                importFolder(old, folder)
            }
        }
    }
    return old
}

export async function importBookmarks(bookmarks: FirefoxBookmarksRoot) {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    let bookmarksFolder = getFolderJSONObjectByID(defs.bookmarksID, data.rootFolder)
    if (bookmarksFolder == undefined) {
        bookmarksFolder = await addFolder(data.rootFolder.folderID, defs.bookmarksID, "Bookmarks", data)
        bookmarksFolder!.open = false
    }
    for (const folderKey in bookmarks.children) {
        await importBookmarkFolder(bookmarks.children[folderKey], bookmarksFolder!, data)
    }
    await saveDataInFirefox(data)
}

async function importBookmarkFolder(firefoxBookmarkFolder: any, parentFolder: folderData, data: tabStructData) {
    let folder = getFolderJSONObjectByID(firefoxBookmarkFolder.id, parentFolder)
    if (folder == undefined) {
        folder = await addFolder(parentFolder.folderID, firefoxBookmarkFolder.id, firefoxBookmarkFolder.title, data)
        folder!.open = false
    }
    for (const childKey in firefoxBookmarkFolder.children) {
        const child = firefoxBookmarkFolder.children[childKey]
        if (child.children != undefined) await importBookmarkFolder(child, folder!, data)
        else await importBookmark(child, folder!, data)
    }
}

async function importBookmark(firefoxBookmark: { title: string; url: string; id: string }, parentFolder: folderData, data: tabStructData) {
    const bm = firefoxBookmark
    const item = addTabSync(
        data,
        parentFolder,
        bm.title,
        bm.url,
        //"http://" + bm.url.replace("https://", "").replace("http://", "").split("/")[0] + "/favicon.ico",
        "",
        false,
        "-1",
        bm.id,
        true
    )
}
