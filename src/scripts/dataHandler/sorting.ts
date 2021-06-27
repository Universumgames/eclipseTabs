import { elementData, folderData, tabStructData } from "../interfaces"
import { generateIndexInFolder } from "./adder"

//TODO needs a faster alternative to selection sort (like radix-sort)
export async function recursiveSelectionSort(element: folderData): Promise<void> {
    let sortedIndex: number = 0
    let indexSmallest: number = 0
    while (sortedIndex < element.elements.length) {
        indexSmallest = sortedIndex
        for (let i = sortedIndex; i < element.elements.length; i++) {
            if (element.elements == undefined) element.elements = new Array<elementData>()
            if (element.elements[i] == undefined) {
                const old = Object.assign({}, element)
                element.elements.splice(i, 1)
                console.warn("Error found in element (old, atfer-fix)", old, element)
                continue
            }
            if (element.elements[i].index == undefined) element.elements[i].index = generateIndexInFolder(element)
            if (compareItems(element.elements[i], element.elements[indexSmallest])) indexSmallest = i
            if ((element.elements[i] as folderData).folderID !== undefined) recursiveSelectionSort(element.elements[i] as folderData)
        }
        //switch elements at found location
        const switchA = element.elements[sortedIndex]
        const switchB = element.elements[indexSmallest]
        element.elements[sortedIndex] = switchB
        element.elements[indexSmallest] = switchA
        sortedIndex++
    }
    for (let i = 0; i < element.elements.length; i++) {
        if (element.elements[i] != undefined) element.elements[i].index = 2 * i
    }
}

function compareItems(element1: elementData, element2: elementData): boolean {
    return element1.index < element2.index
}
