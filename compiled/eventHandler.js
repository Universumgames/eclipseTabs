var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as sidebar from './sidebar.js';
import * as tabHelper from './tabHelper.js';
export function dragstart_handler(event) {
    return __awaiter(this, void 0, void 0, function* () {
        sidebar.dragging = event.target;
        HTMLElement;
        if (isFolder(dragging))
            draggingJSON = dataHandler.getFolderJSONObjectByID(dragging.getAttribute("folderID"), (yield dataHandler.getDataStructFromFirefox()));
        else if (isItem(dragging))
            draggingJSON = dataHandler.getItemJSONObjectByItemID(dragging.getAttribute("itemID"), (yield dataHandler.getDataStructFromFirefox()).elements);
        event.target.classList.add("hover");
    });
}
export function dragend_handler(event) {
    event.target.classList.remove("hover");
}
export function dragenter_handler(event) {
    var target = event.target;
    if (target != dragging && isFolder(target)) {
        target.classList.add("hover");
    }
}
export function dragleave_handler(event) {
    if (isFolder(event.target)) {
        event.target.classList.remove("hover");
    }
}
export function dragover_handler(event) {
    event.preventDefault();
}
export function drop_handler(event) {
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
export function dropend_handler(event) {
    console.log(event);
}
export function clearStruct_handler() {
    clearStruct();
}
export function structReloader_handler() {
    setup();
}
export function extensionReloader_handler() {
    reloadExtension();
}
export function folderClick(e) {
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
export function itemClick(e) {
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
//# sourceMappingURL=eventHandler.js.map