var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as htmlAdder from './addHTMLElements.js';
import * as tabHelper from './tabHelper.js';
import * as helper from './helper.js';
import * as firefoxHandler from './firefoxHandler.js';
import { addFolder, createEmptyData, generateFolderID, getDataStructFromFirefox, getFolderJSONObjectByID, getItemJSONObjectByItemID, moveFolder, moveItem, removeFolder, removeItem, renameFolder, saveDataInFirefox, updateTabs, updateTabsOnStartUp } from './dataHandler/importer.js';
export var addHTMLHandler = {
    folderRenameSubmit_handler: folderRenameSubmit_handler,
    folderRenameClick_handler: folderRenameClick_handler,
    dragstart_handler: dragstart_handler,
    drop_handler: drop_handler,
    dragover_handler: dragover_handler,
    dropend_handler: dropend_handler,
    dragend_handler: dragend_handler,
    dragenter_handler: dragenter_handler,
    dragleave_handler: dragleave_handler,
    folderClick: folderClick,
    itemClick: itemClick,
    clearStruct_handler: clearStruct_handler,
    structReloader_handler: structReloader_handler,
    extensionReloader_handler: extensionReloader_handler,
    addFolderClick_handler: addFolderClick_handler,
    addFolderSubmit_handler: addFolderSubmit_handler
};
var firefoxHandlerStruct = {
    refreshTabListOnActiveChange: refreshTabListOnActiveChange,
    refreshTabListOnSiteUpdated: refreshTabListOnSiteUpdated
};
var dragging;
var draggingJSON;
const folderChildImageIndex = 0;
const folderChildItemListIndex = 2;
const folderChildTextIndex = 1;
const listContainer = document.getElementById("list");
const structCleaner = document.getElementById("structCleaner");
const structReloader = document.getElementById("structReloader");
const extensionReloader = document.getElementById("extensioReloader");
const addFolderNameInputContainer = document.getElementById("addFolderNameInputContainer");
const addFolderNameInput = document.getElementById("addFolderNameInput");
const addFolderBtn = document.getElementById("addFolder");
const trashcan = document.getElementById("delete");
var setup;
export function setupHandler(setupFun) {
    setup = setupFun;
    firefoxHandler.registerListener(firefoxHandlerStruct);
    document.getElementById("emptyList").classList.add("disabled");
    document.getElementById("list").classList.remove("disabled");
    structCleaner.onclick = addHTMLHandler.clearStruct_handler;
    structReloader.onclick = addHTMLHandler.structReloader_handler;
    extensionReloader.onclick = addHTMLHandler.extensionReloader_handler;
    addFolderBtn.onclick = addHTMLHandler.addFolderClick_handler;
    addFolderNameInput.addEventListener("keyup", addHTMLHandler.addFolderSubmit_handler);
    trashcan.addEventListener("dragstart", addHTMLHandler.dragstart_handler);
    trashcan.addEventListener("dragover", addHTMLHandler.dragover_handler);
    trashcan.addEventListener("dropend", addHTMLHandler.dropend_handler);
    trashcan.addEventListener("dragend", addHTMLHandler.dragend_handler);
    trashcan.addEventListener("dragenter", addHTMLHandler.dragenter_handler);
    trashcan.addEventListener("dragleave", addHTMLHandler.dragleave_handler);
    trashcan.addEventListener("drop", addHTMLHandler.drop_handler);
    trashcan.setAttribute("isTrashCan", "true");
}
function dragstart_handler(event) {
    return __awaiter(this, void 0, void 0, function* () {
        dragging = event.target;
        if (helper.isFolder(dragging))
            draggingJSON = getFolderJSONObjectByID(dragging.getAttribute("folderID"), (yield getDataStructFromFirefox()));
        else if (helper.isItem(dragging))
            draggingJSON = getItemJSONObjectByItemID(dragging.getAttribute("itemID"), (yield getDataStructFromFirefox()).elements);
        event.target.classList.add("hover");
    });
}
function dragend_handler(event) {
    event.target.classList.remove("hover");
}
function dragenter_handler(event) {
    var target = event.target;
    if (target != dragging && helper.isFolder(target)) {
        target.classList.add("hover");
    }
}
function dragleave_handler(event) {
    if (helper.isFolder(event.target)) {
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
        if (helper.isFolder(target)) {
            if ('folderID' in draggingJSON) {
                yield moveFolder(draggingJSON.folderID, draggingJSON.parentFolderID, target.getAttribute("folderID"));
            }
            else if ('itemID' in draggingJSON) {
                yield moveItem(draggingJSON.itemID, draggingJSON.parentFolderID, target.getAttribute("folderID"));
            }
            triggerListReload();
        }
        else if (helper.toBoolean(target.getAttribute("isTrashCan"))) {
            if ('itemID' in draggingJSON) {
                if (draggingJSON.tabID != "-1")
                    tabHelper.closeTab(draggingJSON.tabID);
                yield removeItem(draggingJSON.itemID, draggingJSON.parentFolderID);
            }
            else if ('folderID' in draggingJSON) {
                yield removeFolder(draggingJSON.folderID, draggingJSON.parentFolderID);
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
    return __awaiter(this, void 0, void 0, function* () {
        clearStruct();
    });
}
function structReloader_handler() {
    setup();
}
function extensionReloader_handler() {
    helper.reloadExtension();
}
function folderClick(e) {
    return __awaiter(this, void 0, void 0, function* () {
        if (e.explicitOriginalTarget.localName == "div" && helper.isFolder(e.originalTarget)) {
            var HTMLFolder = e.originalTarget;
            var opened = helper.toBoolean(HTMLFolder.getAttribute("open"));
            var data = yield getDataStructFromFirefox();
            var dataObj = getFolderJSONObjectByID(HTMLFolder.getAttribute("folderID"), data);
            dataObj.open = !dataObj.open;
            var newOpened = dataObj.open;
            HTMLFolder.setAttribute("open", newOpened + "");
            var childs = HTMLFolder.children;
            if (newOpened) {
                HTMLFolder.children[folderChildImageIndex].classList.add("rotated");
                HTMLFolder.classList.add("closed");
                setChildrenVisible(false, childs);
            }
            else {
                HTMLFolder.children[folderChildImageIndex].classList.remove("rotated");
                HTMLFolder.classList.remove("closed");
                setChildrenVisible(true, childs);
            }
            yield saveDataInFirefox(data);
            triggerListReload();
        }
    });
}
function itemClick(e) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield getDataStructFromFirefox();
        var tabElement = e.originalTarget;
        var tabID = tabElement.getAttribute("tabID");
        var tabs = yield tabHelper.getTabByTabID(tabID);
        var tab = (yield tabHelper.tabExists(tabID)) ? tabs : { pinned: false };
        var itemID = tabElement.getAttribute("itemID");
        var jsonTab = getItemJSONObjectByItemID(itemID, data.elements);
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
        yield saveDataInFirefox(data);
    });
}
function addFolderClick_handler() {
    addFolderNameInputContainer.classList.remove("disabled");
}
function addFolderSubmit_handler(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (event.keyCode == 13) {
            event.preventDefault();
            var value = addFolderNameInput.value;
            yield addFolder("-1", (yield generateFolderID()).toString(), value);
            addFolderNameInput.value = "";
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
            yield renameFolder(parent.folderID, value);
            triggerListReload();
        }
    });
}
function refreshTabList() {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield getDataStructFromFirefox();
        tabHelper.getTabs().then((tabs) => { loadFolderList(tabs, data); });
    });
}
function refreshTabListOnActiveChange(activeInfoa) {
    refreshTabList();
}
function refreshTabListOnTabClosed(tabId, removeInfo) {
    refreshTabList();
}
function refreshTabListOnSiteUpdated(tabId, changeInfo, tabInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (changeInfo.status != undefined)
            refreshTabList();
    });
}
function tabUpdateListener(tabId, changeInfo, tabInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        document.getElementById("list").innerHTML = "";
        var data = yield getDataStructFromFirefox();
        firefoxHandler.tabQuery({}).then((element) => { loadFolderList(element, data); }, (element) => console.error(element));
    });
}
export function loadFolderList(tabs, data) {
    return __awaiter(this, void 0, void 0, function* () {
        updateTabsOnStartUp(data, tabs);
        updateTabs(data.elements, tabs);
        console.log(data);
        saveDataInFirefox(data);
        displayHTMLList(data);
    });
}
function displayHTMLList(data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (listContainer) {
            listContainer.innerHTML = "";
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
            htmlAdder.addTab(htmlContainer, item, layer, addHTMLHandler);
        }
        else if ('folderID' in item) {
            var folder = item;
            var htmlFolder = htmlAdder.addFolder(htmlContainer, folder, layer, addHTMLHandler);
            displayElements(folder.elements, htmlFolder.children[folderChildItemListIndex], layer + 1);
            setChildrenVisible(folder.open, htmlFolder.children);
        }
    }
}
function triggerListReload() {
    refreshTabList();
}
function clearStruct() {
    saveDataInFirefox(createEmptyData());
}
function setChildrenVisible(value, childs) {
    if (value)
        childs[folderChildItemListIndex].classList.remove("disabled");
    else
        childs[folderChildItemListIndex].classList.add("disabled");
}
function tabClosed(event) {
    setup();
}
function loadFirefoxData() {
    return __awaiter(this, void 0, void 0, function* () {
        var dataF = yield getDataStructFromFirefox();
        if (dataF != undefined)
            return dataF;
        return undefined;
    });
}
//# sourceMappingURL=handler.js.map