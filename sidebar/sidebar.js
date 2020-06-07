//#region imports
import * as dataHandler from '../dataHandler.js'
import * as tabHelper from '../tabHelper.js'
//#endregion

//#region init code
const data = {}
data.elements = []

const listContainer = document.getElementById("list")
const structCleaner = document.getElementById("structCleaner")
const structReloader = document.getElementById("structReloader")
const extensioReloader = document.getElementById("extensioReloader")

const addFolderBtn = document.getElementById("addFolder")
const deleteArea = document.getElementById("delete")


//on sidepanel fully loaded
document.addEventListener("DOMContentLoaded", () => setup())
structCleaner.onclick = clearStruct
structReloader.onclick = setup
extensioReloader.onclick = reloadExtension
//add updatteHTML listener
//browser.tabs.addEventListener("updateHTMLList", () => updateHTMLList())


function setup() {
  //set placeholder invisible
  document.getElementById("emptyList").classList.add("disabled")
  //set folder list visible
  document.getElementById("list").classList.remove("disabled")

  //load up pinned tabs
  tabHelper.getTabs().then((tabs) => { loadFolderList(tabs) })
  //add event listeners for updates
  browser.tabs.onActivated.addListener(refreshTabListOnActiveChange)
  browser.tabs.onUpdated.addListener(refreshTabListOnSiteUpdated)
}
//#endregion

async function loadFirefoxData() {
  var dataF = await dataHandler.getDataStructFromFirefox()
  if(dataF != undefined) data.elements = dataF.elements
}

//#region Drag handling
function dragstart_handler(ev){
  //ev.dataTransfer.setData("text/plain", ev.target.innerText)
  //ev.dataTransfer.dropEffect = "move"
  console.log(ev)
}

function dragover_handler(ev){
  //ev.preventDefault()
  //ev.dataTransfer.dropEffect = "move"
  console.log(ev)
}

function drop_handler(ev){
  //ev.preventDefault()

  //const data = ev.dataTransfer.getData("text/plain");
  //ev.target.appendchild(...)
  console.log(ev)
}

function dropend_handler(ev){
  console.log(ev)
}
//#endregion


async function loadFolderList(tabs) {
  await loadFirefoxData()
  //save pinned tabs 
  dataHandler.updatePinnedFolderList(data.elements, tabs)
  dataHandler.updateTabs(data.elements, tabs)

  //console.log(data)

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

function displayElements(elements, htmlContainer, layer) {
  for (var key in elements) {
    var item = elements[key]
    if (item.item) {
      addTab(htmlContainer, item, layer);
    } else if (item.folder) {
      var htmlFolder = addFolder(htmlContainer, item.folderID, item.name, item.open, layer)
      displayElements(item.elements, htmlFolder.children[1], layer + 1)
      setChildrenVisible(item.open, htmlFolder.children)
    }
  }
}


function getElementByTabID(id) {
  var childs = document.getElementById("list").children
  for (let i = 0; i < childs.length; i++) {
    var child = childs[i]
    if (isItem(child)) {
      if (child.tabID == id) return child
    }
  }
}

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

//#region click handler
function folderClick(e) {
  if (isFolder(e.originalTarget)) {
    var folder = e.originalTarget
    var open = folder.open
    folder.open = !open
    dataHandler.getFolderJSONObjectByID(folder.folderID, data).open = folder.open
    var childs = folder.children
    if (open) {
      folder.children[0].classList.add("rotated")
      folder.classList.add("closed")
      setChildrenVisible(false, childs)
    }
    else {
      folder.children[0].classList.remove("rotated")
      folder.classList.remove("closed")
      setChildrenVisible(true, childs)
    }
    dataHandler.saveDataInFirefox(data)
  }
}

async function itemClick(e) {
  var tabElement = e.originalTarget
  var tab = await browser.tabs.get(tabElement.tabID)
  var currentTab = tabHelper.getCurrentTab();
  var tabID = tabElement.tabID
  if (!tab.pinned) {
    if (!tabElement.hiddenTab) {
      if (await tabHelper.tabExists(tabID)) {
        if (await tabHelper.hideTab(tabID)) {
          tabElement.hiddenTab = true;
          tabElement.classList.add("tabHidden")
        }
      }
    }
    else {
      if (await tabHelper.tabExists(tabID))
        if (!(await tabHelper.showTab(tabID))) {
          tabHelper.createTab(tabElement.url)
        }
      tabHelper.focusTab(tabID)
      tabElement.hiddenTab = false;
      tabElement.classList.remove("tabHidden")
    }
  } else {
    tabHelper.focusTab(tabID)
  }
}

//#endregion

function setChildrenVisible(value, childs) {
  if (value) childs[1].classList.remove("disabled")
  else childs[1].classList.add("disabled")
}

function isFolder(element) {
  return element.isFolder == true
}

function isItem(element) {
  return element.isItem == true
}

//#region add HTML elements (loading things from json data)
function addFolder(htmlParent, id, name, opened, tier) {
  var folderDiv = document.createElement("div")
  folderDiv.folderID = id
  folderDiv.isFolder = true
  folderDiv.open = opened
  folderDiv.style.marginLeft = tier * 4 + "px"
  var imgNode = document.createElement("img")
  imgNode.src = "../icons/arrow_down-256.png"
  imgNode.id = "image"
  imgNode.classList.add("arrow")
  if (!opened) imgNode.classList.add("rotated")
  folderDiv.appendChild(imgNode)
  var textNode = document.createTextNode(name)
  folderDiv.appendChild(textNode)
  folderDiv.onclick = folderClick

  var childContainer = document.createElement("div")
  folderDiv.appendChild(childContainer)
  folderDiv.draggable = true
  folderDiv.addEventListener("dragstart", dragstart_handler)
  folderDiv.addEventListener("drop", drop_handler)
  folderDiv.addEventListener("dragover", dragover_handler)
  folderDiv.addEventListener("dropend", dropend_handler)
  htmlParent.appendChild(folderDiv)

  return folderDiv
}

function addTab(folderDiv, tab, tier) {
  var itemNode = document.createElement("div")
  itemNode.tabID = tab.tabID
  itemNode.url = tab.url
  itemNode.title = tab.title
  itemNode.favIconUrl = tab.favIconURL
  if (!tab.pinned)
    itemNode.onclick = itemClick
  else
    itemNode.ondblclick = itemClick
  itemNode.hiddenTab = tab.hidden
  if (tab.hidden) itemNode.classList.add("tabHidden")
  itemNode.style.marginLeft = tier * 4 + "px"
  var iconNode = document.createElement("img")
  iconNode.src = tab.favIconURL
  iconNode.classList.add("favicon");
  itemNode.appendChild(iconNode)
  var titleNode = document.createTextNode(tab.title)
  itemNode.appendChild(titleNode)
  itemNode.classList.add("overflow")
  itemNode.classList.add("listItem")
  itemNode.draggable = true
  itemNode.addEventListener("dragstart", dragstart_handler)
  itemNode.addEventListener("dropend", dropend_handler)
  folderDiv.appendChild(itemNode)
  return itemNode
}
//#endregion

function clearStruct() {
  data.elements = []
  dataHandler.saveDataInFirefox(data)
}

function reloadExtension() {
  browser.runtime.reload()
}