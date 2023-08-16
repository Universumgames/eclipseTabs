<template>
    <div id="sidebar">
        <!--List container-->
        <div id="container">
            <div id="list" ref="list" class="scroller">
                <Folder v-for="folder in shortenList" v-bind:key="folder.folderID" :folderData="folder"
                    :allreload="allreload" :parentFolder="store.state.eclipseData.rootFolder" :htmlTarget="htmlTarget"
                    :targetElement="targetElement" :contextData="contextData" :searchResults="searchResults"
                    v-on:save="save" v-on:targetElementChange="targetElementChange" v-on:move="elementMove"
                    v-on:renameEnd="renameEnd" v-on:dragend="currentlyDragging = false" />

                <!--add folder name input-->
                <div id="addFolderNameInputContainer" class="disabled">
                    <p>{{ folderCreateNote }}</p>
                    <input type="text" ref="addFolderNameInput" placeholder="foldername" @keyup="addFolderSubmit" />
                </div>
                <div v-show="currentlyDragging" ref="rootDropoff">
                    <span>Dropoff spot for moving to root level</span>
                </div>
                <div id="searchInput" v-show="currentlySearching">
                    <input type="text" v-model="queryString" @keyup="onQueryUpdate" placeholder="search query"
                        ref="searchInputElement" style="display:inline" />
                    <button style="margin-top: 1ch;" @click="matchCaseBtnClick"
                        :class="searchMatchCase ? 'highlighted' : ''">
                        Match case
                    </button>
                    <p style="margin: 1ch">Found {{ searchResults.length }} matching elements</p>
                    <button style="margin-top: 1ch" @click="revealFoundElements">Reveal all found elements</button>
                    <button style="margin-top: 1ch" @click="currentlySearching = false">Close search</button>
                </div>
            </div>

            <!--Bottom Menu-->
            <BottomMenu :eclipseData="store.state.eclipseData" :targetElement="targetElement"
                :targetElementParent="targetElementParent" :allreload="allreload" :deleteVisible="currentlyDragging"
                v-on:folderClick="addFolderClick" v-on:binDrop="binDrop" v-on:clearStructClick="clearStructClick"
                v-on:moveClick="moveClick" />
        </div>

        <!--Context menu-->
        <context-menu :eclipseData="store.state.eclipseData" v-on:collapseAll="collapseAllClick" v-on:expandAll="expandAll"
            v-on:contextDataChange="contextDataChange" v-on:contextMenuTargetChange="contextMenuTargetChange"
            v-on:search="contextSearchBegin" />
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { ContextAction, ContextMenuData, KeyCode, Mode } from "@/scripts/interfaces"
import { shareString } from "@/scripts/share"
import BottomMenu from "@/components/Bottom.vue"
import ContextMenu from "@/components/ContextMenu.vue"
import Folder from "@/components/Folder.vue"
import { reactive } from "vue"
import { createTab } from "@/scripts/tabHelper"
import { State, eclipseStore } from "@/store"
import { ElementData, FolderData } from "@/scripts/elementData"
import { createEmptyData } from "@/scripts/tabStructData"
import { Store } from "vuex"


@Options({
    components: { BottomMenu, ContextMenu, Folder },
    props: {
        allreload: Function
    }
})
export default class Sidebar extends Vue {
    allreload: Function = () => { }
    store: Store<State> = eclipseStore()

    htmlTarget: HTMLElement = document.body
    targetElement: ElementData = this.store.state.eclipseData.rootFolder
    targetElementParent: FolderData = this.store.state.eclipseData.rootFolder
    contextData = reactive<ContextMenuData>({ targetElementID: "", targetIsFolder: false, actionPerformed: ContextAction.rename, unsafe: true })

    folderCreateNote = "Create new Folder"

    currentlyDragging: Boolean = false
    currentlySearching: Boolean = false
    searchInputElement!: HTMLInputElement

    searchResults: ElementData[] = []
    queryString = ""
    searchMatchCase = false

    folderAddInput!: HTMLInputElement

    rootDropOffElement!: HTMLElement

    mounted() {
        console.log(this.store.state.eclipseData)

        this.folderAddInput = this.$refs.addFolderNameInput as HTMLInputElement

        this.htmlTarget = this.$refs.list as HTMLElement
        this.targetElement = this.store.state.eclipseData.rootFolder
        this.targetElementParent = this.store.state.eclipseData.rootFolder
        this.rootDropOffElement = this.$refs.rootDropoff as HTMLElement
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
        this.store.state.eclipseData.removeElement(this.targetElement, this.targetElementParent.folderID)
        this.save()
        this.currentlyDragging = false
    }

    moveClick() {
        switch (this.store.state.eclipseData.mode) {
            case Mode.Default:
                this.store.state.eclipseData.mode = Mode.Move
                break
            case Mode.Move:
                this.store.state.eclipseData.mode = Mode.Default
                break
            default:
                this.store.state.eclipseData.mode = Mode.Default
        }
        this.save()
    }

    async clearStructClick() {
        this.$emit("clearStructClick")
        this.store.state.eclipseData = createEmptyData()
        this.allreload()
    }
    //#endregion

    //#region context menu events
    async collapseAllClick() {
        this.store.state.eclipseData.collapseAllFolders()
        this.save()
    }

    async expandAll() {
        this.store.state.eclipseData.expandAllFolders()
        this.save()
    }

    contextMenuTargetChange(contextMenuTarget: HTMLElement) {
        this.htmlTarget = contextMenuTarget
    }

    async contextDataChange(data: ContextMenuData) {
        this.contextData = data
        const element = data.targetIsFolder
            ? this.store.state.eclipseData.findFolderByID(data.targetElementID)
            : this.store.state.eclipseData.findItemByID(data.targetElementID)
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
            const parent = this.store.state.eclipseData.findFolderByID(element.parentFolderID!)
            if (parent == undefined) {
                console.warn("parent not found, search based on query:", data)
                return
            }
            this.store.state.eclipseData.removeElement(element, parent.folderID)
            this.save()
        }
        if (data.actionPerformed == ContextAction.toggle) {
            this.htmlTarget.click()
            // console.log(this.htmlTarget)
        }
        if (data.actionPerformed == ContextAction.cascadeToggle && data.targetIsFolder) {
            element instanceof FolderData ? element.toggleAll() : console.warn("element is not a folder, search based on query:", data)
            this.save()
        }
        if (data.actionPerformed == ContextAction.createAtLocation && data.targetIsFolder) {
            this.addFolderClick()
            this.folderCreateNote = "Create new Folder at " + this.store.state.eclipseData.findFolderByID(data.targetElementID)?.name
        }
    }

    //#endregion

    get shortenList() {
        let arr = new Array<FolderData>()
        for (let key in this.store.state.eclipseData.rootFolder.elements) {
            const element = this.store.state.eclipseData.rootFolder.elements[key]
            if (element != undefined && element != null && "folderID" in element) arr.push(element as FolderData)
        }
        return arr
    }

    save() {
        this.$emit("save")
    }

    renameEnd() {
        this.contextData = { targetElementID: "", targetIsFolder: false, actionPerformed: ContextAction.rename, unsafe: true }
    }

    targetElementChange(element: ElementData, parent: FolderData) {
        this.targetElement = element
        this.targetElementParent = parent
        this.currentlyDragging = true
    }

    async addFolderSubmit(event: any) {
        if (event.keyCode == KeyCode.enter) {
            event.preventDefault()
            var newFolderName = this.folderAddInput.value
            this.folderAddInput.value = ""
            this.folderAddInput.parentElement!.classList.toggle("disabled")

            if (newFolderName == "") return
            if (this.contextData != undefined && this.contextData.actionPerformed == ContextAction.createAtLocation) {
                const parentFolder = this.store.state.eclipseData.findFolderByID(this.contextData.targetElementID)
                if (parentFolder == undefined) return
                parentFolder.createFolder(newFolderName)
                this.contextData.actionPerformed = ContextAction.none
            } else this.store.state.eclipseData.rootFolder.createFolder(newFolderName)
            this.save()
        }
        if (event.keyCode == KeyCode.escape) {
            event.preventDefault()
            this.folderAddInput.value = ""
            this.folderAddInput.parentElement!.classList.toggle("disabled")
        }
    }

    elementMove(targetFolder: FolderData) {
        if (this.targetElement != undefined) {
            if (this.store.state.eclipseData.moveElement(this.targetElement, targetFolder))
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
                const unorderedFolder = this.store.state.eclipseData.getUnorderedFolder()
                if (unorderedFolder != undefined) this.store.state.eclipseData.moveElement(this.targetElement, unorderedFolder)
            } else this.store.state.eclipseData.moveElement(this.targetElement, this.store.state.eclipseData.rootFolder)
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
        this.searchResults = this.store.state.eclipseData.search(new RegExp(`/${this.queryString}`, this.searchMatchCase ? "g" : "gi"))
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
            this.store.state.eclipseData.revealElement(element)
        }
        this.save()
    }

    share(element: ElementData) {
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
