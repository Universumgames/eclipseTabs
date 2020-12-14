//#region imports
import * as tabHelper from './tabHelper.js'
import { elementData, folderData, itemData, tabStructData } from './interfaces.js'
import * as handler from './handler.js'
import * as chromiumHandler from './chromiumHandler.js'
import { createEmptyData, getDataStructFromFirefox, saveDataInFirefox, updateTabsOnStartUp } from './dataHandler/importer.js'
//#endregion

//#region init code
var data: tabStructData = createEmptyData()

//on firefox start (tabID's may have changed, changing these in data struct)
var firefoxStartHandler: chromiumHandler.firefoxStartupHandler = {
    startup: startup
}
chromiumHandler.startupHandler(firefoxStartHandler);
//on sidepanel fully loaded
document.addEventListener("DOMContentLoaded", () => setup())

//add updatteHTML listener
//browser.tabs.addEventListener("updateHTMLList", () => updateHTMLList())

async function startup() {
    var dataTmp = await getDataStructFromFirefox()
    if (dataTmp == undefined) {
        console.log(await getDataStructFromFirefox())
        saveDataInFirefox(data)
        console.log("Data cleared or extension is newly installed, created new storage structure: ", data)
    }
    else data = dataTmp
    tabHelper.getTabs().then((tabs) => {
        console.log(tabs)
        updateTabsOnStartUp(data, tabs)
    })
    console.log(await getDataStructFromFirefox())
}

async function setup() {
    var dataTmp = await getDataStructFromFirefox()
    if (dataTmp == undefined) {
        saveDataInFirefox(data)
        console.log("Data cleared or extension is newly installed, created new storage structure: ", data)
    }
    else data = dataTmp
    //load up pinned tabs
    tabHelper.getTabs().then((tabs) => { handler.loadFolderList(tabs, data) })

    handler.setupHandler(setup)

    console.log(data)
}
//#endregion

//#region Event handler

