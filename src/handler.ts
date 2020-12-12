import * as htmlAdder from './addHTMLElements.js'
import * as tabHelper from './tabHelper.js'
import * as helper from './helper.js'
import { elementData, folderData, itemData, Mode, tabStructData } from './interfaces.js'
import * as firefoxHandler from './firefoxHandler.js'
import { addFolder, createEmptyData, exportData, generateFolderID, getDataStructFromFirefox, getFolderJSONObjectByID, getItemJSONObjectByItemID, moveFolder, moveItem, removeFolder, removeItem, renameFolder, saveDataInFirefox, updateTabs, updateTabsOnStartUp } from './dataHandler/importer.js'

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
    refreshTabListOnSiteUpdated: refreshTabListOnSiteUpdated,
    refreshTabListOnTabRemoved: refreshTabListOnTabRemoved
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
const exportBtn = document.getElementById("exportData")
const importBtn = document.getElementById("importData")
const moveBtn = document.getElementById("moveElements")

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

    exportBtn.onclick = exportData_handler
    importBtn.onclick = importData_handler
    moveBtn.onclick = moveData_handler

    //trashcan listners
    trashcan.addEventListener("dragstart", addHTMLHandler.dragstart_handler)
    trashcan.addEventListener("dragover", addHTMLHandler.dragover_handler)
    trashcan.addEventListener("dropend", addHTMLHandler.dropend_handler)
    trashcan.addEventListener("dragend", addHTMLHandler.dragend_handler)
    trashcan.addEventListener("dragenter", addHTMLHandler.dragenter_handler)
    trashcan.addEventListener("dragleave", addHTMLHandler.dragleave_handler)
    trashcan.addEventListener("drop", addHTMLHandler.drop_handler)
    trashcan.setAttribute("isTrashCan", "true");

    var htmlBody = document.getElementById("body")
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        htmlBody.classList.add("darkmode")
        htmlBody.classList.remove("lightmode")
    } else {
        htmlBody.classList.add("lightmode");
        htmlBody.classList.remove("darkmode");
    }
}

async function dragstart_handler(event) {
    dragging = event.target
    if (helper.isFolder(dragging))
        draggingJSON = getFolderJSONObjectByID(dragging.getAttribute("folderID"), (await getDataStructFromFirefox()))
    else if (helper.isItem(dragging))
        draggingJSON = getItemJSONObjectByItemID(dragging.getAttribute("itemID"), (await getDataStructFromFirefox()))
    event.target.classList.add("hover")
    //ev.dataTransfer.setData("text/plain", ev.target.innerText)
    //ev.dataTransfer.dropEffect = "move"
}

function dragend_handler(event) {
    event.target.classList.remove("hover")
}

function dragenter_handler(event) {
    var target = event.target as HTMLElement
    if (target != dragging && helper.isFolder(target)) { // && target.folderID != "pinned" && target.folderID != "unordered") {
        target.classList.add("hover")
    }
}

function dragleave_handler(event) {
    if (helper.isFolder(event.target as HTMLElement)) {
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
            await moveFolder(draggingJSON.folderID, draggingJSON.parentFolderID, target.getAttribute("folderID"))
        } else if ('itemID' in draggingJSON) {
            await moveItem(draggingJSON.itemID, draggingJSON.parentFolderID, target.getAttribute("folderID"))
        }

        triggerListReload()
    } else if (helper.toBoolean(target.getAttribute("isTrashCan"))) {
        if ('itemID' in draggingJSON) {
            if (draggingJSON.tabID != "-1") tabHelper.closeTab(draggingJSON.tabID)
            await removeItem(draggingJSON.itemID, draggingJSON.parentFolderID)
        } else if ('folderID' in draggingJSON) {
            await removeFolder(draggingJSON.folderID, draggingJSON.parentFolderID)
        }
        triggerListReload()
    } else if (helper.isInbetween(target)) {
        var parentFolderID: string = target.getAttribute("parentFolderID")
        var data: tabStructData = await getDataStructFromFirefox()
        var parentFolder: folderData = getFolderJSONObjectByID(parentFolderID, data)
        var element: elementData
        if ('itemID' in draggingJSON) {
            element = getItemJSONObjectByItemID(draggingJSON.itemID, data);
        } else if ('folderID' in draggingJSON) {
            element = getFolderJSONObjectByID(draggingJSON.folderID, data);
        }
        element.index = +target.getAttribute("index")
        for (var key in parentFolder.elements) {
            var checkElement = parentFolder.elements[key]
            if (checkElement.index != element.index)
                continue
            if ('itemID' in checkElement && 'itemID' in element) {
                if ((checkElement as itemData).itemID != (element as itemData).itemID)
                    (element as itemData).index++
            } else if ('folderID' in checkElement && 'folderID' in element) {
                if ((checkElement as folderData).folderID != (element as folderData).folderID)
                    (element as folderData).index++
            }
        }
        await saveDataInFirefox(data)
        triggerListReload()
    }

    dragging = undefined

    //const data = ev.dataTransfer.getData("text/plain");
    //ev.target.appendchild(...)
}

function dropend_handler(event) {
    //console.log(event)
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
        var data: tabStructData = await getDataStructFromFirefox()
        var dataObj = getFolderJSONObjectByID(HTMLFolder.getAttribute("folderID"), data);
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
        await saveDataInFirefox(data)
        triggerListReload();
    }
}

async function itemClick(e) {
    var data = await getDataStructFromFirefox()
    var tabElement = e.originalTarget as HTMLHtmlElement
    var tabID = tabElement.getAttribute("tabID")
    var tabs = await tabHelper.getTabByTabID(tabID)
    var tab = (await tabHelper.tabExists(tabID)) ? tabs : { pinned: false }
    //var currentTab = tabHelper.getCurrentTab();
    var itemID = tabElement.getAttribute("itemID")
    var jsonTab = getItemJSONObjectByItemID(itemID, data)
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
    await saveDataInFirefox(data)
}

function addFolderClick_handler() {
    addFolderNameInputContainer.classList.remove("disabled")
}

async function addFolderSubmit_handler(event) {
    if (event.keyCode == 13) {
        event.preventDefault()
        var value = addFolderNameInput.value
        await addFolder("-1", (await generateFolderID()).toString(), value)
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
        await renameFolder(parent.folderID, value)
        triggerListReload()
    }
}

async function refreshTabList() {
    var data = await getDataStructFromFirefox()
    tabHelper.getTabs().then((tabs) => { loadFolderList(tabs, data) })
}

function refreshTabListOnActiveChange(activeInfoa) {
    refreshTabList()
}

function refreshTabListOnTabClosed(tabId, removeInfo) {
    refreshTabList()
}

function refreshTabListOnTabRemoved() {
    refreshTabList()
}

async function refreshTabListOnSiteUpdated(tabId, changeInfo, tabInfo) {
    if (changeInfo.status != undefined) refreshTabList()
}

//not used anymore
async function tabUpdateListener(tabId, changeInfo, tabInfo) {
    document.getElementById("list").innerHTML = ""
    var data = await getDataStructFromFirefox()
    firefoxHandler.tabQuery({}).then((element) => { loadFolderList(element, data) }, (element) => console.error(element))
}

export async function loadFolderList(tabs: any, data: tabStructData) {
    updateTabsOnStartUp(data, tabs)
    //update tabs 
    updateTabs(data, tabs)

    saveDataInFirefox(data)

    displayHTMLList(data)
}

async function displayHTMLList(data: tabStructData) {
    if (listContainer) {
        listContainer.innerHTML = ""
        listContainer.innerHTML = ""
        displayElements(data, data, listContainer, 1)
        var tabs = await tabHelper.getTabs()

    }
}

function displayElements(data: tabStructData, currentData: folderData | tabStructData, htmlContainer: HTMLElement, layer: number) {
    for (var key in currentData.elements) {
        var item = currentData.elements[key]
        if (item != undefined) {
            if ('itemID' in item) {
                htmlAdder.addTab(data, htmlContainer, item, layer, addHTMLHandler);
            } else if ('folderID' in item) {
                var folder = item as folderData
                var htmlFolder = htmlAdder.addFolder(data, htmlContainer, folder, layer, addHTMLHandler)
                displayElements(data, folder, htmlFolder.children[folderChildItemListIndex] as HTMLElement, layer + 1)
                setChildrenVisible(folder.open, htmlFolder.children)
            }
        }
    }
}

//#endregion

//#region helper functions
function triggerListReload() {
    refreshTabList()
}

function clearStruct() {
    saveDataInFirefox(createEmptyData())
}

function setChildrenVisible(value: Boolean, childs: Array<HTMLElement> | HTMLCollection) {
    if (value) childs[folderChildItemListIndex].classList.remove("disabled")
    else childs[folderChildItemListIndex].classList.add("disabled")
}

function tabClosed(event) {
    setup();
}

async function loadFirefoxData(): Promise<tabStructData> {
    var dataF = await getDataStructFromFirefox()
    if (dataF != undefined) return dataF
    return undefined
}

async function exportData_handler(event: any) {
    tabHelper.createTab("../dataExport.html")
}

async function importData_handler(event: any) {
    tabHelper.createTab("../dataImport.html")
}

async function moveData_handler(event: any) {
    var data = await getDataStructFromFirefox()
    switch (data.mode) {
        case Mode.Default:
            data.mode = Mode.Move
            break;
        case Mode.Move:
            data.mode = Mode.Default
            break;
        default:
            data.mode = Mode.Default
    }
    await saveDataInFirefox(data)
    triggerListReload()
}