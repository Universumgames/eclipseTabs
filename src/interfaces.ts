export interface tabStructData{
    elements: Array<elementData>
}

export interface folderData extends elementData {
    name: string,
    open: Boolean,
    folderID: folderIDType,
    elements: Array<elementData>
}

export interface itemData extends elementData {
    url: string,
    tabID: tabIDType,
    itemID: itemIDType,
    hidden: Boolean,
    tabExists: Boolean,
    favIconURL: string,
    title: string
}

export interface elementData {
    parentFolderID: string
}

export type tabIDType = string
export type itemIDType = string
export type folderIDType = string