function setupDisplay() {
  document.getElementById("emptyList").classList.add("disabled")
  document.getElementById("list").classList.remove("disabled")
}

//#region tab functions
function hideTab(id) {
  if (id != undefined) {
    console.log(`hide ${id}`)
    return browser.tabs.hide(id)
  }
}

function showTab(id) {
  if (id != undefined) {
    console.log(`show ${id}`)
    return browser.tabs.show(id)
  }
}

function focusTab(id) {
  browser.tabs.update(id, { active: true })
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
//#endregion

//#region refresh list listener

function refreshTabList() {
  document.getElementById("list").innerHTML = ""
  browser.tabs.query({}).then((element) => { loadFolderList(element) }, (element) => console.error(element))
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
  /*console.log(changeInfo)
  var tab = getElementByTabID(tabId)
  tab.url = (changeInfo.url != undefined) ? changeInfo.url : tab.url
  var oldTitle = tab.title
  tab.title = (changeInfo.title != undefined) ? changeInfo.title : tab.title
  tab.innerHTML = tab.innerHTML.replace(oldTitle, tab.title)*/
  //console.log(tab)
  //shitty
  //browser.runtime.reload()
}

//#endregion

function folderClick(e) {

  console.log(e)
  console.log(e.originalTarget)
  console.log(e.originalTarget.open)
  console.log(isFolder(e.originalTarget))
  if (isFolder(e.originalTarget)) {
    var folder = e.originalTarget
    var open = folder.open
    folder.open = !open
    var childs = folder.children
    if (open) {
      folder.children[0].classList.add("rotated")
      folder.classList.add("closed")
      for (let i = 1; i < childs.length; i++) {
        childs[i].classList.add("disabled")
      }
    }
    else {
      folder.children[0].classList.remove("rotated")
      folder.classList.remove("closed")
      for (let i = 1; i < childs.length; i++) {
        childs[i].classList.remove("disabled")
      }
    }

  }
}

function itemClick(e) {
  console.log(e)
  if (!e.originalTarget.hiddenTab) {
    e.originalTarget.hiddenTab = true;
    hideTab(e.originalTarget.tabID).then(() => console.log("hidden"), (e) => console.error(e))
  }
  else {
    e.originalTarget.hiddenTab = false;
    showTab(e.originalTarget.tabID).then(() => focusTab(e.originalTarget.tabID), (e) => console.error(e))
  }
}

function isFolder(element) {
  return element.isFolder == true
}

function isItem(element) {
  return element.isItem == true
}

function addFolder(parent, id, name, opened, tier) {
  var folderDiv = document.createElement("div")
  folderDiv.folderID = id
  folderDiv.isFolder = true
  folderDiv.open = opened
  folderDiv.style.marginLeft = tier * 4 + "px"
  var imgNode = document.createElement("img")
  imgNode.src = "../icons/arrow_down-128.png"
  imgNode.id = "image"
  imgNode.classList.add("arrow")
  if(!opened) imgNode.classList.add("rotated")
  folderDiv.appendChild(imgNode)
  var textNode = document.createTextNode(name)
  folderDiv.appendChild(textNode)
  folderDiv.onclick = folderClick

  parent.appendChild(folderDiv)

  return folderDiv
}

function addTab(folderDiv, tab, tier) {
  var itemNode = document.createElement("div")
  itemNode.tabID = tab.id
  itemNode.isItem = true
  itemNode.url = tab.url
  itemNode.title = tab.title
  itemNode.favIconUrl = tab.favIconUrl
  itemNode.onclick = itemClick
  itemNode.style.marginLeft = tier * 4 + "px"
  var iconNode = document.createElement("img")
  iconNode.src = tab.favIconUrl
  iconNode.classList.add("favicon");
  itemNode.appendChild(iconNode)
  var titleNode = document.createTextNode(tab.title)
  itemNode.appendChild(titleNode)
  itemNode.classList.add("overflow")
  itemNode.classList.add("listItem")
  folderDiv.appendChild(itemNode)
}



function loadFolderList(tabs) {
  var listContainer = document.getElementById("list")
  if (listContainer && tabs) {
    var pinFolder = addFolder(listContainer, "pinned", "Pinned Tabs", true, 1)
    tabs.forEach(element => {
      if (element.pinned)
        addTab(pinFolder, element, 2)
      else
        addTab(listContainer, element, 1)
    });
    /*console.log(tabs)
    console.log(tabs[40])
    console.log(tabs[40].id)
    hideTab(tabs[40].id).then(()=>console.log("hidden"), (e)=>console.error(e))
    console.log(tabs[40])
    showTab(tabs[40].id).then(()=>console.log("show"), (e)=>console.error(e))*/
  } else {
    console.error("List container not exisiting or tabs could not be loaded")
  }
}

//#region init code

//on sidepanel fully loaded

document.addEventListener("DOMContentLoaded", function (event) {
  setupDisplay()



  browser.tabs.query({}).then((element) => { loadFolderList(element) }, (element) => console.error(element))
  browser.tabs.onActivated.addListener(refreshTabListOnActiveChange)
  //browser.tabs.onRemoved.addListener(refreshTabListOnTabClosed)
  browser.tabs.onUpdated.addListener(refreshTabListOnSiteUpdated)
  var array = { "test": "hallo" }
  browser.storage.sync.set({ array }).then(() => console.log("ok"))
  var returnVal = browser.storage.sync.get("array").then((e) => console.log(e))
});
//#endregion