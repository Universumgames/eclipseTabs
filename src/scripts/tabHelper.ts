import { getCurrentBrowser } from "./browserHandler"
import { FirefoxTab } from "./interfaces"

export async function hideTab(id: string | Number): Promise<Boolean> {
    return getCurrentBrowser().hideTab(id)
}

export async function showTab(id: string | Number): Promise<Boolean> {
    return getCurrentBrowser().showTab(id)
}

export async function pinTab(id: string | Number): Promise<Boolean> {
    return getCurrentBrowser().pinTab(id)
}

export async function unpinTab(id: string | Number): Promise<Boolean> {
    return getCurrentBrowser().unpinTab(id)
}

export function focusTab(id: string | Number): void {
    getCurrentBrowser().focusTab(id)
}

export async function createTab(url: string): Promise<FirefoxTab> {
    return getCurrentBrowser().createTab(url)
}

export async function createTabIfNotExist(url: string): Promise<FirefoxTab> {
    const tab = await getTabByURL(url)
    if (tab == undefined) return await createTab(url)
    else return tab
}

export async function tabExists(tabID: string): Promise<Boolean> {
    return (await getTabByTabID(tabID)) != undefined
}

export function tabExistsSync(tabID: string, tabs: Array<FirefoxTab>): Boolean {
    return getTabByTabIDSync(tabID, tabs) != undefined
}

export async function getTabByTabID(tabID: string): Promise<any> {
    const tabs = await getTabs()
    return getTabByTabIDSync(tabID, tabs)
}

export function getTabByTabIDSync(tabID: string, tabs: Array<FirefoxTab>): any {
    if (tabID == "-1") return undefined
    for (const tab of tabs) {
        if (((tab.id as unknown) as string) == tabID) return tab
    }
    return undefined
}

export async function getTabs(): Promise<Array<FirefoxTab>> {
    return getCurrentBrowser().getTabs()
}

export async function getCurrentTab(): Promise<FirefoxTab> {
    return getCurrentBrowser().getCurrentTab()
}

export async function closeTab(id: string | Number) {
    return getCurrentBrowser().closeTab(id)
}

export async function getTabByURL(url: string): Promise<FirefoxTab | undefined> {
    const tabs = await getTabs()
    for (const tab of tabs) {
        if (tab.url == url) return tab
    }
    return undefined
}

export function getTabByURLDirect(url: string, tabs: Array<FirefoxTab>): FirefoxTab | undefined {
    for (const tab of tabs) {
        if (tab.url.toLowerCase() == url.toLowerCase()) return tab
    }
    return undefined
}

export async function getNeighbourTab(tabID: string): Promise<string> {
    const tabs = await getTabs()
    return getNeighbourTabSync(tabID, tabs)
}

export function getNeighbourTabSync(tabID: string, tabs: Array<FirefoxTab>): string {
    let currVisited = false
    let prevTab: FirefoxTab = tabs[0]
    let nextTab: FirefoxTab | undefined = undefined
    for (const tab of tabs) {
        if (currVisited) {
            nextTab = tab
            break
        }

        if (((tab.id as unknown) as string) == tabID) currVisited = true
        else prevTab = tab
    }
    if (nextTab == undefined) nextTab = prevTab
    return (nextTab.id as unknown) as string
}
