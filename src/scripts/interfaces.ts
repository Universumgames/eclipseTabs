import { ITabStructData, TabStructData } from "./tabStructData"

export interface browserHandler {
    updateList: any
    setColorScheme: any
}

export interface browserStartupHandler {
    startup: any
}

export interface Browser extends TabManager {
    getBrowser(): any
    reload(): void
    registerListener(handler: browserHandler): void
    tabQuery(query: any): Promise<Array<any>>
    startupHandler(handler: browserStartupHandler): void
    localStorageSet(data: any): Promise<any>
    localStorageGetTabStructData(name: string): Promise<ITabStructData | undefined>
    getManifest(): FirefoxManifest
    getBookmarks(): Promise<FirefoxBookmarksRoot>
    getTheme(): Promise<FirefoxTheme>
}

//TODO declare tabmanager and implement interface
export interface TabManager {
    hideTab(id: string | number): Promise<Boolean>
    showTab(id: string | number): Promise<Boolean>
    pinTab(id: string | number): Promise<Boolean>
    unpinTab(id: string | number): Promise<Boolean>
    focusTab(id: string | number): void
    createTab(url: string): Promise<FirefoxTab>
    getTabs(): Promise<Array<FirefoxTab>>
    getCurrentTab(): Promise<FirefoxTab>
    closeTab(id: string | number): void
}

export enum BrowserType {
    Gecko,
    Chrome
}

export enum Mode {
    Default,
    Move
}

export enum ColorScheme {
    dark,
    light
}

export type tabIDType = string
export type itemIDType = string
export type folderIDType = string

export enum KeyCode {
    enter = 13,
    escape = 27
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
    manifest_version: number
}

export interface FirefoxBookmarksRoot {
    children: Array<any>
    dateAdded: number
    dateGroupModified: number
    id: String
    index: number
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
    height: number
    hidden: boolean
    highlighted: boolean
    id: number
    incognito: boolean
    index: number
    isArticle: boolean
    isInReaderMode: boolean
    lastAccessed: number
    mutedInfo: any
    openerTabId: number
    pinned: boolean
    sessionId: string
    status: string
    successorTabId: number
    title: string
    url: string
    width: number
    windowId: number
}

export enum ContextAction {
    none,
    rename,
    delete,
    toggle,
    cascadeToggle,
    createAtLocation,
    share
}

export interface ContextMenuData {
    targetElementID: string
    targetIsFolder: boolean
    actionPerformed: ContextAction
    unsafe: boolean
}

/** See documentation of themes here:  https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme#colors*/
export interface FirefoxTheme {
    colors: {
        /** The color of text and icons in the bookmark and find bars. Also, if tab_text isn't defined it sets the color of the active tab text and if icons isn't defined the color of the toolbar icons. Provided as Chrome compatible alias for toolbar_text. */
        bookmark_text: string
        /**The color of the background of the pressed toolbar buttons. */
        button_background_active: string
        /**The color of the background of the toolbar buttons on hover. */
        button_background_hover: string
        /**The color of toolbar icons, excluding those in the find toolbar. */
        icons: string
        /**The color of toolbar icons in attention state such as the starred bookmark icon or finished download icon.  */
        icons_attention: string
        /**The color of the header area background, displayed in the part of the header not covered or visible through the images specified in "theme_frame" and "additional_backgrounds".  */
        frame: string
        /**The color of the header area background when the browser window is inactive, displayed in the part of the header not covered or visible through the images specified in "theme_frame" and "additional_backgrounds".  */
        frame_inactive: string
        /**The new tab page background color. */
        ntp_background: string
        /**The new tab page text color. */
        ntp_text: string
        /**The background color of popups (such as the url bar dropdown and the arrow panels).  */
        popup: string
        /**The border color of popups. */
        popup_border: string
        /**The background color of items highlighted using the keyboard inside popups (such as the selected url bar dropdown item).  */
        popup_highlight: string
        /**The text color of items highlighted inside popups. */
        popup_highlight_text: string
        /**The text color of popups. */
        popup_text: string
        /**The background color of the sidebar. */
        sidebar: string
        /**The border and splitter color of the browser sidebar */
        sidebar_border: string
        /**The background color of highlighted rows in built-in sidebars */
        sidebar_highlight: string
        /**The text color of highlighted rows in sidebars. */
        sidebar_highlight_text: string
        /**The text color of sidebars. */
        sidebar_text: string
        /**The color of the text displayed in the inactive page tabs. If tab_text or bookmark_text isn't specified, applies to the active tab text.  */
        tab_background_text: string
        /**The color of the selected tab line. */
        tab_line: string
        /**The color of the tab loading indicator and the tab loading burst. */
        tab_loading: string
        /**The background color of the selected tab. When not in use selected tab color is set by frame and the frame_inactive.  */
        tab_selected: string
        /**From Firefox 59, it represents the text color for the selected tab. If tab_line isn't specified, it also defines the color of the selected tab line.  */
        tab_text: string
        /** The background color for the navigation bar, the bookmarks bar, and the selected tab.
        This also sets the background color of the "Find" bar. */
        toolbar: string
        /**The color of the line separating the bottom of the toolbar from the region below.  */
        toolbar_bottom_separator: string
        /**The background color for fields in the toolbar, such as the URL bar.
        This also sets the background color of the Find in page field.  */
        toolbar_field: string
        /**The border color for fields in the toolbar.
        This also sets the border color of the Find in page field.  */
        toolbar_field_border: string
        /**The focused border color for fields in the toolbar. */
        toolbar_field_border_focus: string
        /**The focused background color for fields in the toolbar, such as the URL bar.  */
        toolbar_field_focus: string
        /** 	The background color used to indicate the current selection of text in the URL bar (and the search bar, if it's configured to be separate).  */
        toolbar_field_highlight: string
        /**The color used to draw text that's currently selected in the URL bar (and the search bar, if it's configured to be separate box).  */
        toolbar_field_highlight_text: string
        /**The color of text in fields in the toolbar, such as the URL bar. This also sets the color of text in the Find in page field.  */
        toolbar_field_text: string
        /**The color of text in focused fields in the toolbar, such as the URL bar.  */
        toolbar_field_text_focus: string
        /**The color of toolbar text. This also sets the color of  text in the "Find" bar.  */
        toolbar_text: string
        /**The color of the line separating the top of the toolbar from the region above.  */
        toolbar_top_separator: string
        /**The color of the separator in the bookmarks toolbar. In Firefox 58, it corresponds to the color of separators inside the URL bar.  */
        toolbar_vertical_separator: string
    }
}
