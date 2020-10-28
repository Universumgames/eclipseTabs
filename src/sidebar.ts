//#region imports
import * as dataHandler from './dataHandler.js'
import * as tabHelper from './tabHelper.js'
import { elementData, folderData, itemData, tabStructData } from './interfaces.js'
import * as handler from './handler.js'
import * as firefoxHandler from './firefoxHandler.js'
//#endregion

//#region init code
var data: tabStructData = { elements: [], folderID: "-1", name: "root", open: true, parentFolderID: "-1" }

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
    var data = await dataHandler.getDataStructFromFirefox()
    tabHelper.getTabs().then((tabs) => {
        console.log(tabs)
        dataHandler.updateTabsOnStartUp(data, tabs)
    })
    console.log("query");
}

async function setup() {
    var data = await dataHandler.getDataStructFromFirefox()
    //load up pinned tabs
    tabHelper.getTabs().then((tabs) => { handler.loadFolderList(tabs, data) })

    handler.setup()
    
    console.log(data)
}
//#endregion

//#region Event handler

