export interface chromiumHandler {
    refreshTabListOnActiveChange: any,
    refreshTabListOnSiteUpdated: any,
    refreshTabListOnTabRemoved: any
}

export interface firefoxStartupHandler {
    startup: any
}

export function reload() {
    //@ts-ignore
    chrome.runtime.reload()
}

export function registerListener(handler: chromiumHandler) {
    //@ts-ignore
    chrome.tabs.onActivated.addListener(handler.refreshTabListOnActiveChange)
    //@ts-ignore
    chrome.tabs.onUpdated.addListener(handler.refreshTabListOnSiteUpdated)
    //@ts-ignore
    chrome.tabs.onRemoved.addListener(handler.refreshTabListOnTabRemoved)
}

export async function tabQuery(query: any): Promise<chrome.tabs.Tab[]> {
    //@ts-ignore
    return new Promise((query: any) => {
        chrome.tabs.query(query, (result) => {
            Promise.resolve(result)
        })
    })
}

export async function startupHandler(handler: firefoxStartupHandler) {
    //@ts-ignore
    chrome.runtime.onStartup.addListener(handler.startup)
}

export function localStorageSet(data: any): void {
    //@ts-ignore
    chrome.storage.local.set({ 'data': data })
}

export function localStorageGet(): Promise<any> {
    return new Promise(() => {
        chrome.storage.local.get((result) => {
            Promise.resolve(result)
        })
    })
}