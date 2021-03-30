import { createEmptyData, createEmptyRoot } from "./dataHandler/adder.js"
import { folderData, tabStructData, FirefoxManifest } from "./interfaces.js"

//@ts-ignore
const firefoxBrowser: any = browser

export interface firefoxHandler {
    updateList: any
}

export interface firefoxStartupHandler {
    startup: any
}

export function reload() {
    firefoxBrowser.runtime.reload()
}

export async function registerListener(handler: firefoxHandler) {
    firefoxBrowser.tabs.onActivated.addListener(handler.updateList)
    firefoxBrowser.tabs.onUpdated.addListener(handler.updateList)
    firefoxBrowser.tabs.onRemoved.addListener(handler.updateList)
    firefoxBrowser.tabs.onMoved.addListener(handler.updateList)
    firefoxBrowser.tabs.onDetached.addListener(handler.updateList)
    firefoxBrowser.tabs.onCreated.addListener(handler.updateList)

    /*while (true) {
        handler.updateList()
        await setTimeout(() => {}, 300)
    }*/
}

export async function tabQuery(query: any): Promise<any> {
    return await firefoxBrowser.tabs.query(query)
}

export async function startupHandler(handler: firefoxStartupHandler) {
    firefoxBrowser.runtime.onStartup.addListener(handler.startup)
}

export async function localStorageSet(data: any): Promise<any> {
    return await firefoxBrowser.storage.local.set(data)
}

export async function localStorageGetTabStructData(name: string): Promise<tabStructData> {
    var storage = await firefoxBrowser.storage.local.get(name)
    var data = storage.eclipseData
    if (data === undefined) return undefined

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
            devMode: false,
            closeTabsInDeletingFolder: false,
            version: "1.0.0",
            displayHowTo: true,
            hideOrSwitchTab: false,
        } as tabStructData
    }
    return undefined
}

export function getManifest(): FirefoxManifest {
    return firefoxBrowser.runtime.getManifest()
}
