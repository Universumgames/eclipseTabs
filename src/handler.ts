import * as htmlAdder from "./addHTMLElements.js"
import * as tabHelper from "./tabHelper.js"
import * as helper from "./helper.js"
import { ColorScheme, elementData, folderData, itemData, KeyCode, Mode, tabStructData } from "./interfaces.js"
import * as firefoxHandler from "./firefoxHandler.js"
import {
    addFolder,
    collapseAll,
    createEmptyData,
    expandAll,
    exportData,
    generateFolderID,
    getDataStructFromFirefox,
    getFolderJSONObjectByID,
    getItemJSONObjectByItemID,
    moveFolder,
    moveItem,
    removeFolder,
    removeItem,
    renameFolder,
    saveDataInFirefox,
    updateTabs,
    updateTabsOnStartUp,
} from "./dataHandler/importer.js"

export var addHTMLHandler: htmlAdder.addHTMLhandler = {
    folderRenameSubmit_handler: folderRenameSubmit_handler,
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
    addFolderSubmit_handler: addFolderSubmit_handler,
}

var firefoxHandlerStruct: firefoxHandler.firefoxHandler = { updateList: updateList }

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

const bottom = document.getElementById("bottom")
const addFolderBtn = document.getElementById("addFolder")
const trashcan = document.getElementById("delete")
const exportBtn = document.getElementById("exportData") as HTMLInputElement
const importBtn = document.getElementById("importData") as HTMLInputElement
const moveBtn = document.getElementById("moveElements") as HTMLInputElement
//const darkModeSW_checkbox = document.getElementById("darkModeSW_checkbox") as HTMLInputElement
const bottomElementIcons: Array<HTMLElement> = []

const contextMenu = document.getElementById("contextMenu")
const contextMenu_generic_collapseAll = document.getElementById("contextMenu_generic_collapseAll")
const contextMenu_generic_expandAll = document.getElementById("contextMenu_generic_expandAll")
const contextMenu_folder = document.getElementById("contextMenu_folder")
const contextMenu_folder_rename = document.getElementById("contextMenu_folder_rename")
const contextMenu_folder_delete = document.getElementById("contextMenu_folder_delete")
const contextMenu_item = document.getElementById("contextMenu_item")
const contextMenu_item_delete = document.getElementById("contextMenu_item_delete")

const debugElements = document.getElementById("debugElements")

var contextMenuTarget: HTMLElement

var oldColorScheme = ColorScheme.dark

var setup: Function

export async function setupHandler(setupFun: Function) {
    setup = setupFun

    var data = await getDataStructFromFirefox()
    firefoxHandler.registerListener(firefoxHandlerStruct)

    // set placeholder invisible
    document.getElementById("emptyList").classList.add("disabled")
    // set folder list visible
    document.getElementById("list").classList.remove("disabled")

    structCleaner.onclick = addHTMLHandler.clearStruct_handler
    structReloader.onclick = addHTMLHandler.structReloader_handler
    extensionReloader.onclick = addHTMLHandler.extensionReloader_handler
    addFolderBtn.onclick = addHTMLHandler.addFolderClick_handler
    addFolderNameInput.addEventListener("keyup", addHTMLHandler.addFolderSubmit_handler)

    exportBtn.onclick = exportData_handler
    importBtn.onclick = importData_handler
    moveBtn.onclick = moveData_handler

    // trashcan listners
    trashcan.addEventListener("dragstart", addHTMLHandler.dragstart_handler)
    trashcan.addEventListener("dragover", addHTMLHandler.dragover_handler)
    trashcan.addEventListener("dropend", addHTMLHandler.dropend_handler)
    trashcan.addEventListener("dragend", addHTMLHandler.dragend_handler)
    trashcan.addEventListener("dragenter", addHTMLHandler.dragenter_handler)
    trashcan.addEventListener("dragleave", addHTMLHandler.dragleave_handler)
    trashcan.addEventListener("drop", addHTMLHandler.drop_handler)
    trashcan.setAttribute("isTrashCan", "true")

    switch (data.mode) {
        case Mode.Default:
            moveBtn.classList.remove("selected")
            break
        case Mode.Move:
            moveBtn.classList.add("selected")
            break
    }

    //darkModeSW_checkbox.onchange = darkModeSW_checkbox_handler
    //darkModeSW_checkbox.checked = data.colorScheme == ColorScheme.light ? true : false

    document.oncontextmenu = contextMenu_handler
    document.onclick = contextMenuClose_handler

    contextMenu_generic_collapseAll.onclick = contextMenu_generic_collapseAll_handler
    contextMenu_generic_expandAll.onclick = contextMenu_generic_expandAll_handler

    contextMenu_folder_rename.onclick = contextMenu_folder_rename_handler
    contextMenu_folder_delete.onclick = contextMenu_folder_delete_handler
    contextMenu_item_delete.onclick = contextMenu_item_delete_handler

    bottomElementIcons.push(addFolderBtn.children[0] as HTMLElement)
    bottomElementIcons.push(trashcan.children[0] as HTMLElement)
    bottomElementIcons.push(exportBtn.children[0] as HTMLElement)
    bottomElementIcons.push(importBtn.children[0] as HTMLElement)
    bottomElementIcons.push(moveBtn.children[0] as HTMLElement)

    setDevMode(data.devMode)

    setColorScheme(data)
}

async function dragstart_handler(event) {
    dragging = event.target
    if (helper.isFolder(dragging))
        draggingJSON = getFolderJSONObjectByID(dragging.getAttribute("folderID"), await (await getDataStructFromFirefox()).rootFolder)
    else if (helper.isItem(dragging))
        draggingJSON = getItemJSONObjectByItemID(dragging.getAttribute("itemID"), await (await getDataStructFromFirefox()).rootFolder)

    event.target.classList.add("hover")
    // ev.dataTransfer.setData("text/plain", ev.target.innerText)
    // ev.dataTransfer.dropEffect = "move"
}

function dragend_handler(event) {
    event.target.classList.remove("hover")
}

function dragenter_handler(event) {
    var target = event.target as HTMLElement
    if (target != dragging && helper.isFolder(target)) {
        // && target.folderID != "pinned" && target.folderID != "unordered") {
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
    // ev.dataTransfer.dropEffect = "move"
    // console.log(event)
}

async function drop_handler(event) {
    event.preventDefault()
    var target = event.target as HTMLElement
    target.classList.remove("hover")
    if (dragging != undefined) {
        dragging.classList.remove("hover")

        if (helper.isFolder(target)) {
            if ("folderID" in draggingJSON) {
                await moveFolder(draggingJSON.folderID, draggingJSON.parentFolderID, target.getAttribute("folderID"))
            } else if ("itemID" in draggingJSON) {
                await moveItem(draggingJSON.itemID, draggingJSON.parentFolderID, target.getAttribute("folderID"))
            }

            triggerListReload()
        } else if (helper.toBoolean(target.getAttribute("isTrashCan"))) {
            if ("itemID" in draggingJSON) {
                if (draggingJSON.tabID != "-1") tabHelper.closeTab(draggingJSON.tabID)

                await removeItem(draggingJSON.itemID, draggingJSON.parentFolderID)
            } else if ("folderID" in draggingJSON) {
                await removeFolder(draggingJSON.folderID, draggingJSON.parentFolderID)
            }
            triggerListReload()
        } else if (helper.isInbetween(target)) {
            var parentFolderID: string = target.getAttribute("parentFolderID")
            var data: tabStructData = await getDataStructFromFirefox()
            var parentFolder: folderData = getFolderJSONObjectByID(parentFolderID, data.rootFolder)
            var element: elementData
            if ("itemID" in draggingJSON) {
                element = getItemJSONObjectByItemID(draggingJSON.itemID, data.rootFolder)
            } else if ("folderID" in draggingJSON) {
                element = getFolderJSONObjectByID(draggingJSON.folderID, data.rootFolder)
            }
            element.index = +target.getAttribute("index")
            /*for (var key in parentFolder.elements) {
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
        }*/
            await saveDataInFirefox(data)
            triggerListReload()
        }
    }

    console.log(event)

    dragging = undefined

    // const data = ev.dataTransfer.getData("text/plain");
    // ev.target.appendchild(...)
}

function dropend_handler(event) {
    // console.log(event)
}

// #endregion

// #region debugging handler
async function clearStruct_handler() {
    clearStruct()
}

function structReloader_handler() {
    setup()
}

function extensionReloader_handler() {
    helper.reloadExtension()
}
// #endregion

// #region click handler
async function folderClick(e) {
    if (e.explicitOriginalTarget.localName == "div" && helper.isFolder(e.originalTarget)) {
        var HTMLFolder = e.originalTarget as HTMLElement
        var opened = helper.toBoolean(HTMLFolder.getAttribute("open"))
        var data: tabStructData = await getDataStructFromFirefox()
        var dataObj = getFolderJSONObjectByID(HTMLFolder.getAttribute("folderID"), data.rootFolder)
        dataObj.open = !dataObj.open
        var newOpened = dataObj.open
        HTMLFolder.setAttribute("open", newOpened + "")

        var childs = HTMLFolder.children
        var image = document.getElementById(dataObj.folderID + "_image")
        console.log(image)
        if (newOpened) {
            image.classList.add("rotated")
            HTMLFolder.classList.add("closed")
            setChildrenVisible(false, childs)
        } else {
            image.classList.remove("rotated")
            HTMLFolder.classList.remove("closed")
            setChildrenVisible(true, childs)
        }
        console.log(image)
        await saveDataInFirefox(data)
        triggerListReload()
    }
}

async function itemClick(e) {
    var data = await getDataStructFromFirefox()
    var tabElement = e.originalTarget as HTMLHtmlElement
    var tabID = tabElement.getAttribute("tabID")
    var tabs = await tabHelper.getTabByTabID(tabID)
    var tab = (await tabHelper.tabExists(tabID))
        ? tabs
        : {
              pinned: false,
          }
    // var currentTab = tabHelper.getCurrentTab();
    var itemID = tabElement.getAttribute("itemID")
    var jsonTab = getItemJSONObjectByItemID(itemID, data.rootFolder)
    if (!tab.pinned) {
        if (!helper.toBoolean(tabElement.getAttribute("hiddenTab"))) {
            if ((await tabHelper.tabExists(tabID)) && (await tabHelper.hideTab(tabID))) {
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
                jsonTab.hidden = false
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
    addFolderNameInput.focus()
}

async function addFolderSubmit_handler(event) {
    if (event.keyCode == KeyCode.enter) {
        event.preventDefault()
        var value = addFolderNameInput.value
        if (value != "") await addFolder("-1", (await generateFolderID()).toString(), value, await getDataStructFromFirefox())
        addFolderNameInput.value = ""
        addFolderNameInputContainer.classList.add("disabled")
        triggerListReload()
    }
    if (event.keyCode == KeyCode.escape) {
        addFolderNameInput.value = ""
        addFolderNameInputContainer.classList.add("disabled")
        triggerListReload()
    }
}

async function folderRenameSubmit_handler(event) {
    if (event.keyCode == KeyCode.enter) {
        event.preventDefault()
        var value = event.originalTarget.value
        var parent = event.originalTarget.parentNode
        if (value != "") await renameFolder(parent.getAttribute("folderID"), value)
        triggerListReload()
    }
    if (event.keyCode == KeyCode.escape) {
        triggerListReload()
    }
}

async function refreshTabList() {
    var data = await getDataStructFromFirefox()
    tabHelper.getTabs().then((tabs) => {
        loadFolderList(tabs, data)
    })
    setColorScheme(data)
    setDevMode(data.devMode)
}

function updateList() {
    refreshTabList()
}

async function refreshTabListOnSiteUpdated(tabId, changeInfo, tabInfo) {
    if (changeInfo.status != undefined) refreshTabList()
}

export async function loadFolderList(tabs: any, data: tabStructData) {
    updateTabsOnStartUp(data.rootFolder, tabs)
    // update tabs
    updateTabs(data, tabs)

    saveDataInFirefox(data)

    displayHTMLList(data)
}

async function displayHTMLList(data: tabStructData) {
    if (listContainer) {
        listContainer.innerHTML = ""
        listContainer.innerHTML = ""
        displayElements(data, data.rootFolder, listContainer, 1)
        var tabs = await tabHelper.getTabs()
    }
}

function displayElements(data: tabStructData, currentData: folderData, htmlContainer: HTMLElement, layer: number) {
    for (var key in currentData.elements) {
        var item = currentData.elements[key]
        if (item != undefined) {
            if ("itemID" in item) {
                htmlAdder.addTab(data, htmlContainer, item, layer, addHTMLHandler)
            } else if ("folderID" in item) {
                var folder = item as folderData
                var htmlFolder = htmlAdder.addFolder(data, htmlContainer, folder, layer, addHTMLHandler)
                displayElements(data, folder, htmlFolder.children[folderChildItemListIndex] as HTMLElement, layer + 1)
                setChildrenVisible(folder.open, htmlFolder.children)
            }
        }
    }
}

// #endregion

// #region helper functions
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
    setup()
}

async function exportData_handler(event: any) {
    tabHelper.createTab("../pages/dataExport.html")
}

async function importData_handler(event: any) {
    tabHelper.createTab("../pages/dataImport.html")
}

async function moveData_handler(event: any) {
    var data = await getDataStructFromFirefox()
    switch (data.mode) {
        case Mode.Default:
            data.mode = Mode.Move
            moveBtn.classList.add("selected")
            break
        case Mode.Move:
            data.mode = Mode.Default
            moveBtn.classList.remove("selected")
            break
        default:
            data.mode = Mode.Default
    }
    await saveDataInFirefox(data)
    triggerListReload()
}

async function contextMenu_handler(event: any) {
    event.preventDefault()
    var target = event.explicitOriginalTarget as HTMLElement
    contextMenu.classList.remove("disabled")
    contextMenu.style.left = event.clientX + "px"
    contextMenu.style.top = event.clientY + "px"
    if (target.getAttribute("folderID") != undefined) contextMenu_folder.classList.remove("disabled")

    if (target.getAttribute("itemID") != undefined) contextMenu_item.classList.remove("disabled")

    contextMenuTarget = target
}

async function contextMenuClose_handler(event: any) {
    contextMenu.classList.add("disabled")
    contextMenu_folder.classList.add("disabled")
    contextMenu_item.classList.add("disabled")
}

async function contextMenu_generic_collapseAll_handler(event: any) {
    await collapseAll()
    triggerListReload()
}

async function contextMenu_generic_expandAll_handler(event: any) {
    await expandAll()
    triggerListReload()
}

async function contextMenu_folder_rename_handler(event: any) {
    var divContainer = contextMenuTarget
    if (divContainer.getAttribute("isFolder")) {
        // divContainer.innerText = ""
        divContainer.children[3].classList.toggle("disabled")
        //@ts-ignore
        divContainer.children[3].focus()
    }
}

async function contextMenu_folder_delete_handler(event: any) {
    var folder: folderData
    var data = await getDataStructFromFirefox()
    if (helper.isFolder(contextMenuTarget)) {
        folder = getFolderJSONObjectByID(contextMenuTarget.getAttribute("folderID"), data.rootFolder)
        await removeFolder(folder.folderID, folder.parentFolderID)
        triggerListReload()
    }
}

async function contextMenu_item_delete_handler(event: any) {
    var item: itemData
    var data = await getDataStructFromFirefox()
    if (helper.isItem(contextMenuTarget)) {
        item = getItemJSONObjectByItemID(contextMenuTarget.getAttribute("itemID"), data.rootFolder)
        await removeItem(item.itemID, item.parentFolderID)
        triggerListReload()
    } else console.warn("Method item delete handler was called on a non item element")
}

/*async function darkModeSW_checkbox_handler(event: any) {
    var data = await getDataStructFromFirefox()
    data.colorScheme = event.target.checked ? ColorScheme.light : ColorScheme.dark
    await saveDataInFirefox(data)
    triggerListReload()
}*/

function setColorScheme(data: tabStructData) {
    var htmlBody = document.getElementById("body")
    if (data.colorScheme == ColorScheme.dark) {
        htmlBody.classList.add("darkmode")
        htmlBody.classList.remove("lightmode")
        contextMenu.classList.add("darkmode")
        contextMenu.classList.remove("lightmode")
        bottom.classList.add("darkmode")
        bottom.classList.remove("lightmode")
    } else {
        htmlBody.classList.add("lightmode")
        htmlBody.classList.remove("darkmode")
        contextMenu.classList.add("lightmode")
        contextMenu.classList.remove("darkmode")
        bottom.classList.add("lightmode")
        bottom.classList.remove("darkmode")
    }

    if (data.colorScheme != oldColorScheme) {
        bottomElementIcons.forEach((element) => {
            var filename = element.getAttribute("filename")
            element.setAttribute("data", "../icons/" + (data.colorScheme == ColorScheme.dark ? "dark" : "light") + "/" + filename)
        })
    }
    oldColorScheme = data.colorScheme
}

function setDevMode(devMode: Boolean) {
    if (devMode) {
        debugElements.classList.remove("disabled")
        listContainer.classList.add("devMode")
    } else {
        debugElements.classList.add("disabled")
        listContainer.classList.remove("devMode")
    }
}
