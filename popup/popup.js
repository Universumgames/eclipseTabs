import * as dataHandler from "../dataHandler.js"

const data = {}
const selectFolderToAddTab = document.getElementById("selectFolderToAddTab")
const selectParentFolderToAddFolder = document.getElementById("selectParentFolderToAddFolder")
const addTabToFolderButton = document.getElementById("addTabToFolderButton")
const addFolderButton = document.getElementById("addFolderButton")
const addFolderInputtName = document.getElementById("foldername")

document.addEventListener("DOMContentLoaded", () => setup())

function setup() {
  dataHandler.getDataStructFromFirefox().then((data) => setup2(data))
  addTabToFolderButton.onclick = onAddTabClick
  addFolderButton.onclick = onAddFolderClick
}

function setup2(data) {
  //data = newData
  //console.log(newData)
  var ele = data.elements
  /*struct.forEach(folder => {
    var childFolders = dataHandler.getFoldersInFolder(folder)

    console.log(childFolders)

  })*/
  addFoldersInSelectFolderTab(ele, selectFolderToAddTab, 1)
  var baseArr = []
  var baseDir = {}
  baseDir.name = "Root"
  baseDir.folder = true
  baseDir.folderID = -1
  baseDir.elements = []
  baseArr.push(baseDir)
  addFoldersInAddFoldersTab(baseArr, selectParentFolderToAddFolder, 1)
  //copyStruct.unshift(baseDir)
  addFoldersInAddFoldersTab(ele, selectParentFolderToAddFolder, 1)
}

function addFoldersInAddFoldersTab(items, htmlStorageObj, layer) {
  items.forEach(item => {
    if (item.folder && item.folderID != 0) {
      var folder = item
      var childItems = dataHandler.getFoldersInFolder(folder)
      var optionNode = document.createElement("option")
      var textNode = document.createTextNode(folder.name)
      optionNode.appendChild(textNode)
      optionNode.folderID = folder.folderID
      optionNode.style.marginLeft = layer * 4 + "px"
      htmlStorageObj.appendChild(optionNode)
      addFoldersInAddFoldersTab(childItems, htmlStorageObj, layer + 1)
    }
  })
}

function addFoldersInSelectFolderTab(items, htmlStorageObj, layer) {
  items.forEach(item => {
    if (item.folder && item.folderID != 0) {
      var folder = item
      var childItems = dataHandler.getFoldersInFolder(folder)
      var optionNode = document.createElement("option")
      var textNode = document.createTextNode(folder.name)
      optionNode.appendChild(textNode)
      optionNode.folderID = folder.folderID
      optionNode.style.marginLeft = layer * 4 + "px"
      htmlStorageObj.appendChild(optionNode)
      addFoldersInSelectFolderTab(childItems, htmlStorageObj, layer + 1)
    }
  })
}

async function onAddTabClick(e) {
  var folderID = selectFolderToAddTab.selectedOptions[0].folderID
  var tab = await dataHandler.getActiveTab()
  await dataHandler.addTab(folderID, tab.title, tab.url, tab.favIconUrl, true, tab.id, false)
  browser.tabs.reload()
}

async function onAddFolderClick(e){
  var parentFolderID = selectParentFolderToAddFolder.selectedOptions[0].folderID
  var foldername = addFolderInputtName.value
  var folderID = await dataHandler.generateFolderID()
  console.log(folderID)
  await dataHandler.addFolder(parentFolderID, folderID, foldername)
  browser.tabs.reload
}