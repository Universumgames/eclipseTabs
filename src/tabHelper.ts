import * as firefoxHandler from "./firefoxHandler.js"
import { FirefoxTab } from "./interfaces.js"

export async function hideTab(id: string | Number): Promise<Boolean> {
    if (id != undefined) {
        if ((await getCurrentTab()).id == id) return false
        console.log(`hide ${id}`)
        //@ts-ignore
        await browser.tabs.hide(+id)
        return true
    }
    return false
}

export async function showTab(id: string | Number): Promise<Boolean> {
    if (id != undefined) {
        console.log(`show ${id}`)
        //@ts-ignore
        await browser.tabs.show(+id)
        return true
    }
    return false
}

export function focusTab(id: string | Number): void {
    //@ts-ignore
    browser.tabs.update(+id, { active: true })
}

export async function createTab(url: string): Promise<FirefoxTab> {
    //@ts-ignore
    return browser.tabs.create({
        url: `${url}`,
    })
}

export async function tabExists(tabID: string): Promise<Boolean> {
    return (await getTabByTabID(tabID)) != undefined
}

export async function getTabByTabID(tabID: string): Promise<any> {
    if (tabID == "-1") return undefined
    var tabs = await getTabs()
    for (var tab of tabs) {
        if (((tab.id as unknown) as string) == tabID) return tab
    }
    return undefined
}

export async function getTabs(): Promise<Array<FirefoxTab>> {
    return await firefoxHandler.tabQuery({})
}

export async function getCurrentTab(): Promise<FirefoxTab> {
    return (await firefoxHandler.tabQuery({ active: true }))[0]
}

export async function closeTab(id: string | Number) {
    //@ts-ignore
    return browser.tabs.remove(id as number)
}
