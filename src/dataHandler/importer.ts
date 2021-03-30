import { FirefoxBookmarksRoot, folderData, tabStructData } from "../interfaces.js"
import { addFolder, addTabSync } from "./adder.js"
import { getDataStructFromFirefox, getFolderJSONObjectByID, saveDataInFirefox } from "./getter.js"
import * as defs from "./definitions.js"
import { closeTab, createTab, focusTab, getCurrentTab } from "../tabHelper.js"

export async function importData(json: string) {
    var jsonData = JSON.parse(json)
    await saveDataInFirefox(jsonData as tabStructData)
}

export async function importBookmarks(bookmarks: FirefoxBookmarksRoot) {
    var data = await getDataStructFromFirefox()
    var bookmarksFolder = getFolderJSONObjectByID(defs.bookmarksID, data.rootFolder)
    if (bookmarksFolder == undefined) {
        bookmarksFolder = await addFolder(data.rootFolder.folderID, defs.bookmarksID, "Bookmarks", data)
        bookmarksFolder.open = false
    }
    for (var folderKey in bookmarks.children) {
        await importFolder(bookmarks.children[folderKey], bookmarksFolder, data)
    }
    await saveDataInFirefox(data)
}

async function importFolder(firefoxBookmarkFolder: any, parentFolder: folderData, data: tabStructData) {
    var folder = getFolderJSONObjectByID(firefoxBookmarkFolder.id, parentFolder)
    if (folder == undefined) {
        folder = await addFolder(parentFolder.folderID, firefoxBookmarkFolder.id, firefoxBookmarkFolder.title, data)
        folder.open = false
    }
    for (var childKey in firefoxBookmarkFolder.children) {
        var child = firefoxBookmarkFolder.children[childKey]
        if (child.children != undefined) await importFolder(child, folder, data)
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
