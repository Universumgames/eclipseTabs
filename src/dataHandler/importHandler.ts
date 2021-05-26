import { getBookmarks } from "../firefoxHandler.js"
import { FirefoxBookmarksRoot, tabStructData } from "../interfaces.js"
import { closeTab, getCurrentTab } from "../tabHelper.js"
import { saveDataInFirefox } from "./getter.js"
import { importBookmarks, importData } from "./importer.js"

document.addEventListener("DOMContentLoaded", () => setup())

var jsonReplaceBtn: any
var jsonCombineBtn: any
var bookmarkImportBtn: any

function setup() {
    jsonReplaceBtn = document.getElementById("inputJSONReplace")
    jsonReplaceBtn.onclick = onClickReplace
    jsonCombineBtn = document.getElementById("inputJSONCombine")
    jsonCombineBtn.onclick = onClickCombine

    bookmarkImportBtn = document.getElementById("inputBookmarkImport")
    bookmarkImportBtn.onclick = onBookmarkClick
}

function onClickReplace(event: any) {
    var json = document.getElementById("jsonInput") as any
    var text: string = json.value
    importData(text, true)
}

function onClickCombine(event: any) {
    var json = document.getElementById("jsonInput") as any
    var text: string = json.value
    importData(text)
}

async function onBookmarkClick(event: any) {
    importBookmarks(await getBookmarks())
}
