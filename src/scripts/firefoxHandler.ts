import { createEmptyData, createEmptyRoot } from "./dataHandler/adder"
import { folderData, tabStructData, FirefoxManifest, FirefoxBookmarksRoot, FirefoxTheme, Browser, FirefoxTab } from "./interfaces"
import { browserHandler, browserStartupHandler } from "./interfaces"

//@ts-ignore
const firefoxBrowser: any = browser

export default class FirefoxHandler implements Browser {
    static getInstance(): FirefoxHandler {
        return new FirefoxHandler()
    }

    getBrowser() {
        return firefoxBrowser
    }

    reload() {
        firefoxBrowser.runtime.reload()
    }

    async registerListener(handler: browserHandler) {
        firefoxBrowser.tabs.onActivated.addListener(handler.updateList)
        firefoxBrowser.tabs.onUpdated.addListener(handler.updateList)
        firefoxBrowser.tabs.onRemoved.addListener(handler.updateList)
        firefoxBrowser.tabs.onMoved.addListener(handler.updateList)
        firefoxBrowser.tabs.onDetached.addListener(handler.updateList)
        firefoxBrowser.tabs.onCreated.addListener(handler.updateList)
        firefoxBrowser.theme.onUpdated.addListener(handler.setColorScheme)

        /*while (true) {
        handler.updateList()
        await setTimeout(() => {}, 300)
    }*/
    }

    async tabQuery(query: any): Promise<Array<any>> {
        return await firefoxBrowser.tabs.query(query)
    }

    async startupHandler(handler: browserStartupHandler) {
        firefoxBrowser.runtime.onStartup.addListener(handler.startup)
    }

    async localStorageSet(data: any): Promise<any> {
        return await firefoxBrowser.storage.local.set(data)
    }

    async localStorageGetTabStructData(name: string): Promise<tabStructData | undefined> {
        const storage = await firefoxBrowser.storage.local.get(name)
        const data = storage.eclipseData
        if (data === undefined) return undefined

        //transition to new object
        if ("rootFolder" in data) {
            return data as tabStructData
        } else if ("name" in data && "open" in data && "folderID" in data && "elements" in data) {
            const root = {
                name: data.name,
                open: data.open,
                folderID: data.folderID,
                elements: data.elements
            } as folderData
            return createEmptyData()
        }
        return undefined
    }

    getManifest(): FirefoxManifest {
        return firefoxBrowser.runtime.getManifest()
    }

    async getBookmarks(): Promise<FirefoxBookmarksRoot> {
        return (await firefoxBrowser.bookmarks.getTree())[0]
    }

    async getTheme(): Promise<FirefoxTheme> {
        return (await firefoxBrowser.theme.getCurrent()) as FirefoxTheme
    }

    async hideTab(id: string | Number): Promise<Boolean> {
        if (id != undefined) {
            if ((await this.getCurrentTab()).id == id) return false
            // console.log(`hide ${id}`)
            await firefoxBrowser.tabs.hide(+id)
            return true
        }
        return false
    }

    async showTab(id: string | Number): Promise<Boolean> {
        if (id != undefined) {
            // console.log(`show ${id}`)
            await firefoxBrowser.tabs.show(+id)
            return true
        }
        return false
    }

    async pinTab(id: string | Number): Promise<Boolean> {
        if (id != undefined) {
            await firefoxBrowser.tabs.update(id, { pinned: true })
            return true
        }
        return false
    }

    async unpinTab(id: string | Number): Promise<Boolean> {
        if (id != undefined) {
            await firefoxBrowser.tabs.update(id, { pinned: false })
            return true
        }
        return false
    }

    focusTab(id: string | Number): void {
        firefoxBrowser.tabs.update(+id, { active: true })
    }

    createTab(url: string): Promise<FirefoxTab> {
        return firefoxBrowser.tabs.create({
            url: `${url}`
        })
    }

    async getTabs(): Promise<FirefoxTab[]> {
        return await this.tabQuery({})
    }

    async getCurrentTab(): Promise<FirefoxTab> {
        return (await this.tabQuery({ active: true }))[0]
    }
    closeTab(id: string | Number): void {
        return firefoxBrowser.tabs.remove(id as number)
    }
}
