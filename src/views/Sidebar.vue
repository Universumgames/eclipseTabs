<template>
    <div id="sidebar">
        <!--List container-->
        <div id="container">
            <div id="list" ref="list" class="scroller">
                <Folder
                    v-for="folder in shortenList"
                    v-bind:key="folder.folderID"
                    :eclipseData="eclipseData"
                    :folderData="folder"
                    :tier="0"
                    :allreload="allreload"
                    :parentFolder="eclipseData.rootFolder"
                    :htmlTarget="htmlTarget"
                    :targetElement="targetElement"
                    :contextData="contextData"
                    :searchResults="searchResults"
                    v-on:save="save"
                    v-on:targetElementChange="targetElementChange"
                    v-on:move="elementMove"
                    v-on:renameEnd="renameEnd"
                    v-on:dragend="currentlyDragging = false"
                />

                <!--add folder name input-->
                <div id="addFolderNameInputContainer" class="disabled">
                    <p>{{ folderCreateNote }}</p>
                    <input type="text" ref="addFolderNameInput" placeholder="foldername" @keyup="addFolderSubmit" />
                </div>
                <div v-show="currentlyDragging" ref="root_dropoff" id="root_dropoff">
                    <span>Dropoff spot for moving to root level</span>
                </div>
                <div id="searchInput" v-show="currentlySearching">
                    <input
                        type="text"
                        v-model="queryString"
                        @keyup="onQueryUpdate"
                        placeholder="search query"
                        ref="searchInputElement"
                        style="display:inline"
                    />
                    <button style="margin-top: 1ch;" @click="matchCaseBtnClick" :class="searchMatchCase ? 'highlighted' : ''">
                        Match case
                    </button>
                    <p style="margin: 1ch">Found {{ searchResults.length }} matching elements</p>
                    <button style="margin-top: 1ch" @click="revealFoundElements">Reveal all found elements</button>
                    <button style="margin-top: 1ch" @click="currentlySearching = false">Close search</button>
                </div>
            </div>

            <!--Bottom Menu-->
            <BottomMenu
                :eclipseData="eclipseData"
                :targetElement="targetElement"
                :targetElementParent="targetElementParent"
                :allreload="allreload"
                :deleteVisible="currentlyDragging"
                v-on:folderClick="addFolderClick"
                v-on:binDrop="binDrop"
                v-on:clearStructClick="clearStructClick"
                v-on:moveClick="moveClick"
            />
        </div>

        <!--Context menu-->
        <context-menu
            :eclipseData="eclipseData"
            v-on:collapseAll="collapseAllClick"
            v-on:expandAll="expandAll"
            v-on:contextDataChange="contextDataChange"
            v-on:contextMenuTargetChange="contextMenuTargetChange"
            v-on:search="contextSearchBegin"
        />
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { ContextAction, ContextMenuData, elementData, folderData, itemData, KeyCode, Mode, tabStructData } from "@/scripts/interfaces"
import { generateFolderID, getFolderJSONObjectByID, getItemJSONObjectByItemID, saveDataInFirefox, search } from "@/scripts/dataHandler/getter"
import { addFolderDirect, createEmptyData } from "@/scripts/dataHandler/adder"
import * as defs from "@/scripts/dataHandler/definitions"
import {
    collapseAllDirect,
    expandAllDirect,
    moveElement,
    removeElement,
    revealElementDirect,
    toggleExpandCascade
} from "@/scripts/dataHandler/changer"
import { shareString } from "@/scripts/share"

import BottomMenu from "@/components/Bottom.vue"
import ContextMenu from "@/components/ContextMenu.vue"
import Folder from "@/components/Folder.vue"
import { reactive } from "vue"
import { createTab } from "@/scripts/tabHelper"

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
    contextData = reactive<ContextMenuData>({ targetElementID: "", targetIsFolder: false, actionPerformed: ContextAction.rename, unsafe: true })

    folderCreateNote = "Create new Folder"

    currentlyDragging: Boolean = false
    currentlySearching: Boolean = false
    searchInputElement!: HTMLInputElement

    searchResults: elementData[] = []
    queryString = ""
    searchMatchCase = false

    folderAddInput!: HTMLInputElement

    rootDropOffElement!: HTMLElement

    mounted() {
        // console.log(this.eclipseData)

        this.folderAddInput = this.$refs.addFolderNameInput as HTMLInputElement

        this.htmlTarget = this.$refs.list as HTMLElement
        this.targetElement = this.eclipseData.rootFolder
        this.targetElementParent = this.eclipseData.rootFolder
        this.rootDropOffElement = this.$refs.root_dropoff as HTMLElement
        this.searchInputElement = this.$refs.searchInputElement as HTMLInputElement

        this.rootDropOffElement.addEventListener("drop", this.bodyDrop)
        this.rootDropOffElement.addEventListener("dragover", e => {
            e.preventDefault()
        })

        // document.body.addEventListener("keyup", this.onKeyPressBody)
    }

    //#region bottom menu events
    addFolderClick() {
        this.folderCreateNote = "Create new Folder"
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
        // console.log(data)

        // allow unsafe (action on "other" and "pinned" folders)
        if (data.actionPerformed == ContextAction.share) {
            this.share(element)
        }

        if (data.unsafe) return
        // do not allow unsafe
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
            // console.log(this.htmlTarget)
        }
        if (data.actionPerformed == ContextAction.cascadeToggle && data.targetIsFolder) {
            toggleExpandCascade(element as folderData)
            this.save()
        }
        if (data.actionPerformed == ContextAction.createAtLocation && data.targetIsFolder) {
            this.addFolderClick()
            this.folderCreateNote = "Create new Folder at " + getFolderJSONObjectByID(data.targetElementID, this.eclipseData.rootFolder)?.name
        }
    }

    //#endregion

    get shortenList() {
        let arr = new Array<folderData>()
        for (let key in this.eclipseData.rootFolder.elements) {
            const element = this.eclipseData.rootFolder.elements[key]
            if (element != undefined && element != null && "folderID" in element) arr.push(element as folderData)
        }
        return arr
    }

    save() {
        this.$emit("save")
    }

    renameEnd() {
        this.contextData = { targetElementID: "", targetIsFolder: false, actionPerformed: ContextAction.rename, unsafe: true }
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

            if (value == "") return
            if (this.contextData != undefined && this.contextData.actionPerformed == ContextAction.createAtLocation) {
                const parentFolder = getFolderJSONObjectByID(this.contextData.targetElementID, this.eclipseData.rootFolder)
                if (parentFolder == undefined) return
                addFolderDirect(parentFolder, (await generateFolderID()).toString(), value)
                this.contextData.actionPerformed = ContextAction.none
            } else addFolderDirect(this.eclipseData.rootFolder, (await generateFolderID()).toString(), value)
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
            // else console.log("Moved target $1 to folder $2", this.targetElement, targetFolder)

            this.save()
        } else console.warn("TargetElement is undefined, unable to move element to folder ", targetFolder)
        this.currentlyDragging = false
        // this.$forceUpdate()
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

    contextSearchBegin() {
        this.currentlySearching = true
        setTimeout(() => {
            this.searchInputElement.focus()
        }, 200)
    }

    async onQueryUpdate(event: any | undefined) {
        if (event && event.keyCode == KeyCode.escape) {
            event.preventDefault()
            this.closeSearch()
            return
        }
        // console.log(this.queryString)
        this.searchResults = search({ text: this.queryString, matchCase: this.searchMatchCase }, this.eclipseData.rootFolder)
        // console.log("Search Results: ", this.searchResults)
    }

    async matchCaseBtnClick() {
        this.searchMatchCase = !this.searchMatchCase
        this.onQueryUpdate(undefined)
    }

    async closeSearch() {
        this.currentlySearching = false
        this.searchResults = []
    }

    async revealFoundElements() {
        for (const element of this.searchResults) {
            revealElementDirect(element, this.eclipseData)
        }
        this.save()
    }

    share(element: elementData) {
        const share = shareString(element)
        //prompt("Copy to clipboard: Ctrl+C, Enter", share)
        let a = URL.createObjectURL(new Blob([share]))
        createTab(a)
    }

    /* onKeyPressBody(event: any) {
        if (event.keyCode == KeyCode.escape) {
            this.currentlySearching = false
            this.folderAddInput.value = ""
            this.folderAddInput.parentElement!.classList.add("disabled")
        } else {
            console.log(event)
            this.contextSearchBegin()
        }
    } */
}
</script>

<style src="@/assets/style/list.css"></style>
