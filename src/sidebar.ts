//#region imports
import * as tabHelper from './tabHelper.js'
import { elementData, folderData, itemData, tabStructData } from './interfaces.js'
import * as handler from './handler.js'
import * as firefoxHandler from './firefoxHandler.js'
import { createEmptyData, getDataStructFromFirefox, saveDataInFirefox, updateTabsOnStartUp } from './dataHandler/importer.js'
//#endregion

//#region init code
var data: tabStructData = createEmptyData()

//on firefox start (tabID's may have changed, changing these in data struct)
var firefoxStartHandler: firefoxHandler.firefoxStartupHandler = {
    startup: startup
}
firefoxHandler.startupHandler(firefoxStartHandler);
//on sidepanel fully loaded
document.addEventListener("DOMContentLoaded", () => setup())

//add updatteHTML listener
//browser.tabs.addEventListener("updateHTMLList", () => updateHTMLList())

async function startup() {
    var dataTmp = await getDataStructFromFirefox()
    if (dataTmp == undefined)
        saveDataInFirefox(data)
    else data = dataTmp
    tabHelper.getTabs().then((tabs) => {
        console.log(tabs)
        updateTabsOnStartUp(data, tabs)
    })
    console.log("query");
}

async function setup() {
    var dataTmp = await getDataStructFromFirefox()
    if (dataTmp == undefined)
        saveDataInFirefox(data)
    else data = dataTmp
    //load up pinned tabs
    tabHelper.getTabs().then((tabs) => { handler.loadFolderList(tabs, data) })

    handler.setupHandler(setup)

    console.log(data)
}
//#endregion

//#region Event handler

