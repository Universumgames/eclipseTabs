export interface tabStructData {
    mode: Mode
    rootFolder: folderData
    colorScheme: ColorScheme
    devMode: Boolean
    closeTabsInDeletingFolder: Boolean
    version: String
    displayHowTo: Boolean
    hideOrSwitchTab: Boolean
}

export interface folderData extends elementData {
    name: string
    open: Boolean
    folderID: folderIDType
    elements: Array<elementData>
}

export interface itemData extends elementData {
    url: string
    tabID: tabIDType
    itemID: itemIDType
    hidden: Boolean
    tabExists: Boolean
    favIconURL: string
    title: string
}

export interface elementData {
    parentFolderID: string
    index: number
}

export enum Mode {
    Default,
    Move,
}

export enum ColorScheme {
    dark,
    light,
}

export type tabIDType = string
export type itemIDType = string
export type folderIDType = string

export enum KeyCode {
    enter = 13,
    escape = 27,
}

export interface FirefoxManifest {
    applications: any
    author: String
    background: any
    browseraction: any
    browser_specific_settings: any
    description: String
    developer: { name: String; url: String }
    homepage_url: String
    name: String
    permissions: Array<String>
    short_name: String
    sidebar_action: any
    version: String
    manifest_version: Number
}

export interface FirefoxBookmarksRoot {
    children: Array<any>
    dateAdded: Number
    dateGroupModified: Number
    id: String
    index: Number
    parentId: any
    title: String
    type: String
    url: String
}

export interface FirefoxTab {
    active: boolean
    attentions: boolean
    audible: boolean
    autoDiscarded: boolean
    cookieStoreId: string
    discarded: boolean
    favIconUrl: string
    height: Number
    hidden: boolean
    highlighted: boolean
    id: Number
    incognito: boolean
    index: Number
    isArticle: boolean
    isInReaderMode: boolean
    lastAccessed: Number
    mutedInfo: any
    openerTabId: Number
    pinned: boolean
    sessionId: string
    status: string
    successorTabId: Number
    title: string
    url: string
    width: Number
    windowId: Number
}
