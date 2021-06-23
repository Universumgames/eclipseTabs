<template>
    <div>
        <!--List container-->
        <div id="list">
            <Folder
                v-for="folder in this.shortenList"
                :key="folder.folderID"
                :eclipseData="this.eclipseData"
                :folderData="folder"
                :tier="0"
                :allreload="this.allreload"
            />
        </div>

        <!--add folder name input-->
        <div id="addFolderNameInputContainer" class="disabled">
            <input type="text" id="addFolderNameInput" placeholder="foldername" />
        </div>

        <!--Bottom Menu-->
        <BottomMenu
            :eclipseData="this.eclipseData"
            :allreload="this.allreload"
            v-on:folderClick="this.addFolderClick"
            v-on:binDrop="this.binDrop"
            v-on:clearStructClick="this.clearStructClick"
            v-on:moveClick="this.moveClick"
        />

        <!--Context menu-->
        <context-menu
            :eclipseData="this.eclipseData"
            v-on:collapseAll="this.collapseAllClick"
            v-on:expandAll="this.expandAll"
            v-on:contextMenuTargetChange="this.contextMenuTargetChange"
            v-on:contextFolderRenameStart="this.contextFolderRenameStart"
            v-on:contextFolderDelete="this.contextFolderDelete"
            v-on:contextItemRenameStart="this.contextItemRenameStart"
            v-on:contextItemDelete="this.contextItemDelete"
        />
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { elementData, folderData, itemData, Mode, tabStructData } from "@/scripts/interfaces"
import { getFolderJSONObjectByID, getItemJSONObjectByItemID, saveDataInFirefox } from "@/scripts/dataHandler/getter"
import { createEmptyData } from "@/scripts/dataHandler/adder"
import { isFolder, isItem } from "@/scripts/helper"
import { collapseAll, expandAll, removeFolder, removeItem } from "@/scripts/dataHandler/changer"

import BottomMenu from "@/components/Bottom.vue"
import ContextMenu from "@/components/ContextMenu.vue"
import Folder from "@/components/Folder.vue"

@Options({
    components: { BottomMenu, ContextMenu, Folder },
    props: {
        eclipseData: Object,
        allreload: Function
    }
})
export default class Sidebar extends Vue {
    eclipseData!: tabStructData
    allreload!: Function

    contextMenuTarget!: HTMLElement

    mounted() {
        console.log(this.eclipseData)
    }

    //#region bottom menu events
    addFolderClick(event: any) {
        console.log(event)
    }

    binDrop(event: any) {
        console.log(event)
    }

    moveClick() {
        switch (this.eclipseData.mode) {
            case Mode.Default:
                this.eclipseData.mode = Mode.Move
                break
            case Mode.Move:
                this.eclipseData.mode = Mode.Default
                break
            default:
                this.eclipseData.mode = Mode.Default
        }
    }

    async clearStructClick() {
        this.$emit("clearStructClick")
        await saveDataInFirefox(createEmptyData())
        this.allreload()
    }
    //#endregion

    //#region context menu events
    async collapseAllClick() {
        await collapseAll()
    }

    async expandAll() {
        await expandAll()
    }

    contextMenuTargetChange(contextMenuTarget: HTMLElement) {
        this.contextMenuTarget = contextMenuTarget
        console.log(contextMenuTarget)
    }

    contextFolderRenameStart() {
        var divContainer = this.contextMenuTarget
        if (divContainer.getAttribute("isFolder")) {
            // divContainer.innerText = ""
            divContainer.children[3].classList.toggle("disabled")
            //@ts-ignore
            divContainer.children[3].focus()
            //@ts-ignore
            divContainer.children[3].value = divContainer.children[1].textContent
        }
    }

    async contextFolderDelete() {
        var folder: folderData
        if (isFolder(this.contextMenuTarget)) {
            folder = getFolderJSONObjectByID(this.contextMenuTarget.getAttribute("folderID")!, this.eclipseData.rootFolder)!
            await removeFolder(folder.folderID, folder.parentFolderID)
            this.allreload()
        }
    }

    contextItemRenameStart() {
        var divContainer = this.contextMenuTarget
        if (divContainer.getAttribute("isItem")) {
            // divContainer.innerText = ""
            divContainer.children[3].classList.toggle("disabled")
            //@ts-ignore
            divContainer.children[3].focus()
            //@ts-ignore
            divContainer.children[3].value = this.contextMenuTarget.attributes.getNamedItem("title").value
        }
    }

    async contextItemDelete() {
        var item: itemData
        if (isItem(this.contextMenuTarget)) {
            item = getItemJSONObjectByItemID(this.contextMenuTarget.getAttribute("itemID")!, this.eclipseData.rootFolder)!
            await removeItem(item.itemID, item.parentFolderID)
            this.allreload()
        } else console.warn("Method item delete handler was called on a non item element")
    }

    //#endregion

    get shortenList() {
        let arr = new Array<elementData>()
        for (let key in this.eclipseData.rootFolder.elements) {
            const element = this.eclipseData.rootFolder.elements[key]
            arr.push(element)
        }
        return arr
    }
}
</script>

<style src="@/assets/style/list.css"></style>
