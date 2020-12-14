var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function reload() {
    chrome.runtime.reload();
}
export function registerListener(handler) {
    chrome.tabs.onActivated.addListener(handler.refreshTabListOnActiveChange);
    chrome.tabs.onUpdated.addListener(handler.refreshTabListOnSiteUpdated);
    chrome.tabs.onRemoved.addListener(handler.refreshTabListOnTabRemoved);
}
export function tabQuery(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((query) => {
            chrome.tabs.query(query, (result) => {
                Promise.resolve(result);
            });
        });
    });
}
export function startupHandler(handler) {
    return __awaiter(this, void 0, void 0, function* () {
        chrome.runtime.onStartup.addListener(handler.startup);
    });
}
export function localStorageSet(data) {
    chrome.storage.local.set({ 'data': data });
}
export function localStorageGet() {
    return new Promise(() => {
        chrome.storage.local.get((result) => {
            Promise.resolve(result);
        });
    });
}
//# sourceMappingURL=chromiumHandler.js.map