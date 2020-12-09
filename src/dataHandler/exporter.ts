import { tabStructData } from '../interfaces.js'
import { getDataStructFromFirefox } from './getter.js'

document.addEventListener("DOMContentLoaded", () => exportData())

export async function exportData() {
    var json = document.getElementById("jsonContent")
    if (json != undefined) {
        var data: tabStructData = await getDataStructFromFirefox()
        json.innerHTML = JSON.stringify(data, undefined, 2)
    }
}