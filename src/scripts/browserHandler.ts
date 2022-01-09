import FirefoxHandler from "./firefoxHandler"
import ChromeHandler from "./chromeHandler"
import {
    browserHandler,
    browserStartupHandler,
    FirefoxBookmarksRoot,
    FirefoxManifest,
    FirefoxTheme,
    tabStructData,
    BrowserType,
    Browser
} from "./interfaces"

export function getBrowserType(): BrowserType {
    //@ts-ignore
    if (FirefoxHandler.getInstance().getBrowser() != undefined) return BrowserType.Gecko
    //@ts-ignore
    if (ChromeHandler.getInstance().getBrowser() != undefined) return BrowserType.Chrome

    return BrowserType.Chrome
}

//@ts-ignore
let currentBrowser: Browser

export function getCurrentBrowserEngine() {
    return getCurrentBrowser().getBrowser()
}

export function getCurrentBrowser(): Browser {
    if (currentBrowser == undefined) {
        currentBrowser = getBrowserType() == BrowserType.Gecko ? FirefoxHandler.getInstance() : ChromeHandler.getInstance()
    }
    return currentBrowser
}

export function reload() {
    getCurrentBrowser().reload()
}

export async function registerListener(handler: browserHandler) {
    currentBrowser.registerListener(handler)
}

export async function tabQuery(query: any): Promise<any> {
    return currentBrowser.tabQuery(query)
}

export async function startupHandler(handler: browserStartupHandler) {
    if (getBrowserType() == BrowserType.Gecko) currentBrowser = FirefoxHandler.getInstance()
    else currentBrowser = ChromeHandler.getInstance()

    getCurrentBrowser().startupHandler(handler)
}

export async function localStorageSet(data: any): Promise<any> {
    return getCurrentBrowser().localStorageSet(data)
}

export async function localStorageGetTabStructData(name: string): Promise<tabStructData | undefined> {
    return getCurrentBrowser().localStorageGetTabStructData(name)
}

export function getManifest(): FirefoxManifest {
    return getCurrentBrowser().getManifest()
}

export async function getBookmarks(): Promise<FirefoxBookmarksRoot> {
    return getCurrentBrowser().getBookmarks()
}

export async function getTheme(): Promise<FirefoxTheme> {
    return getCurrentBrowser().getTheme()
}
