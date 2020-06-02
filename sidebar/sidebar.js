function setupDisplay(){
  document.getElementById("emptyList").classList.add("disabled")
  document.getElementById("list").classList.remove("disabled")
}

function folderClick(e){
  console.log(e)
  console.log(e.originalTarget)
  console.log(e.originalTarget.attributes)
  console.log(e.originalTarget.attributes.id)
  console.log(e.originalTarget.attributes.id.value)
  console.log(e.originalTarget.attributes.open)
  //console.log(e.originalTarget.attributes.open.value)
}

function isFolder(element){
  return element.isFolder == true
}

function addFolder(parent, id, name, opened){
  var folderDiv = document.createElement("div")
  folderDiv.id = id
  folderDiv.isFolder = true
  folderDiv.open = opened
  var textNode = document.createTextNode(name)
  folderDiv.appendChild(textNode)
  folderDiv.onclick = folderClick
  parent.appendChild(folderDiv)

  return folderDiv
}

function addLink(folderDiv, id, title, url, favIconUrl){
  var itemNode = document.createElement("div")
  itemNode.id = id
  itemNode.item = true;
  itemNode.url = url;
  itemNode.title = title;
  itemNode.
}



function loadFolderList(tabs){
  var listContainer = document.getElementById("list")
  if(listContainer && tabs){

    tabs.forEach(element => {
      addFolder(listContainer, element.id, element.title, true)
    });
    
  }else{
    console.error("List container not exisiting or tabs could not be loaded")
  }
}




document.addEventListener("DOMContentLoaded", function (event) {
  setupDisplay()

  browser.tabs.query({}).then((element)=>{loadFolderList(element)}, (element)=>console.error(element))
});