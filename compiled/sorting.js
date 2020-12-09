export function recursiveSelectionSort(element) {
    var sortedIndex = 0;
    var indexSmallest = 0;
    while (sortedIndex < element.elements.length) {
        indexSmallest = sortedIndex;
        for (var i = sortedIndex; i < element.elements.length; i++) {
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
}
function compareItems(element1, element2) {
    return element1.index < element2.index;
}
//# sourceMappingURL=sorting.js.map