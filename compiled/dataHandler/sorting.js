import { generateIndexInFolder } from './adder.js';
export function recursiveSelectionSort(element) {
    var sortedIndex = 0;
    var indexSmallest = 0;
    while (sortedIndex < element.elements.length) {
        indexSmallest = sortedIndex;
        for (var i = sortedIndex; i < element.elements.length; i++) {
            if (element.elements[i] == undefined) {
                var old = Object.assign({}, element);
                element.elements.splice(i, 1);
                console.error("Error found in element (old, atfer-fix)", old, element);
                continue;
            }
            if (element.elements[i].index == undefined)
                element.elements[i].index = generateIndexInFolder(element);
            if (compareItems(element.elements[i], element.elements[indexSmallest]))
                indexSmallest = i;
            if (element.elements[i].folderID !== undefined)
                recursiveSelectionSort(element.elements[i]);
        }
        var switchA = element.elements[sortedIndex];
        var switchB = element.elements[indexSmallest];
        element.elements[sortedIndex] = switchB;
        element.elements[indexSmallest] = switchA;
        sortedIndex++;
    }
    for (var i = 0; i < element.elements.length; i++) {
        element.elements[i].index = 2 * i;
    }
}
function compareItems(element1, element2) {
    return element1.index < element2.index;
}
//# sourceMappingURL=sorting.js.map