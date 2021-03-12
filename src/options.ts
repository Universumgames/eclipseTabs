import { getDataStructFromFirefox, saveDataInFirefox } from "./dataHandler/getter.js"
import { tabStructData } from "./interfaces.js"

async function saveOptions(e) {
    e.preventDefault()
    var data = await getDataStructFromFirefox()
    console.log(data)
    //@ts-ignore
    data.devMode = document.getElementById("developerMode_checkbox").checked
    saveDataInFirefox(data)
}
function restoreOptions() {
    function setCurrentChoices(storage: tabStructData) {
        //@ts-ignore
        document.getElementById("developerMode_checkbox").checked = storage.devMode
    }

    getDataStructFromFirefox().then((eclipseStorage) => {
        setCurrentChoices(eclipseStorage)
    })
}

document.addEventListener("DOMContentLoaded", restoreOptions)
document.querySelector("form").addEventListener("submit", saveOptions)
