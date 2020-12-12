var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as tabHelper from './tabHelper.js';
import * as handler from './handler.js';
import * as firefoxHandler from './firefoxHandler.js';
import { createEmptyData, getDataStructFromFirefox, saveDataInFirefox, updateTabsOnStartUp } from './dataHandler/importer.js';
var data = createEmptyData();
var firefoxStartHandler = {
    startup: startup
};
firefoxHandler.startupHandler(firefoxStartHandler);
document.addEventListener("DOMContentLoaded", () => setup());
function startup() {
    return __awaiter(this, void 0, void 0, function* () {
        var dataTmp = yield getDataStructFromFirefox();
        if (dataTmp == undefined) {
            saveDataInFirefox(data);
            console.log("Data cleared or extension is newly installed, created new storage structure: ", data);
        }
        else
            data = dataTmp;
        tabHelper.getTabs().then((tabs) => {
            console.log(tabs);
            updateTabsOnStartUp(data, tabs);
        });
    });
}
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        var dataTmp = yield getDataStructFromFirefox();
        if (dataTmp == undefined) {
            saveDataInFirefox(data);
            console.log("Data cleared or extension is newly installed, created new storage structure: ", data);
        }
        else
            data = dataTmp;
        tabHelper.getTabs().then((tabs) => { handler.loadFolderList(tabs, data); });
        handler.setupHandler(setup);
        console.log(data);
    });
}
//# sourceMappingURL=sidebar.js.map