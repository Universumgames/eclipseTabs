import { tabStructData } from '../interfaces.js'
import { closeTab, getCurrentTab } from '../tabHelper.js'
import { saveDataInFirefox } from './getter.js'

document.addEventListener("DOMContentLoaded", () => setup())

var button: any

function setup() {
    button = document.getElementById("inputJSONSubmit")
    button.onclick = onClickButton
}

function onClickButton(event: any) {
    var json = document.getElementById("jsonInput") as any
    var text: string = json.value
    importData(text)
}

export async function importData(json: string) {
    var jsonData = JSON.parse(json);
    await saveDataInFirefox(jsonData as tabStructData);
}