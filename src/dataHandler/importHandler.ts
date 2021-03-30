import { getBookmarks } from "../firefoxHandler.js"
import { FirefoxBookmarksRoot, tabStructData } from "../interfaces.js"
import { closeTab, getCurrentTab } from "../tabHelper.js"
import { saveDataInFirefox } from "./getter.js"
import { importBookmarks, importData } from "./importer.js"

document.addEventListener("DOMContentLoaded", () => setup())

var jsonImportBtn: any
var bookmarkImportBtn: any

function setup() {
    jsonImportBtn = document.getElementById("inputJSONSubmit")
    jsonImportBtn.onclick = onClickButton

    bookmarkImportBtn = document.getElementById("inputBookmarkImport")
    bookmarkImportBtn.onclick = onBookmarkClick
}

function onClickButton(event: any) {
    var json = document.getElementById("jsonInput") as any
    var text: string = json.value
    importData(text)
}

async function onBookmarkClick(event: any) {
    importBookmarks(await getBookmarks())
}
