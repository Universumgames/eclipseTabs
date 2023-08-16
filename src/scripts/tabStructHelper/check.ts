import { FolderData } from "../elementData";
import { folderIDType } from "../interfaces";

export function folderExistsByID(this: FolderData, folderID: folderIDType): boolean {
    return this.findFolderByIDImmediate(folderID) !== undefined;
}