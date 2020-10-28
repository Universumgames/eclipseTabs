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
import * as handler from './handler.js';
import * as firefoxHandler from './firefoxHandler.js';
var data = { elements: [], folderID: "-1", name: "root", open: true, parentFolderID: "-1" };
var firefoxStartHandler = {
    startup: startup
};
firefoxHandler.startupHandler(firefoxStartHandler);
document.addEventListener("DOMContentLoaded", () => setup());
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
        var data = yield dataHandler.getDataStructFromFirefox();
        tabHelper.getTabs().then((tabs) => { handler.loadFolderList(tabs, data); });
        handler.setup();
        console.log(data);
    });
}
//# sourceMappingURL=sidebar.js.map