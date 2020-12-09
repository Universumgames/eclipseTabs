import * as htmlAdder from './addHTMLElements.js'
import * as dataHandler from './dataHandler.js'
import * as tabHelper from './tabHelper.js'
import * as helper from './helper.js'
import { elementData, folderData, itemData, tabStructData } from './interfaces.js'
import * as firefoxHandler from './firefoxHandler.js'

export var addHTMLHandler: htmlAdder.addHTMLhandler = {
    folderRenameSubmit_handler: folderRenameSubmit_handler,
    folderRenameClick_handler: folderRenameClick_handler,
    dragstart_handler: dragstart_handler,
    drop_handler: drop_handler,
    dragover_handler: dragover_handler,
    dropend_handler: dropend_handler,
    dragend_handler: dragend_handler,
    dragenter_handler: dragenter_handler,
    dragleave_handler: dragleave_handler,
    folderClick: folderClick,
    itemClick: itemClick,
    clearStruct_handler: clearStruct_handler,
    structReloader_handler: structReloader_handler,
    extensionReloader_handler: extensionReloader_handler,
    addFolderClick_handler: addFolderClick_handler,
    addFolderSubmit_handler: addFolderSubmit_handler
}

var firefoxHandlerStruct: firefoxHandler.firefoxHandler = {
    refreshTabListOnActiveChange: refreshTabListOnActiveChange,
    refreshTabListOnSiteUpdated: refreshTabListOnSiteUpdated
}

var dragging: HTMLElement
var draggingJSON: folderData | itemData

const folderChildImageIndex = 0
const folderChildItemListIndex = 2
const folderChildTextIndex = 1

const listContainer = document.getElementById("list")
const structCleaner = document.getElementById("structCleaner")
const structReloader = document.getElementById("structReloader")
const extensionReloader = document.getElementById("extensioReloader")

const addFolderNameInputContainer = document.getElementById("addFolderNameInputContainer")
const addFolderNameInput = document.getElementById("addFolderNameInput") as HTMLTextAreaElement

const addFolderBtn = document.getElementById("addFolder")
const trashcan = document.getElementById("delete")

var setup: Function

export function setupHandler(setupFun: Function) {
    setup = setupFun
    firefoxHandler.registerListener(firefoxHandlerStruct)

    //set placeholder invisible
    document.getElementById("emptyList").classList.add("disabled")
    //set folder list visible
    document.getElementById("list").classList.remove("disabled")

    structCleaner.onclick = addHTMLHandler.clearStruct_handler
    structReloader.onclick = addHTMLHandler.structReloader_handler
    extensionReloader.onclick = addHTMLHandler.extensionReloader_handler
    addFolderBtn.onclick = addHTMLHandler.addFolderClick_handler
    addFolderNameInput.addEventListener("keyup", addHTMLHandler.addFolderSubmit_handler)

    //trashcan listners
    trashcan.addEventListener("dragstart", addHTMLHandler.dragstart_handler)
    trashcan.addEventListener("dragover", addHTMLHandler.dragover_handler)
    trashcan.addEventListener("dropend", addHTMLHandler.dropend_handler)
    trashcan.addEventListener("dragend", addHTMLHandler.dragend_handler)
    trashcan.addEventListener("dragenter", addHTMLHandler.dragenter_handler)
    trashcan.addEventListener("dragleave", addHTMLHandler.dragleave_handler)
    trashcan.addEventListener("drop", addHTMLHandler.drop_handler)
    trashcan.setAttribute("isTrashCan", "true");
}

async function dragstart_handler(event) {
    dragging = event.target
    if (helper.isFolder(dragging))
        draggingJSON = dataHandler.getFolderJSONObjectByID(dragging.getAttribute("folderID"), (await dataHandler.getDataStructFromFirefox()))
    else if (helper.isItem(dragging))
        draggingJSON = dataHandler.getItemJSONObjectByItemID(dragging.getAttribute("itemID"), (await dataHandler.getDataStructFromFirefox()).elements)
    event.target.classList.add("hover")
    //ev.dataTransfer.setData("text/plain", ev.target.innerText)
    //ev.dataTransfer.dropEffect = "move"
}

function dragend_handler(event) {
    event.target.classList.remove("hover")
}

function dragenter_handler(event) {
    var target = event.target
    if (target != dragging && helper.isFolder(target)) { // && target.folderID != "pinned" && target.folderID != "unordered") {
        target.classList.add("hover")
    }
}

function dragleave_handler(event) {
    if (helper.isFolder(event.target)) {
        event.target.classList.remove("hover")
    }
}

function dragover_handler(event) {
    event.preventDefault()
    //ev.dataTransfer.dropEffect = "move"
    //console.log(event)
}

async function drop_handler(event) {
    event.preventDefault()
    var target = event.target as HTMLElement
    target.classList.remove("hover")
    dragging.classList.remove("hover")

    if (helper.isFolder(target)) {
        if ('folderID' in draggingJSON) {
            await dataHandler.moveFolder(draggingJSON.folderID, draggingJSON.parentFolderID, target.getAttribute("folderID"))
        } else if ('itemID' in draggingJSON) {
            await dataHandler.moveItem(draggingJSON.itemID, draggingJSON.parentFolderID, target.getAttribute("folderID"))
        }

        triggerListReload()
    } else if (helper.toBoolean(target.getAttribute("isTrashCan"))) {
        if ('itemID' in draggingJSON) {
            if (draggingJSON.tabID != "-1") tabHelper.closeTab(draggingJSON.tabID)
            await dataHandler.removeItem(draggingJSON.itemID, draggingJSON.parentFolderID)
        } else if ('folderID' in draggingJSON) {
            await dataHandler.removeFolder(draggingJSON.folderID, draggingJSON.parentFolderID)
        }
        triggerListReload()
    }

    dragging = undefined

    //const data = ev.dataTransfer.getData("text/plain");
    //ev.target.appendchild(...)
}

function dropend_handler(event) {
    console.log(event)
}


//#endregion

//#region debugging handler
async function clearStruct_handler() {
    clearStruct()
}

function structReloader_handler() {
    setup()
}

function extensionReloader_handler() {
    helper.reloadExtension()
}
//#endregion

//#region click handler
async function folderClick(e) {
    if (e.explicitOriginalTarget.localName == "div" && helper.isFolder(e.originalTarget)) {
        var HTMLFolder = e.originalTarget as HTMLElement
        var opened = helper.toBoolean(HTMLFolder.getAttribute("open"))
        var data: tabStructData = await dataHandler.getDataStructFromFirefox()
        var dataObj = dataHandler.getFolderJSONObjectByID(HTMLFolder.getAttribute("folderID"), data);
        dataObj.open = !dataObj.open
        var newOpened = dataObj.open
        HTMLFolder.setAttribute("open", newOpened + "")

        var childs = HTMLFolder.children
        if (newOpened) {
            HTMLFolder.children[folderChildImageIndex].classList.add("rotated")
            HTMLFolder.classList.add("closed")
            setChildrenVisible(false, childs)
        } else {
            HTMLFolder.children[folderChildImageIndex].classList.remove("rotated")
            HTMLFolder.classList.remove("closed")
            setChildrenVisible(true, childs)
        }
        await dataHandler.saveDataInFirefox(data)
        triggerListReload();
    }
}

async function itemClick(e) {
    var data = await dataHandler.getDataStructFromFirefox()
    var tabElement = e.originalTarget as HTMLHtmlElement
    var tabID = tabElement.getAttribute("tabID")
    var tabs = await tabHelper.getTabByTabID(tabID)
    var tab = (await tabHelper.tabExists(tabID)) ? tabs : { pinned: false }
    //var currentTab = tabHelper.getCurrentTab();
    var itemID = tabElement.getAttribute("itemID")
    var jsonTab = dataHandler.getItemJSONObjectByItemID(itemID, data.elements)
    if (!tab.pinned) {
        if (!helper.toBoolean(tabElement.getAttribute("hiddenTab"))) {
            if (await tabHelper.tabExists(tabID) && await tabHelper.hideTab(tabID)) {
                tabElement.setAttribute("hiddenTab", true + "")
                jsonTab.hidden = true
                tabElement.classList.add("tabHidden")
            }
        } else {
            if (await tabHelper.tabExists(tabID)) {
                if (!(await tabHelper.showTab(tabID))) {
                    tabHelper.createTab(tabElement.getAttribute("url"))
                }
                tabHelper.focusTab(tabID)
                tabElement.setAttribute("hiddenTab", false + "")
                jsonTab.hidden = false;
                tabElement.classList.remove("tabHidden")
            } else {
                await tabHelper.createTab(jsonTab.url)
            }
        }
        setup()
    } else {
        tabHelper.focusTab(tabID)
    }
    await dataHandler.saveDataInFirefox(data)
}

function addFolderClick_handler() {
    addFolderNameInputContainer.classList.remove("disabled")
}

async function addFolderSubmit_handler(event) {
    if (event.keyCode == 13) {
        event.preventDefault()
        var value = addFolderNameInput.value
        await dataHandler.addFolder("-1", (await dataHandler.generateFolderID()).toString(), value)
        addFolderNameInput.value = ""
        addFolderNameInputContainer.classList.add("disabled")
        triggerListReload()
    }
}

function folderRenameClick_handler(event) {
    if (event.explicitOriginalTarget.localName == "div") {
        var divContainer = event.originalTarget
        if (divContainer.isFolder)
            //divContainer.innerText = ""
            divContainer.children[2].classList.toggle("disabled")
    }
}

async function folderRenameSubmit_handler(event) {
    if (event.keyCode == 13) {
        event.preventDefault()
        var value = event.originalTarget.value
        var parent = event.originalTarget.parentNode
        await dataHandler.renameFolder(parent.folderID, value)
        triggerListReload()
    }
}

async function refreshTabList() {
    var data = await dataHandler.getDataStructFromFirefox()
    tabHelper.getTabs().then((tabs) => { loadFolderList(tabs, data) })
}

function refreshTabListOnActiveChange(activeInfoa) {
    refreshTabList()
}

function refreshTabListOnTabClosed(tabId, removeInfo) {
    refreshTabList()
}

async function refreshTabListOnSiteUpdated(tabId, changeInfo, tabInfo) {
    if (changeInfo.status != undefined) refreshTabList()
}

//not used anymore
async function tabUpdateListener(tabId, changeInfo, tabInfo) {
    document.getElementById("list").innerHTML = ""
    var data = await dataHandler.getDataStructFromFirefox()
    firefoxHandler.tabQuery({}).then((element) => { loadFolderList(element, data) }, (element) => console.error(element))
}

export async function loadFolderList(tabs: any, data: tabStructData) {
    dataHandler.updateTabsOnStartUp(data, tabs)
    //update tabs 
    dataHandler.updateTabs(data.elements, tabs)

    console.log(data)

    dataHandler.saveDataInFirefox(data)

    displayHTMLList(data)
}

async function displayHTMLList(data: tabStructData) {
    if (listContainer) {
        listContainer.innerHTML = ""
        listContainer.innerHTML = ""
        displayElements(data.elements, listContainer, 1)
        var tabs = await tabHelper.getTabs()

    }
}

function displayElements(elements: Array<elementData>, htmlContainer: HTMLElement, layer: number) {
    for (var key in elements) {
        var item = elements[key]
        if ('itemID' in item) {
            htmlAdder.addTab(htmlContainer, item, layer, addHTMLHandler);
        } else if ('folderID' in item) {
            var folder = item as folderData
            var htmlFolder = htmlAdder.addFolder(htmlContainer, folder, layer, addHTMLHandler)
            displayElements(folder.elements, htmlFolder.children[folderChildItemListIndex] as HTMLElement, layer + 1)
            setChildrenVisible(folder.open, htmlFolder.children)
        }
    }
}

//#endregion

//#region helper functions
function triggerListReload() {
    refreshTabList()
}

function clearStruct() {
    dataHandler.saveDataInFirefox(dataHandler.createEmptyData())
}

function setChildrenVisible(value: Boolean, childs: Array<HTMLElement> | HTMLCollection) {
    if (value) childs[folderChildItemListIndex].classList.remove("disabled")
    else childs[folderChildItemListIndex].classList.add("disabled")
}

function tabClosed(event) {
    setup();
}

async function loadFirefoxData(): Promise<tabStructData> {
    var dataF = await dataHandler.getDataStructFromFirefox()
    if (dataF != undefined) return dataF
    return undefined
}