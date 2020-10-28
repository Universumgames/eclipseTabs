//#region imports
import * as dataHandler from './dataHandler.js'
import * as tabHelper from './tabHelper.js'
import * as helper from './helper.js'
import { elementData, folderData, itemData, tabStructData } from './interfaces.js'
//#endregion

//#region init code
var dragging : HTMLElement
var draggingJSON: folderData | itemData

const folderChildImageIndex = 0
const folderChildItemListIndex = 2
const folderChildTextIndex = 1

var data: tabStructData = { elements: [], folderID: "-1", name: "root", open: true, parentFolderID: "-1" }

const listContainer = document.getElementById("list")
const structCleaner = document.getElementById("structCleaner")
const structReloader = document.getElementById("structReloader")
const extensionReloader = document.getElementById("extensioReloader")

const addFolderNameInputContainer = document.getElementById("addFolderNameInputContainer")
const addFolderNameInput = document.getElementById("addFolderNameInput") as HTMLTextAreaElement

const addFolderBtn = document.getElementById("addFolder")
const trashcan = document.getElementById("delete")

//on firefox start (tabID's may have changed, changing these in data struct)
browser.runtime.onStartup.addListener(startup)
browser.runtime.onUpdateAvailable.addListener(handleUpdateAvailable);
//on sidepanel fully loaded
document.addEventListener("DOMContentLoaded", () => setup())

function handleUpdateAvailable() {
    console.log(details.version);
    // Proceed to upgrade the add-on
    browser.runtime.reload();
}

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
    //set placeholder invisible
    document.getElementById("emptyList").classList.add("disabled")
    //set folder list visible
    document.getElementById("list").classList.remove("disabled")

    //load up pinned tabs
    tabHelper.getTabs().then((tabs) => { loadFolderList(tabs) })
    //add event listeners for updates
    browser.tabs.onActivated.addListener(refreshTabListOnActiveChange)
    browser.tabs.onUpdated.addListener(refreshTabListOnSiteUpdated)

    structCleaner.onclick = clearStruct_handler
    structReloader.onclick = structReloader_handler
    extensionReloader.onclick = extensionReloader_handler
    addFolderBtn.onclick = addFolderClick_handler
    addFolderNameInput.addEventListener("keyup", addFolderSubmit_handler)

    //trashcan listners
    trashcan.addEventListener("dragstart", dragstart_handler)
    trashcan.addEventListener("dragover", dragover_handler)
    trashcan.addEventListener("dropend", dropend_handler)
    trashcan.addEventListener("dragend", dragend_handler)
    trashcan.addEventListener("dragenter", dragenter_handler)
    trashcan.addEventListener("dragleave", dragleave_handler)
    trashcan.addEventListener("drop", drop_handler)
    trashcan.setAttribute("isTrashCan", "true");

    var data = await dataHandler.getDataStructFromFirefox()
    console.log(data)
    console.log(browser)
}
//#endregion

async function loadFirefoxData() {
    var dataF = await dataHandler.getDataStructFromFirefox()
    if (dataF != undefined) data.elements = dataF.elements
}

//#region Event handler

function tabClosed(event) {
    setup();
}

//#region element Drag handling
async function dragstart_handler(event) {
    dragging = event.target
    if (isFolder(dragging))
        draggingJSON = dataHandler.getFolderJSONObjectByID(dragging.getAttribute("folderID"), (await dataHandler.getDataStructFromFirefox()))
    else if (isItem(dragging))
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
    if (target != dragging && isFolder(target)) { // && target.folderID != "pinned" && target.folderID != "unordered") {
        target.classList.add("hover")
    }
}

function dragleave_handler(event) {
    if (isFolder(event.target)) {
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

    if (isFolder(target)) {
        if ('folderID' in draggingJSON) {
            await dataHandler.moveFolder(draggingJSON.folderID, draggingJSON.parentFolderID, target.getAttribute("folderID"))
        } else if ('itemID' in draggingJSON) {
            await dataHandler.moveItem(draggingJSON.itemID, draggingJSON.parentFolderID, target.getAttribute("folderID"))
        }

        triggerListReload()
    } else if (helper.toBoolean(target.getAttribute("isTrashCan"))) {
        if ('itemID' in draggingJSON) {
            if (draggingJSON.tabID != "-1") tabHelper.closeTab(draggingJSON.tabID)
            dataHandler.removeItem(draggingJSON.itemID, draggingJSON.parentFolderID)
        } else if ('folderID' in draggingJSON) {
            dataHandler.removeFolder(draggingJSON.folderID, draggingJSON.parentFolderID)
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
function clearStruct_handler() {
    clearStruct()
}

function structReloader_handler() {
    setup()
}

function extensionReloader_handler() {
    reloadExtension()
}
//#endregion

//#region click handler
function folderClick(e) {
    if (e.explicitOriginalTarget.localName == "div" && isFolder(e.originalTarget)) {
        var folder = e.originalTarget as HTMLElement
        var open = helper.toBoolean(folder.getAttribute("open"))
        folder.setAttribute("open", !open + "")
        dataHandler.getFolderJSONObjectByID(folder.getAttribute("folderID"), data).open = !open
        var childs = folder.children
        if (open) {
            folder.children[folderChildImageIndex].classList.add("rotated")
            folder.classList.add("closed")
            setChildrenVisible(false, childs)
        } else {
            folder.children[folderChildImageIndex].classList.remove("rotated")
            folder.classList.remove("closed")
            setChildrenVisible(true, childs)
        }
        dataHandler.saveDataInFirefox(data)
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

//#endregion

//#region refresh list listener

async function refreshTabList() {
    tabHelper.getTabs().then((tabs) => { loadFolderList(tabs) })
}

function refreshTabListOnActiveChange(activeInfo) {
    refreshTabList()
}

function refreshTabListOnTabClosed(tabId, removeInfo) {
    refreshTabList()
}

function refreshTabListOnSiteUpdated(tabId, changeInfo, tabInfo) {
    if (changeInfo.status != undefined) refreshTabList()
}

//not used anymore
function tabUpdateListener(tabId, changeInfo, tabInfo) {
    document.getElementById("list").innerHTML = ""
    browser.tabs.query({}).then((element) => { loadFolderList(element) }, (element) => console.error(element))
}

//#endregion


//#region folder events (rename, add)
function addFolderClick_handler() {
    addFolderNameInputContainer.classList.remove("disabled")
}

async function addFolderSubmit_handler(event) {
    if (event.keyCode == 13) {
        event.preventDefault()
        var value = addFolderNameInput.value
        dataHandler.addFolder("-1", (await dataHandler.generateFolderID()).toString(), value)
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
//#endregion

//#endregion

//#region display functions
async function loadFolderList(tabs) {
    await loadFirefoxData()
    dataHandler.updateTabsOnStartUp(data, tabs)
    //update tabs 
    dataHandler.updateTabs(data.elements, tabs)

    console.log(data)

    dataHandler.saveDataInFirefox(data)

    displayHTMLList()
}

async function displayHTMLList() {
    if (listContainer) {
        listContainer.innerHTML = ""
        displayElements(data.elements, listContainer, 1)
        var tabs = await tabHelper.getTabs()

    }
}

function displayElements(elements: Array<elementData>, htmlContainer: HTMLElement, layer: number) {
    for (var key in elements) {
        var item = elements[key]
        if ('itemID' in item) {
            addTab(htmlContainer, item, layer);
        } else if ('folderID' in item) {
            var folder = item as folderData
            var htmlFolder = addFolder(htmlContainer, folder.folderID, folder.name, folder.open, layer)
            displayElements(folder.elements, htmlFolder.children[folderChildItemListIndex] as HTMLElement, layer + 1)
            setChildrenVisible(folder.open, htmlFolder.children)
        }
    }
}

//#endregion

//#region add HTML elements (loading things from json data)
function addFolder(htmlParent: HTMLElement, id: string, name: string, opened: Boolean, tier: number) {
    var folderDiv = document.createElement("div")
    folderDiv.setAttribute("folderID", id)
    folderDiv.setAttribute("isFolder", "true")
    folderDiv.setAttribute("open", opened + "")
    folderDiv.style.marginLeft = tier * 4 + "px"

    var imgNode = document.createElement("img")
    imgNode.src = "../icons/arrow_down-256.png"
    imgNode.id = "image"
    imgNode.classList.add("arrow")
    imgNode.classList.add("noEvents")
    if (!opened) {
        imgNode.classList.add("rotated")
        folderDiv.classList.add("closed")
    }
    folderDiv.appendChild(imgNode)

    var textContainerNode = document.createElement("div")
    textContainerNode.classList.add("noEvents")
    textContainerNode.style.display = "inline"
    var textNode = document.createTextNode(name)
    textContainerNode.appendChild(textNode)
    folderDiv.appendChild(textContainerNode)

    var childContainer = document.createElement("div")
    folderDiv.appendChild(childContainer)



    //rename functionality
    if (id != "pinned" && id != "unordered") {
        var renameNode = document.createElement("input")
        renameNode.type = "text"
        renameNode.placeholder = "New Name"
        renameNode.classList.add("disabled")
        renameNode.addEventListener("keyup", folderRenameSubmit_handler)
        folderDiv.appendChild(renameNode)
        folderDiv.ondblclick = folderRenameClick_handler
    }

    //eventhandler
    //draggable
    if (id != "pinned" && id != "unordered") folderDiv.draggable = true
    folderDiv.addEventListener("dragstart", dragstart_handler)
    folderDiv.addEventListener("drop", drop_handler)
    folderDiv.addEventListener("dragover", dragover_handler)
    folderDiv.addEventListener("dropend", dropend_handler)
    folderDiv.addEventListener("dragend", dragend_handler)
    folderDiv.addEventListener("dragenter", dragenter_handler)
    folderDiv.addEventListener("dragleave", dragleave_handler)
    //on click
    folderDiv.onclick = folderClick

    htmlParent.appendChild(folderDiv)

    return folderDiv
}

function addTab(folderDiv: HTMLElement, tab: itemData, tier: number) {
    var itemNode = document.createElement("div")
    itemNode.setAttribute("tabID", tab.tabID)
    itemNode.setAttribute("itemID", tab.itemID)
    itemNode.setAttribute("url", tab.url)
    itemNode.setAttribute("title", tab.title)
    itemNode.setAttribute("favIconUrl", tab.favIconURL)
    itemNode.setAttribute("isItem", "true")
    if (tab.parentFolderID != "pinned")
        itemNode.onclick = itemClick
    else
        itemNode.ondblclick = itemClick
    itemNode.setAttribute("hiddenTab", tab.hidden + "")
    if (tab.hidden) itemNode.classList.add("tabHidden")
    itemNode.style.marginLeft = tier * 4 + "px"
    var iconNode = document.createElement("img")
    iconNode.src = tab.favIconURL
    iconNode.classList.add("favicon");
    itemNode.appendChild(iconNode)
    var titleContainerNode = document.createElement("div")
    titleContainerNode.classList.add("noEvents")
    titleContainerNode.style.display = "inline"
    var titleNode = document.createTextNode(tab.title)
    titleContainerNode.appendChild(titleNode)
    itemNode.appendChild(titleContainerNode)
    itemNode.classList.add("overflow")
    itemNode.classList.add("listItem")
    itemNode.draggable = true
    itemNode.addEventListener("dragstart", dragstart_handler)
    itemNode.addEventListener("dropend", dropend_handler)
    itemNode.addEventListener("dragend", dragend_handler)
    folderDiv.appendChild(itemNode)
    return itemNode
}
//#endregion

//#region helper functions
function triggerListReload() {
    refreshTabList()
}

function clearStruct() {
    data.elements = []
    dataHandler.saveDataInFirefox(data)
}

function reloadExtension() {
    browser.runtime.reload()
}

function setChildrenVisible(value: Boolean, childs: Array<HTMLElement> | HTMLCollection) {
    if (value) childs[folderChildItemListIndex].classList.remove("disabled")
    else childs[folderChildItemListIndex].classList.add("disabled")
}

function isFolder(element: HTMLElement) {
    return (element.getAttribute("isFolder") != undefined && element.getAttribute("isFolder"))
}

function isItem(element: HTMLElement) {
    return element.getAttribute("isItem")
}
//#endregion