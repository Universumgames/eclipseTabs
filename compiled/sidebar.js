var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as dataHandler from './dataHandler.js';
import * as tabHelper from './tabHelper.js';
import * as helper from './helper.js';
var dragging;
var draggingJSON;
const folderChildImageIndex = 0;
const folderChildItemListIndex = 2;
const folderChildTextIndex = 1;
var data = { elements: [], folderID: "-1", name: "root", open: true, parentFolderID: "-1" };
const listContainer = document.getElementById("list");
const structCleaner = document.getElementById("structCleaner");
const structReloader = document.getElementById("structReloader");
const extensionReloader = document.getElementById("extensioReloader");
const addFolderNameInputContainer = document.getElementById("addFolderNameInputContainer");
const addFolderNameInput = document.getElementById("addFolderNameInput");
const addFolderBtn = document.getElementById("addFolder");
const trashcan = document.getElementById("delete");
browser.runtime.onStartup.addListener(startup);
browser.runtime.onUpdateAvailable.addListener(handleUpdateAvailable);
document.addEventListener("DOMContentLoaded", () => setup());
function handleUpdateAvailable() {
    console.log(details.version);
    browser.runtime.reload();
}
function startup() {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield dataHandler.getDataStructFromFirefox();
        tabHelper.getTabs().then((tabs) => {
            console.log(tabs);
            dataHandler.updateTabsOnStartUp(data, tabs);
        });
        console.log("query");
    });
}
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        document.getElementById("emptyList").classList.add("disabled");
        document.getElementById("list").classList.remove("disabled");
        tabHelper.getTabs().then((tabs) => { loadFolderList(tabs); });
        browser.tabs.onActivated.addListener(refreshTabListOnActiveChange);
        browser.tabs.onUpdated.addListener(refreshTabListOnSiteUpdated);
        structCleaner.onclick = clearStruct_handler;
        structReloader.onclick = structReloader_handler;
        extensionReloader.onclick = extensionReloader_handler;
        addFolderBtn.onclick = addFolderClick_handler;
        addFolderNameInput.addEventListener("keyup", addFolderSubmit_handler);
        trashcan.addEventListener("dragstart", dragstart_handler);
        trashcan.addEventListener("dragover", dragover_handler);
        trashcan.addEventListener("dropend", dropend_handler);
        trashcan.addEventListener("dragend", dragend_handler);
        trashcan.addEventListener("dragenter", dragenter_handler);
        trashcan.addEventListener("dragleave", dragleave_handler);
        trashcan.addEventListener("drop", drop_handler);
        trashcan.setAttribute("isTrashCan", "true");
        var data = yield dataHandler.getDataStructFromFirefox();
        console.log(data);
        console.log(browser);
    });
}
function loadFirefoxData() {
    return __awaiter(this, void 0, void 0, function* () {
        var dataF = yield dataHandler.getDataStructFromFirefox();
        if (dataF != undefined)
            data.elements = dataF.elements;
    });
}
function tabClosed(event) {
    setup();
}
function dragstart_handler(event) {
    return __awaiter(this, void 0, void 0, function* () {
        dragging = event.target;
        if (isFolder(dragging))
            draggingJSON = dataHandler.getFolderJSONObjectByID(dragging.getAttribute("folderID"), (yield dataHandler.getDataStructFromFirefox()));
        else if (isItem(dragging))
            draggingJSON = dataHandler.getItemJSONObjectByItemID(dragging.getAttribute("itemID"), (yield dataHandler.getDataStructFromFirefox()).elements);
        event.target.classList.add("hover");
    });
}
function dragend_handler(event) {
    event.target.classList.remove("hover");
}
function dragenter_handler(event) {
    var target = event.target;
    if (target != dragging && isFolder(target)) {
        target.classList.add("hover");
    }
}
function dragleave_handler(event) {
    if (isFolder(event.target)) {
        event.target.classList.remove("hover");
    }
}
function dragover_handler(event) {
    event.preventDefault();
}
function drop_handler(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        var target = event.target;
        target.classList.remove("hover");
        dragging.classList.remove("hover");
        if (isFolder(target)) {
            if ('folderID' in draggingJSON) {
                yield dataHandler.moveFolder(draggingJSON.folderID, draggingJSON.parentFolderID, target.getAttribute("folderID"));
            }
            else if ('itemID' in draggingJSON) {
                yield dataHandler.moveItem(draggingJSON.itemID, draggingJSON.parentFolderID, target.getAttribute("folderID"));
            }
            triggerListReload();
        }
        else if (helper.toBoolean(target.getAttribute("isTrashCan"))) {
            if ('itemID' in draggingJSON) {
                if (draggingJSON.tabID != "-1")
                    tabHelper.closeTab(draggingJSON.tabID);
                dataHandler.removeItem(draggingJSON.itemID, draggingJSON.parentFolderID);
            }
            else if ('folderID' in draggingJSON) {
                dataHandler.removeFolder(draggingJSON.folderID, draggingJSON.parentFolderID);
            }
            triggerListReload();
        }
        dragging = undefined;
    });
}
function dropend_handler(event) {
    console.log(event);
}
function clearStruct_handler() {
    clearStruct();
}
function structReloader_handler() {
    setup();
}
function extensionReloader_handler() {
    reloadExtension();
}
function folderClick(e) {
    if (e.explicitOriginalTarget.localName == "div" && isFolder(e.originalTarget)) {
        var folder = e.originalTarget;
        var open = helper.toBoolean(folder.getAttribute("open"));
        folder.setAttribute("open", !open + "");
        dataHandler.getFolderJSONObjectByID(folder.getAttribute("folderID"), data).open = !open;
        var childs = folder.children;
        if (open) {
            folder.children[folderChildImageIndex].classList.add("rotated");
            folder.classList.add("closed");
            setChildrenVisible(false, childs);
        }
        else {
            folder.children[folderChildImageIndex].classList.remove("rotated");
            folder.classList.remove("closed");
            setChildrenVisible(true, childs);
        }
        dataHandler.saveDataInFirefox(data);
    }
}
function itemClick(e) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield dataHandler.getDataStructFromFirefox();
        var tabElement = e.originalTarget;
        var tabID = tabElement.getAttribute("tabID");
        var tabs = yield tabHelper.getTabByTabID(tabID);
        var tab = (yield tabHelper.tabExists(tabID)) ? tabs : { pinned: false };
        var itemID = tabElement.getAttribute("itemID");
        var jsonTab = dataHandler.getItemJSONObjectByItemID(itemID, data.elements);
        if (!tab.pinned) {
            if (!helper.toBoolean(tabElement.getAttribute("hiddenTab"))) {
                if ((yield tabHelper.tabExists(tabID)) && (yield tabHelper.hideTab(tabID))) {
                    tabElement.setAttribute("hiddenTab", true + "");
                    jsonTab.hidden = true;
                    tabElement.classList.add("tabHidden");
                }
            }
            else {
                if (yield tabHelper.tabExists(tabID)) {
                    if (!(yield tabHelper.showTab(tabID))) {
                        tabHelper.createTab(tabElement.getAttribute("url"));
                    }
                    tabHelper.focusTab(tabID);
                    tabElement.setAttribute("hiddenTab", false + "");
                    jsonTab.hidden = false;
                    tabElement.classList.remove("tabHidden");
                }
                else {
                    yield tabHelper.createTab(jsonTab.url);
                }
            }
            setup();
        }
        else {
            tabHelper.focusTab(tabID);
        }
        yield dataHandler.saveDataInFirefox(data);
    });
}
function refreshTabList() {
    return __awaiter(this, void 0, void 0, function* () {
        tabHelper.getTabs().then((tabs) => { loadFolderList(tabs); });
    });
}
function refreshTabListOnActiveChange(activeInfo) {
    refreshTabList();
}
function refreshTabListOnTabClosed(tabId, removeInfo) {
    refreshTabList();
}
function refreshTabListOnSiteUpdated(tabId, changeInfo, tabInfo) {
    if (changeInfo.status != undefined)
        refreshTabList();
}
function tabUpdateListener(tabId, changeInfo, tabInfo) {
    document.getElementById("list").innerHTML = "";
    browser.tabs.query({}).then((element) => { loadFolderList(element); }, (element) => console.error(element));
}
function addFolderClick_handler() {
    addFolderNameInputContainer.classList.remove("disabled");
}
function addFolderSubmit_handler(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (event.keyCode == 13) {
            event.preventDefault();
            var value = addFolderNameInput.getAttribute("value");
            dataHandler.addFolder("-1", (yield dataHandler.generateFolderID()).toString(), value);
            addFolderNameInput.setAttribute("value", "");
            addFolderNameInputContainer.classList.add("disabled");
            triggerListReload();
        }
    });
}
function folderRenameClick_handler(event) {
    if (event.explicitOriginalTarget.localName == "div") {
        var divContainer = event.originalTarget;
        if (divContainer.isFolder)
            divContainer.children[2].classList.toggle("disabled");
    }
}
function folderRenameSubmit_handler(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (event.keyCode == 13) {
            event.preventDefault();
            var value = event.originalTarget.value;
            var parent = event.originalTarget.parentNode;
            yield dataHandler.renameFolder(parent.folderID, value);
            triggerListReload();
        }
    });
}
function loadFolderList(tabs) {
    return __awaiter(this, void 0, void 0, function* () {
        yield loadFirefoxData();
        dataHandler.updateTabsOnStartUp(data, tabs);
        dataHandler.updateTabs(data.elements, tabs);
        console.log(data);
        dataHandler.saveDataInFirefox(data);
        displayHTMLList();
    });
}
function displayHTMLList() {
    return __awaiter(this, void 0, void 0, function* () {
        if (listContainer) {
            listContainer.innerHTML = "";
            displayElements(data.elements, listContainer, 1);
            var tabs = yield tabHelper.getTabs();
        }
    });
}
function displayElements(elements, htmlContainer, layer) {
    for (var key in elements) {
        var item = elements[key];
        if ('itemID' in item) {
            addTab(htmlContainer, item, layer);
        }
        else if ('folderID' in item) {
            var folder = item;
            var htmlFolder = addFolder(htmlContainer, folder.folderID, folder.name, folder.open, layer);
            displayElements(folder.elements, htmlFolder.children[folderChildItemListIndex], layer + 1);
            setChildrenVisible(folder.open, htmlFolder.children);
        }
    }
}
function addFolder(htmlParent, id, name, opened, tier) {
    var folderDiv = document.createElement("div");
    folderDiv.setAttribute("folderID", id);
    folderDiv.setAttribute("isFolder", "true");
    folderDiv.setAttribute("open", opened + "");
    folderDiv.style.marginLeft = tier * 4 + "px";
    var imgNode = document.createElement("img");
    imgNode.src = "../icons/arrow_down-256.png";
    imgNode.id = "image";
    imgNode.classList.add("arrow");
    imgNode.classList.add("noEvents");
    if (!opened) {
        imgNode.classList.add("rotated");
        folderDiv.classList.add("closed");
    }
    folderDiv.appendChild(imgNode);
    var textContainerNode = document.createElement("div");
    textContainerNode.classList.add("noEvents");
    textContainerNode.style.display = "inline";
    var textNode = document.createTextNode(name);
    textContainerNode.appendChild(textNode);
    folderDiv.appendChild(textContainerNode);
    var childContainer = document.createElement("div");
    folderDiv.appendChild(childContainer);
    if (id != "pinned" && id != "unordered") {
        var renameNode = document.createElement("input");
        renameNode.type = "text";
        renameNode.placeholder = "New Name";
        renameNode.classList.add("disabled");
        renameNode.addEventListener("keyup", folderRenameSubmit_handler);
        folderDiv.appendChild(renameNode);
        folderDiv.ondblclick = folderRenameClick_handler;
    }
    if (id != "pinned" && id != "unordered")
        folderDiv.draggable = true;
    folderDiv.addEventListener("dragstart", dragstart_handler);
    folderDiv.addEventListener("drop", drop_handler);
    folderDiv.addEventListener("dragover", dragover_handler);
    folderDiv.addEventListener("dropend", dropend_handler);
    folderDiv.addEventListener("dragend", dragend_handler);
    folderDiv.addEventListener("dragenter", dragenter_handler);
    folderDiv.addEventListener("dragleave", dragleave_handler);
    folderDiv.onclick = folderClick;
    htmlParent.appendChild(folderDiv);
    return folderDiv;
}
function addTab(folderDiv, tab, tier) {
    var itemNode = document.createElement("div");
    itemNode.setAttribute("tabID", tab.tabID);
    itemNode.setAttribute("itemID", tab.itemID);
    itemNode.setAttribute("url", tab.url);
    itemNode.setAttribute("title", tab.title);
    itemNode.setAttribute("favIconUrl", tab.favIconURL);
    itemNode.setAttribute("isItem", "true");
    if (tab.parentFolderID != "pinned")
        itemNode.onclick = itemClick;
    else
        itemNode.ondblclick = itemClick;
    itemNode.setAttribute("hiddenTab", tab.hidden + "");
    if (tab.hidden)
        itemNode.classList.add("tabHidden");
    itemNode.style.marginLeft = tier * 4 + "px";
    var iconNode = document.createElement("img");
    iconNode.src = tab.favIconURL;
    iconNode.classList.add("favicon");
    itemNode.appendChild(iconNode);
    var titleContainerNode = document.createElement("div");
    titleContainerNode.classList.add("noEvents");
    titleContainerNode.style.display = "inline";
    var titleNode = document.createTextNode(tab.title);
    titleContainerNode.appendChild(titleNode);
    itemNode.appendChild(titleContainerNode);
    itemNode.classList.add("overflow");
    itemNode.classList.add("listItem");
    itemNode.draggable = true;
    itemNode.addEventListener("dragstart", dragstart_handler);
    itemNode.addEventListener("dropend", dropend_handler);
    itemNode.addEventListener("dragend", dragend_handler);
    folderDiv.appendChild(itemNode);
    return itemNode;
}
function triggerListReload() {
    refreshTabList();
}
function clearStruct() {
    data.elements = [];
    dataHandler.saveDataInFirefox(data);
}
function reloadExtension() {
    browser.runtime.reload();
}
function setChildrenVisible(value, childs) {
    if (value)
        childs[folderChildItemListIndex].classList.remove("disabled");
    else
        childs[folderChildItemListIndex].classList.add("disabled");
}
function isFolder(element) {
    return (element.getAttribute("isFolder") != undefined && element.getAttribute("isFolder"));
}
function isItem(element) {
    return element.getAttribute("isItem");
}
//# sourceMappingURL=sidebar.js.map