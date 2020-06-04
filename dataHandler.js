export const updateHTMLEvent = new Event('updateHTMLList')

export function updatePinnedFolderList(elements, tabs) {
  var pinnedFolder = {}
  pinnedFolder.item = false
  pinnedFolder.folder = true
  pinnedFolder.name = "Pinned Tabs"
  pinnedFolder.open = (elements[0] == undefined || elements[0].open == undefined) ? true : elements[0].open
  pinnedFolder.folderID = 0
  pinnedFolder.elements = []
  tabs.forEach(tab => {
    if (tab.pinned) {
      var storedTab = {}
      storedTab.item = true
      storedTab.folder = false
      storedTab.hidden = tab.hidden
      storedTab.tabExists = true
      storedTab.tabID = tab.id
      storedTab.url = tab.url
      storedTab.favIconURL = tab.favIconUrl
      storedTab.title = tab.title
      pinnedFolder.elements.push(storedTab)
    }
  })
  elements[0] = pinnedFolder
}

export async function addFolder(parentID, newFolderID, name) {
  var data = await getDataStructFromFirefox()
  var parentFolder = getFolderJSONObjectByID(parentID, data)
  var folder = {}
  folder.item = false
  folder.folder = true
  folder.open = true
  folder.name = name
  folder.elements = []
  folder.folderID = newFolderID
  console.log(parentFolder)
  parentFolder.elements.push(folder)
  await saveDataInFirefox(data)
  return folder
}

export async function addTab(folderID, title, url, favIconURL, tabExists, tabID, hidden) {
  var data = await getDataStructFromFirefox()
  var folder = getFolderJSONObjectByID(folderID, data)
  var item = {}
  item.folder = false
  item.item = true
  item.hidden = hidden
  item.tabID = tabID
  item.title = title
  item.url = url
  item.favIconURL = favIconURL
  item.tabExists = tabExists
  folder.elements.push(item)
  await saveDataInFirefox(data)
  return item
}

export function getFolderJSONObjectByID(id, data) {
  if(id == -1) return data
  return getFolderJSONObjectByIDRecursion(id, data.elements)
}

export function getFoldersInFolder(folder) {
  var folderArr = []
  folder.elements.forEach((item) => {
    if (item.folder) folderArr.push(item)
  })
  return folderArr
}

function getFolderJSONObjectByIDRecursion(id, folder) {
  var returnval = {}
  folder.forEach(element => {
    if (element.folder) {
      if (element.folderID == id) returnval = element
      else returnval = getFolderJSONObjectByIDRecursion(id, element.elements)
    }
  })
  return returnval
}

export function saveDataInFirefox(data) {
  return browser.storage.local.set({ data })
}

export function getFirefoxStructFromFirefox() {
  return browser.storage.local.get("data")
}

export async function getDataStructFromFirefox() {
  return (await getFirefoxStructFromFirefox()).data
}

export async function getActiveTab() {
  return (await browser.tabs.query({ currentWindow: true, active: true }))[0]
}

export function getCurrentWindowTabs() {
  return browser.tabs.query({ currentWindow: true });
}

export async function generateFolderID() {
  var collectedFolders = 0
  var data = await getDataStructFromFirefox()
  return getNumberOfFoldersAlreadyExisting(data.elements)
}

function getNumberOfFoldersAlreadyExisting(folderContainer) {
  var number = 0
  folderContainer.forEach(item => {
    if (item.folder) {
      number++
      number += getNumberOfFoldersAlreadyExisting(item.elements)
    }
  })
  return number
}
