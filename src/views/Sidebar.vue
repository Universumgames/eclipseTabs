<template>
    <div id="sidebar">
        <!--List container-->
        <div id="container">
            <div id="list" ref="list" class="scroller">
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
                    :contextData="this.contextData"
                    v-on:save="save"
                    v-on:targetElementChange="this.targetElementChange"
                    v-on:move="this.elementMove"
                    v-on:renameEnd="this.renameEnd"
                    v-on:dragend="this.currentlyDragging = false"
                />

                <!--add folder name input-->
                <div id="addFolderNameInputContainer" class="disabled">
                    <input type="text" ref="addFolderNameInput" placeholder="foldername" @keyup="this.addFolderSubmit" />
                </div>
                <div v-show="this.currentlyDragging" ref="root_dropoff" id="root_dropoff">
                    <span>Dropoff spot for moving to root level</span>
                </div>
            </div>

            <!--Bottom Menu-->
            <BottomMenu
                :eclipseData="this.eclipseData"
                :targetElement="this.targetElement"
                :targetElementParent="this.targetElementParent"
                :allreload="this.allreload"
                :deleteVisible="this.currentlyDragging"
                v-on:folderClick="this.addFolderClick"
                v-on:binDrop="this.binDrop"
                v-on:clearStructClick="this.clearStructClick"
                v-on:moveClick="this.moveClick"
            />
        </div>

        <!--Context menu-->
        <context-menu
            :eclipseData="this.eclipseData"
            v-on:collapseAll="this.collapseAllClick"
            v-on:expandAll="this.expandAll"
            v-on:contextDataChange="this.contextDataChange"
            v-on:contextMenuTargetChange="this.contextMenuTargetChange"
        />
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { ContextAction, ContextMenuData, elementData, folderData, itemData, KeyCode, Mode, tabStructData } from "@/scripts/interfaces"
import { generateFolderID, getFolderJSONObjectByID, getItemJSONObjectByItemID, saveDataInFirefox } from "@/scripts/dataHandler/getter"
import { addFolderDirect, createEmptyData } from "@/scripts/dataHandler/adder"
import * as defs from "@/scripts/dataHandler/definitions"
import { collapseAllDirect, expandAllDirect, moveElement, removeElement, toggleExpandCascade } from "@/scripts/dataHandler/changer"

import BottomMenu from "@/components/Bottom.vue"
import ContextMenu from "@/components/ContextMenu.vue"
import Folder from "@/components/Folder.vue"
import { reactive } from "vue"

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

    htmlTarget: HTMLElement = document.body
    targetElement: elementData = this.eclipseData.rootFolder
    targetElementParent: folderData = this.eclipseData.rootFolder
    contextData = reactive<ContextMenuData>({ targetElementID: "", targetIsFolder: false, actionPerformed: ContextAction.rename })

    currentlyDragging: Boolean = false

    folderAddInput!: HTMLInputElement

    rootDropOffElement!: HTMLElement

    mounted() {
        // console.log(this.eclipseData)

        this.folderAddInput = this.$refs.addFolderNameInput as HTMLInputElement

        this.htmlTarget = this.$refs.list as HTMLElement
        this.targetElement = this.eclipseData.rootFolder
        this.targetElementParent = this.eclipseData.rootFolder
        this.rootDropOffElement = this.$refs.root_dropoff as HTMLElement

        this.rootDropOffElement.addEventListener("drop", this.bodyDrop)
        this.rootDropOffElement.addEventListener("dragover", e => {
            e.preventDefault()
        })
    }

    //#region bottom menu events
    addFolderClick() {
        this.folderAddInput.parentElement!.classList.toggle("disabled")
        this.folderAddInput.focus()
    }

    binDrop() {
        removeElement(this.targetElement as folderData | itemData, this.targetElementParent, this.eclipseData)
        this.save()
        this.currentlyDragging = false
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
        this.save()
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

    async contextDataChange(data: ContextMenuData) {
        this.contextData = data
        const element = data.targetIsFolder
            ? getFolderJSONObjectByID(data.targetElementID, this.eclipseData.rootFolder)
            : getItemJSONObjectByItemID(data.targetElementID, this.eclipseData.rootFolder)
        if (element == undefined) {
            console.warn("element not found, search based on query:", data)
            return
        }
        if (data.actionPerformed == ContextAction.delete) {
            const parent = getFolderJSONObjectByID(element.parentFolderID!, this.eclipseData.rootFolder)
            if (parent == undefined) {
                console.warn("parent not found, search based on query:", data)
                return
            }
            removeElement(element, parent, this.eclipseData)
            this.save()
        }
        if (data.actionPerformed == ContextAction.toggle) {
            this.htmlTarget.click()
            console.log(this.htmlTarget)
        }
        if (data.actionPerformed == ContextAction.cascadeToggle && data.targetIsFolder) {
            toggleExpandCascade(element as folderData)
            this.save()
        }
        console.log(data)
    }

    //#endregion

    get shortenList() {
        let arr = new Array<elementData>()
        for (let key in this.eclipseData.rootFolder.elements) {
            const element = this.eclipseData.rootFolder.elements[key]
            if (element != undefined && element != null && "folderID" in element) arr.push(element)
        }
        return arr
    }

    save() {
        this.$emit("save")
    }

    renameEnd() {
        this.contextData = { targetElementID: "", targetIsFolder: false, actionPerformed: ContextAction.rename }
    }

    targetElementChange(element: elementData, parent: folderData) {
        this.targetElement = element
        this.targetElementParent = parent
        this.currentlyDragging = true
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
        if (event.keyCode == KeyCode.escape) {
            event.preventDefault()
            this.folderAddInput.value = ""
            this.folderAddInput.parentElement!.classList.toggle("disabled")
        }
    }

    elementMove(targetFolder: folderData) {
        if (this.targetElement != undefined) {
            if (!moveElement(this.targetElement, this.targetElementParent, targetFolder))
                console.warn("Unable to move element ", this.targetElement, this.targetElementParent, targetFolder)
            console.log("Moved target $1 to folder $2", this.targetElement, targetFolder)

            this.save()
        } else console.warn("TargetElement is undefined, unable to move element to folder ", targetFolder)
        this.currentlyDragging = false
    }

    bodyDrop() {
        if (this.targetElement != undefined) {
            if ("itemID" in this.targetElement) {
                const unorderedFolder = getFolderJSONObjectByID(defs.unorderedFolderID, this.eclipseData.rootFolder)
                if (unorderedFolder != undefined) moveElement(this.targetElement, this.targetElementParent, unorderedFolder)
            } else moveElement(this.targetElement, this.targetElementParent, this.eclipseData.rootFolder)
            this.save()
        }
        this.currentlyDragging = false
    }
}
</script>

<style src="@/assets/style/list.css"></style>
