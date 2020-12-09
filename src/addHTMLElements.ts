import { itemData, folderData } from './interfaces.js'

export interface addHTMLhandler {
    folderRenameSubmit_handler: any,
    folderRenameClick_handler: any,
    dragstart_handler: any,
    drop_handler: any,
    dragover_handler: any,
    dropend_handler: any,
    dragend_handler: any,
    dragenter_handler: any,
    dragleave_handler: any,
    folderClick: any,
    itemClick: any,
    clearStruct_handler: any,
    structReloader_handler: any,
    extensionReloader_handler: any,
    addFolderClick_handler: any,
    addFolderSubmit_handler: any
}

export function addFolder(htmlParent: HTMLElement, folder: folderData, tier: number, handler: addHTMLhandler) {
    var folderDiv = document.createElement("div")
    folderDiv.setAttribute("folderID", folder.folderID)
    folderDiv.setAttribute("isFolder", "true")
    folderDiv.setAttribute("open", folder.open + "")
    folderDiv.setAttribute("index", folder.index + "")
    folderDiv.style.marginLeft = tier * 4 + "px"

    var imgNode = document.createElement("img")
    imgNode.src = "../icons/arrow_down-256.png"
    imgNode.id = "image"
    imgNode.classList.add("arrow")
    imgNode.classList.add("noEvents")
    if (!folder.open) {
        imgNode.classList.add("rotated")
        folderDiv.classList.add("closed")
    }
    folderDiv.appendChild(imgNode)

    var textContainerNode = document.createElement("div")
    textContainerNode.classList.add("noEvents")
    textContainerNode.style.display = "inline"
    var textNode = document.createTextNode(folder.name)
    textContainerNode.appendChild(textNode)
    folderDiv.appendChild(textContainerNode)

    var childContainer = document.createElement("div")
    folderDiv.appendChild(childContainer)



    //rename functionality
    if (folder.folderID != "pinned" && folder.folderID != "unordered") {
        var renameNode = document.createElement("input")
        renameNode.type = "text"
        renameNode.placeholder = "New Name"
        renameNode.classList.add("disabled")
        renameNode.addEventListener("keyup", handler.folderRenameSubmit_handler)
        folderDiv.appendChild(renameNode)
        folderDiv.ondblclick = handler.folderRenameClick_handler
    }

    //eventhandler
    //draggable
    if (folder.folderID != "pinned" && folder.folderID != "unordered") folderDiv.draggable = true
    folderDiv.addEventListener("dragstart", handler.dragstart_handler)
    folderDiv.addEventListener("drop", handler.drop_handler)
    folderDiv.addEventListener("dragover", handler.dragover_handler)
    folderDiv.addEventListener("dropend", handler.dropend_handler)
    folderDiv.addEventListener("dragend", handler.dragend_handler)
    folderDiv.addEventListener("dragenter", handler.dragenter_handler)
    folderDiv.addEventListener("dragleave", handler.dragleave_handler)
    //on click
    folderDiv.onclick = handler.folderClick

    htmlParent.appendChild(folderDiv)

    return folderDiv
}

export function addTab(folderDiv: HTMLElement, tab: itemData, tier: number, handler: addHTMLhandler) {
    var itemNode = document.createElement("div")
    itemNode.setAttribute("tabID", tab.tabID)
    itemNode.setAttribute("itemID", tab.itemID)
    itemNode.setAttribute("url", tab.url)
    itemNode.setAttribute("title", tab.title)
    itemNode.setAttribute("favIconUrl", tab.favIconURL)
    itemNode.setAttribute("isItem", "true")
    itemNode.setAttribute("index", tab.index + "")
    if (tab.parentFolderID != "pinned")
        itemNode.onclick = handler.itemClick
    else
        itemNode.ondblclick = handler.itemClick
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
    itemNode.addEventListener("dragstart", handler.dragstart_handler)
    itemNode.addEventListener("dropend", handler.dropend_handler)
    itemNode.addEventListener("dragend", handler.dragend_handler)
    folderDiv.appendChild(itemNode)
    return itemNode
}

function createInbetween(element: itemData | folderData, handler: addHTMLhandler): HTMLElement {
    var inbetween = document.createElement("div");
    inbetween.setAttribute("isInbetween", "true");
    if (element)
        return new HTMLElement();
}