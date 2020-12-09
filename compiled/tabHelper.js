var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as firefoxHandler from './firefoxHandler.js';
export function hideTab(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (id != undefined) {
            if ((yield getCurrentTab()).id == id)
                return false;
            console.log(`hide ${id}`);
            yield browser.tabs.hide(+id);
            return true;
        }
        return false;
    });
}
export function showTab(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (id != undefined) {
            console.log(`show ${id}`);
            yield browser.tabs.show(+id);
            return true;
        }
        return false;
    });
}
export function focusTab(id) {
    browser.tabs.update(+id, { active: true });
}
export function createTab(url) {
    return browser.tabs.create({
        url: `${url}`
    });
}
export function tabExists(tabID) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getTabByTabID(tabID)) != undefined;
    });
}
export function getTabByTabID(tabID) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tabID == "-1")
            return undefined;
        var tabs = yield getTabs();
        for (var tab of tabs) {
            if (tab.id == tabID)
                return tab;
        }
        return undefined;
    });
}
export function getTabs() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield firefoxHandler.tabQuery({});
    });
}
export function getCurrentTab() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield firefoxHandler.tabQuery({ active: true }))[0];
    });
}
export function closeTab(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return browser.tabs.remove(id);
    });
}
//# sourceMappingURL=tabHelper.js.map