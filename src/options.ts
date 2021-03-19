import { getDataStructFromFirefox, saveDataInFirefox } from "./dataHandler/getter.js"
import { ColorScheme, tabStructData } from "./interfaces.js"

const devModeSW = document.getElementById("developerMode_checkbox") as HTMLInputElement
const darkModeSW = document.getElementById("darkModeSW_checkbox") as HTMLInputElement
const closeTabsDeletingFolderSW = document.getElementById("closeTabsSW_checkbox") as HTMLInputElement

async function saveOptions(e) {
    e.preventDefault()
    var data = await getDataStructFromFirefox()
    console.log(data)
    data.devMode = devModeSW.checked
    data.closeTabsInDeletingFolder = closeTabsDeletingFolderSW.checked
    data.colorScheme = darkModeSW.checked ? ColorScheme.light : ColorScheme.dark
    console.log(data.colorScheme)
    saveDataInFirefox(data)
}

function restoreOptions() {
    function setCurrentChoices(storage: tabStructData) {
        devModeSW.checked = storage.devMode as boolean
        closeTabsDeletingFolderSW.checked = storage.closeTabsInDeletingFolder as boolean
        darkModeSW.checked = storage.colorScheme == ColorScheme.light
    }

    getDataStructFromFirefox().then((eclipseStorage) => {
        setCurrentChoices(eclipseStorage)
    })
}

document.addEventListener("DOMContentLoaded", restoreOptions)
document.querySelector("form").addEventListener("submit", saveOptions)
