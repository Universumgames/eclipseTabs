import { onUpdated } from "@vue/runtime-core"
import {
    browserHandler,
    browserStartupHandler,
    FirefoxBookmarksRoot,
    FirefoxManifest,
    FirefoxTheme,
    Browser,
    FirefoxTab
} from "./interfaces"
import { FolderData } from "./elementData"
import { TabStructData, createEmptyData } from "./tabStructData"

//@ts-ignore
const chromeBrowser = chrome

//TODO finish chrome handler

export default class ChromeHandler implements Browser {
    static getInstance() {
        return new ChromeHandler()
    }

    getBrowser() {
        return chromeBrowser
    }

    reload(): void {
        chromeBrowser.runtime.reload()
    }

    registerListener(handler: browserHandler): void {
        chromeBrowser.tabs.onActivated.addListener(handler.updateList)
        chromeBrowser.tabs.onUpdated.addListener(handler.updateList)
    }

    async tabQuery(query: any): Promise<Array<any>> {
        return new Promise(function (resolve, reject) {
            chromeBrowser.tabs.query(query, function (tabs: Array<any>) {
                resolve(tabs)
            })
        })
    }

    startupHandler(handler: browserStartupHandler): void {
        chromeBrowser.runtime.onInstalled.addListener(handler.startup)
        chromeBrowser.runtime.onStartup.addListener(handler.startup)
    }

    async localStorageSet(data: any): Promise<any> {
        return await chromeBrowser.storage.local.set(data)
    }

    async localStorageGetTabStructData(name: string): Promise<TabStructData | undefined> {
        const storage = await chromeBrowser.storage.local.get(name)
        const data = storage.eclipseData
        if (data === undefined) return undefined

        //transition to new object
        if ("rootFolder" in data) {
            return data as TabStructData
        } else if ("name" in data && "open" in data && "folderID" in data && "elements" in data) {
            const root = {
                name: data.name,
                open: data.open,
                folderID: data.folderID,
                elements: data.elements
            } as FolderData
            return createEmptyData()
        }
        return undefined
    }

    getManifest(): FirefoxManifest {
        return chromeBrowser.runtime.getManifest()
    }

    getBookmarks(): Promise<FirefoxBookmarksRoot> {
        throw new Error("Method not implemented.")
    }

    getTheme(): Promise<FirefoxTheme> {
        throw new Error("Method not implemented.")
    }

    async hideTab(id: string | number): Promise<Boolean> {
        return false
    }

    async showTab(id: string | number): Promise<Boolean> {
        return false
    }

    pinTab(id: string | number): Promise<Boolean> {
        return new Promise(function (resolve, reject) {
            chromeBrowser.tabs.update(id, { pinned: true }, function (tab: any) {
                resolve(tab != undefined)
            })
        })
    }

    unpinTab(id: string | number): Promise<Boolean> {
        return new Promise(function (resolve, reject) {
            chromeBrowser.tabs.update(id, { pinned: false }, function (tab: any) {
                resolve(tab != undefined)
            })
        })
    }

    focusTab(id: string | number): void {
        throw new Error("Method not implemented.")
    }

    createTab(url: string): Promise<FirefoxTab> {
        return new Promise(function (resolve, reject) {
            chromeBrowser.tabs.create({ url: url }, function (tab: any) {
                resolve(tab)
            })
        })
    }

    getTabs(): Promise<FirefoxTab[]> {
        return this.tabQuery({})
    }

    getCurrentTab(): Promise<FirefoxTab> {
        return new Promise(function (resolve, reject) {
            chromeBrowser.tabs.getCurrent(function (tab: any) {
                resolve(tab)
            })
        })
    }

    closeTab(id: string | number): void {
        chromeBrowser.tabs.remove(id)
    }
}
