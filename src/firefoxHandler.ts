import { createEmptyData, createEmptyRoot } from "./dataHandler/adder.js"
import { folderData, tabStructData } from "./interfaces.js"

export interface firefoxHandler {
    refreshTabListOnActiveChange: any
    refreshTabListOnSiteUpdated: any
    refreshTabListOnTabRemoved: any
}

export interface firefoxStartupHandler {
    startup: any
}

export function reload() {
    //@ts-ignore
    browser.runtime.reload()
}

export function registerListener(handler: firefoxHandler) {
    //@ts-ignore
    browser.tabs.onActivated.addListener(handler.refreshTabListOnActiveChange)
    //@ts-ignore
    browser.tabs.onUpdated.addListener(handler.refreshTabListOnSiteUpdated)
    //@ts-ignore
    browser.tabs.onRemoved.addListener(handler.refreshTabListOnTabRemoved)
}

export async function tabQuery(query: any): Promise<any> {
    //@ts-ignore
    return await browser.tabs.query(query)
}

export async function startupHandler(handler: firefoxStartupHandler) {
    //@ts-ignore
    browser.runtime.onStartup.addListener(handler.startup)
}

export async function localStorageSet(data: any): Promise<any> {
    //@ts-ignore
    return await browser.storage.local.set(data)
}

export async function localStorageGetTabStructData(name: string): Promise<tabStructData> {
    //@ts-ignore
    var storage = await browser.storage.local.get(name)
    var data = storage.eclipseData

    //transition to new object
    if ("rootFolder" in data) {
        return data as tabStructData
    } else if ("name" in data && "open" in data && "folderID" in data && "elements" in data) {
        var root = {
            name: data.name,
            open: data.open,
            folderID: data.folderID,
            elements: data.elements,
        } as folderData
        return {
            mode: data.mode,
            colorScheme: data.colorScheme,
            rootFolder: root,
        } as tabStructData
    }
    return undefined
}
