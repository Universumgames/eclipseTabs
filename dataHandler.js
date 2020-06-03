export function updatePinnedFolderList(structure, tabs){
  var pinnedFolders = {}
  pinnedFolders.item = false
  pinnedFolders.folder = true
  pinnedFolders.name = "Pinned Tabs"
  pinnedFolders.open = true
  pinnedFolders.elements = []
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
      pinnedFolders.elements[storedTab.title] = storedTab
    }
  })
  structure.pinnedFolders = pinnedFolders
}

export function saveDataInFirefox(data){
  return browser.storage.local.set({data})
}

export function getDataFromFirefox(){
  return browser.storage.local.get("data")
}
