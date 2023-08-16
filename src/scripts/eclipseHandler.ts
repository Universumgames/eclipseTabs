import { folderIDType, itemIDType, tabIDType } from "./interfaces"
import { ElementData, FolderData, IItemData, ItemData } from "./elementData"
import { TabStructData } from "./tabStructData"

/**
 *
 * @param versionA {string} version string of the first version
 * @param versionB {string} version string of the second version
 * @return {number} -1 if versionA is older than versionB, 1 if versionA is newer than versionB, 0 if they are the same
 */
export function compareVersion(versionA: string | String, versionB: string | String): number {
    const a = versionA.split(".")
    const b = versionB.split(".")
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return a[i] > b[i] ? 1 : -1
        }
    }
    return 0
}

export function upgradeHandler(eclipseData: TabStructData) {
    // upgrade from <=1.3.1 to 1.4.0
    if (compareVersion(eclipseData.version, "1.4.0") == -1) {
        upgradeTo_1_4_0(eclipseData)
        //console.log(getHostname("https://www.google.com/test"))
    }
}

function upgradeTo_1_4_0(eclipseData: TabStructData) {
    console.log("upgrading from " + eclipseData.version + " to 1.4.0")

    //const eclipseData = Object.assign({}, eclipseData2)
    if (eclipseData.favIconStorage == undefined) eclipseData.favIconStorage = {}
    eclipseData.version = "1.4.0"
    const queue: ElementData[] = [...eclipseData.rootFolder.elements]
    queue.concat(eclipseData.rootFolder.elements)
    let items = 0

    while (queue[0] != undefined) {
        // console.log("queue length: " + queue.length)
        // console.log("queue: ", queue)

        const element = queue.pop()
        // console.log("element: ", element)

        if (element == undefined) continue
        if ("folderID" in element) {
            queue.push(...(element as FolderData).elements)
            // console.log("add to queue", (element as folderData).elements)
        } else {
            const item = (element as unknown) as {
                url: string
                tabID: tabIDType
                itemID: itemIDType
                hidden: Boolean
                tabExists: Boolean
                favIconURL: string
                title: string
            }

            item.itemID = eclipseData.findUnusedItemID(item.url)

            const ret = eclipseData.addFavIcon(item.itemID, item.url, item.favIconURL)
            const logdata = { url: item.url, icon: item.favIconURL }
            item.favIconURL = ""
            // if (ret) console.log("added favicon for ", logdata)
            // else console.warn("could not add favicon for ", logdata)
            if (!ret) console.warn("could not add favicon for ", item.url)
            items++
        }
    }
    console.log(eclipseData)
    console.log(items + " items added")
}
