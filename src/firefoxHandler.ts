export interface firefoxHandler{
    refreshTabListOnActiveChange: any,
    refreshTabListOnSiteUpdated: any
}

export interface firefoxStartupHandler{
    startup: any
}

export function reload(){
    browser.runtime.reload()
}

export function registerListener(handler: firefoxHandler){
    browser.tabs.onActivated.addListener(handler.refreshTabListOnActiveChange)
    browser.tabs.onUpdated.addListener(handler.refreshTabListOnSiteUpdated)
}

export async function tabQuery(query: any): Promise<any>{
    return await browser.tabs.query(query)
}

export async function startupHandler(handler: firefoxStartupHandler){
    browser.runtime.onStartup.addListener(handler.startup)
}

export async function localStorageSet(data: any): Promise<any>{
    return await browser.storage.local.set(data)
}

export async function localStorageGet(name: string): Promise<any> {
    return await browser.storage.local.get(name)
}