import { elementData, folderData } from "./interfaces.js";

export function recursiveSelectionSort(element: folderData) {
    var sortedIndex: number = 0;
    var indexSmallest: number = 0;
    while (sortedIndex < element.elements.length) {
        indexSmallest = sortedIndex;
        for (var i = sortedIndex; i < element.elements.length; i++) {
            if (compareItems(element.elements[i], element.elements[indexSmallest]))
                indexSmallest = i;
            if ((element.elements[i] as folderData).folderID !== undefined)
                recursiveSelectionSort(element.elements[i] as folderData);
        }
        //switch elements at found location
        var switchA = element.elements[sortedIndex];
        var switchB = element.elements[indexSmallest];
        element.elements[sortedIndex] = switchB;
        element.elements[indexSmallest] = switchA;
        sortedIndex++;
    }
}

function compareItems(element1: elementData, element2: elementData): boolean {
    return element1.index < element2.index;
}