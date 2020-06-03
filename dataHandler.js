export function updatePinnedFolderList(structure, tabs){
  var pinnedFolder = {}
  pinnedFolder.item = false
  pinnedFolder.folder = true
  pinnedFolder.name = "Pinned Tabs"
  pinnedFolder.open = (structure[0] == undefined || structure[0].open == undefined)? true: structure[0].open
  pinnedFolder.folderID = 0
  pinnedFolder.elements = []
  tabs.forEach(tab => {
    if(tab.pinned){
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
  structure[0] = pinnedFolder
}

export function saveDataInFirefox(data){
  return browser.storage.local.set({data})
}

export function getDataFromFirefox(){
  return browser.storage.local.get("data")
}
