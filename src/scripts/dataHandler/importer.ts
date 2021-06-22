import { FirefoxBookmarksRoot, folderData, itemData, tabStructData } from "../interfaces"
import { addFolder, addTabSync } from "./adder"
import { getDataStructFromFirefox, getFolderJSONObjectByID, saveDataInFirefox } from "./getter"
import * as defs from "./definitions"
import { closeTab, createTab, focusTab, getCurrentTab, getTabByTabID, getTabByURL, pinTab } from "../tabHelper"
import { isFolder } from "../helper"
import { folderExists, tabExistsByItemID } from "./checker"

export async function importData(json: string, overwrite: boolean = false) {
    const data = await getDataStructFromFirefox()
    if (data == undefined) return
    const pinnedOld = getFolderJSONObjectByID(defs.pinnedFolderID, data.rootFolder)
    if (pinnedOld == undefined) return
    pinnedOld.open = false
    await saveDataInFirefox(data)
    const jsonData = JSON.parse(json) as tabStructData
    const pinned = getFolderJSONObjectByID(defs.pinnedFolderID, jsonData.rootFolder)
    if (pinned != undefined) {
        for (const element of pinned.elements) {
            if (element == undefined) continue
            const tab = element as itemData
            if (tab.url.startsWith("about")) continue
            let fireTab = await getTabByURL(tab.url)
            if (fireTab != undefined) {
                await pinTab(fireTab.id)
            } else {
                fireTab = await createTab(tab.url)
                //while (fireTab == undefined) fireTab = await getTabByTabID()
                if (fireTab != undefined) await pinTab(fireTab.id)
            }
        }
    }
    const unordered = getFolderJSONObjectByID(defs.unorderedFolderID, jsonData.rootFolder)
    if (unordered != undefined) {
        for (const element of unordered.elements) {
            const tab = element as itemData
            let fireTab = await getTabByURL(tab.url)
            if (fireTab == undefined) {
                fireTab = await createTab(tab.url)
                //while (fireTab == undefined) fireTab = await getTabByTabID()
                console.log("Imported Unordered Tab: ", fireTab)
            }
        }
    }
    if (overwrite) {
        console.warn("Replacing data, old data for recovery: ", data)
        //setTimeout(2000)
        await saveDataInFirefox(jsonData)
        await saveDataInFirefox(jsonData)

        await saveDataInFirefox(jsonData)
    } else {
        data.closeTabsInDeletingFolder = jsonData.closeTabsInDeletingFolder
        data.colorScheme = jsonData.colorScheme
        data.devMode = jsonData.devMode
        data.displayHowTo = jsonData.displayHowTo
        data.hideOrSwitchTab = jsonData.hideOrSwitchTab
        data.mode = jsonData.mode
        data.version = jsonData.version
        await saveDataInFirefox(importFolder(data, jsonData.rootFolder))
        console.log("Combined data")
    }
}

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
