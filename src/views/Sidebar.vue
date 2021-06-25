<template>
    <div>
        <!--List container-->
        <div id="list" ref="list">
            <Folder
                v-for="folder in this.shortenList"
                :key="folder.folderID"
                :eclipseData="this.eclipseData"
                :folderData="folder"
                :tier="0"
                :allreload="this.allreload"
                :parentFolder="this.eclipseData.rootFolder"
                :htmlTarget="this.htmlTarget"
                :targetElement="this.targetElement"
                v-on:save="save"
                v-on:targetElementChange="this.targetElementChange"
                v-on:move="this.elementMove"
            />
        </div>

        <!--add folder name input-->
        <div id="addFolderNameInputContainer" class="disabled">
            <input type="text" ref="addFolderNameInput" placeholder="foldername" @keyup="this.addFolderSubmit" />
        </div>

        <!--Bottom Menu-->
        <BottomMenu
            :eclipseData="this.eclipseData"
            :targetElement="this.targetElement"
            :targetElementParent="this.targetElementParent"
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
import { elementData, folderData, itemData, KeyCode, Mode, tabStructData } from "@/scripts/interfaces"
import { generateFolderID, getFolderJSONObjectByID, getItemJSONObjectByItemID, saveDataInFirefox } from "@/scripts/dataHandler/getter"
import { addFolderDirect, createEmptyData } from "@/scripts/dataHandler/adder"
import { isFolder, isItem } from "@/scripts/helper"
import { collapseAllDirect, expandAllDirect, moveElement, removeElement, removeFolder, removeItem } from "@/scripts/dataHandler/changer"

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
    eclipseData: tabStructData = createEmptyData()
    allreload: Function = () => {}

    htmlTarget!: HTMLElement
    targetElement: elementData = this.eclipseData.rootFolder
    targetElementParent: folderData = this.eclipseData.rootFolder

    folderAddInput!: HTMLInputElement

    mounted() {
        console.log(this.eclipseData)

        document.body.addEventListener("drop", this.bodyDrop)
        this.folderAddInput = this.$refs.addFolderNameInput as HTMLInputElement

        this.htmlTarget = this.$refs.list as HTMLElement
        this.targetElement = this.eclipseData.rootFolder
        this.targetElementParent = this.eclipseData.rootFolder
    }

    //#region bottom menu events
    addFolderClick() {
        this.folderAddInput.parentElement!.classList.toggle("disabled")
    }

    binDrop() {
        removeElement(this.targetElement as folderData | itemData, this.targetElementParent, this.eclipseData)
        this.save()
        console.log(this.targetElement)
        console.log(this.targetElementParent)
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
        collapseAllDirect(this.eclipseData)
        this.save()
    }

    async expandAll() {
        expandAllDirect(this.eclipseData)
        this.save()
    }

    contextMenuTargetChange(contextMenuTarget: HTMLElement) {
        this.htmlTarget = contextMenuTarget
    }

    contextFolderRenameStart() {
        var divContainer = this.htmlTarget
        if (divContainer!.getAttribute("isFolder")) {
            // divContainer.innerText = ""
            divContainer!.children[3].classList.toggle("disabled")
            //@ts-ignore
            divContainer.children[3].focus()
            //@ts-ignore
            divContainer.children[3].value = divContainer.children[1].textContent
        }
    }

    async contextFolderDelete() {
        var folder: folderData
        if (isFolder(this.htmlTarget!)) {
            folder = getFolderJSONObjectByID(this.htmlTarget!.getAttribute("folderID")!, this.eclipseData.rootFolder)!
            await removeFolder(folder.folderID, folder.parentFolderID)
            this.allreload()
        }
    }

    contextItemRenameStart() {
        var divContainer = this.htmlTarget
        if (divContainer!.getAttribute("isItem")) {
            // divContainer.innerText = ""
            divContainer!.children[3].classList.toggle("disabled")
            //@ts-ignore
            divContainer.children[3].focus()
            //@ts-ignore
            divContainer.children[3].value = this.contextMenuTarget.attributes.getNamedItem("title").value
        }
    }

    async contextItemDelete() {
        var item: itemData
        if (isItem(this.htmlTarget!)) {
            item = getItemJSONObjectByItemID(this.htmlTarget!.getAttribute("itemID")!, this.eclipseData.rootFolder)!
            await removeItem(item.itemID, item.parentFolderID)
            this.allreload()
        } else console.warn("Method item delete handler was called on a non item element")
    }

    //#endregion

    get shortenList() {
        let arr = new Array<elementData>()
        for (let key in this.eclipseData.rootFolder.elements) {
            const element = this.eclipseData.rootFolder.elements[key]
            if (element != undefined && element != null) arr.push(element)
        }
        return arr
    }

    save() {
        this.$emit("save")
    }

    targetElementChange(element: elementData, parent: folderData) {
        this.targetElement = element
        this.targetElementParent = parent
    }

    async addFolderSubmit(event: any) {
        if (event.keyCode == KeyCode.enter) {
            event.preventDefault()
            var value = this.folderAddInput.value
            this.folderAddInput.value = ""
            this.folderAddInput.parentElement!.classList.toggle("disabled")
            if (value != "") addFolderDirect(this.eclipseData.rootFolder, (await generateFolderID()).toString(), value)
            this.save()
        }
    }

    elementMove(targetFolder: folderData) {
        if (this.targetElement != undefined) {
            if (!moveElement(this.targetElement, this.targetElementParent, targetFolder))
                console.warn("Unable to move element ", this.targetElement, this.targetElementParent, targetFolder)
            this.save()
        } else console.warn("TargetElement is undefined, unable to move element to folder ", targetFolder)
    }

    bodyDrop() {
        if (this.targetElement != undefined) moveElement(this.targetElement, this.targetElementParent, this.eclipseData.rootFolder)
    }
}
</script>

<style src="@/assets/style/list.css"></style>
