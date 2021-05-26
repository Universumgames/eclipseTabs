import { FirefoxBookmarksRoot, folderData, itemData, tabStructData } from "../interfaces.js"
import { addFolder, addTabSync } from "./adder.js"
import { getDataStructFromFirefox, getFolderJSONObjectByID, saveDataInFirefox } from "./getter.js"
import * as defs from "./definitions.js"
import { closeTab, createTab, focusTab, getCurrentTab, getTabByTabID, getTabByURL, pinTab } from "../tabHelper.js"
import { isFolder } from "../helper.js"
import { folderExists, tabExistsByItemID } from "./checker.js"

export async function importData(json: string, overwrite: boolean = false) {
    var data = await getDataStructFromFirefox()
    var pinnedOld = getFolderJSONObjectByID(defs.pinnedFolderID, data.rootFolder)
    pinnedOld.open = false
    await saveDataInFirefox(data)
    var jsonData = JSON.parse(json) as tabStructData
    var pinned = getFolderJSONObjectByID(defs.pinnedFolderID, jsonData.rootFolder)
    if (pinned != undefined) {
        for (var element of pinned.elements) {
            if (element == undefined) continue
            var tab = element as itemData
            if (tab.url.startsWith("about")) continue
            var fireTab = await getTabByURL(tab.url)
            if (fireTab != undefined) {
                await pinTab(fireTab.id)
            } else {
                fireTab = await createTab(tab.url)
                //while (fireTab == undefined) fireTab = await getTabByTabID()
                if (fireTab != undefined) await pinTab(fireTab.id)
            }
        }
    }
    var unordered = getFolderJSONObjectByID(defs.unorderedFolderID, jsonData.rootFolder)
    if (unordered != undefined) {
        for (var element of unordered.elements) {
            var tab = element as itemData
            var fireTab = await getTabByURL(tab.url)
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

function importFolder(old: tabStructData, toImport: folderData): tabStructData {
    var parent = getFolderJSONObjectByID(toImport.folderID, old.rootFolder)
    for (var element of toImport.elements) {
        if ("itemID" in element) {
            parent.elements.push(element as itemData)
        } else {
            var folder = element as folderData
            var exists = folderExists(folder.folderID, old.rootFolder.elements)
            if (!exists) parent.elements.push(folder)
            else {
                importFolder(old, folder)
            }
        }
    }
    return old
}

export async function importBookmarks(bookmarks: FirefoxBookmarksRoot) {
    var data = await getDataStructFromFirefox()
    var bookmarksFolder = getFolderJSONObjectByID(defs.bookmarksID, data.rootFolder)
    if (bookmarksFolder == undefined) {
        bookmarksFolder = await addFolder(data.rootFolder.folderID, defs.bookmarksID, "Bookmarks", data)
        bookmarksFolder.open = false
    }
    for (var folderKey in bookmarks.children) {
        await importBookmarkFolder(bookmarks.children[folderKey], bookmarksFolder, data)
    }
    await saveDataInFirefox(data)
}

async function importBookmarkFolder(firefoxBookmarkFolder: any, parentFolder: folderData, data: tabStructData) {
    var folder = getFolderJSONObjectByID(firefoxBookmarkFolder.id, parentFolder)
    if (folder == undefined) {
        folder = await addFolder(parentFolder.folderID, firefoxBookmarkFolder.id, firefoxBookmarkFolder.title, data)
        folder.open = false
    }
    for (var childKey in firefoxBookmarkFolder.children) {
        var child = firefoxBookmarkFolder.children[childKey]
        if (child.children != undefined) await importBookmarkFolder(child, folder, data)
        else await importBookmark(child, folder, data)
    }
}

async function importBookmark(firefoxBookmark: { title: string; url: string; id: string }, parentFolder: folderData, data: tabStructData) {
    var bm = firefoxBookmark
    var item = addTabSync(
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
