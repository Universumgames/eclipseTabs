<template>
    <div ref="container">
        <div ref="dropContainer" :folderID="folderData.folderID" :parentID="folderData.parentFolderID"
            :index="folderData.index" class="element" tabindex="0" @click="folderClick" @keyup.enter="folderClick">
            <!--Dropdown icon-->
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 8 14"
                :class="'arrow noEvents ' + (!folderData.open ? '' : 'rotated')" :id="folderData.folderID + '_image'"
                ref="icon" preserveAspectRatio="none" alt="arrow indicating open/closed state" role="img"
                aria-label="arrow indicating open/close state of folder">
                <path
                    style="fill:none;stroke:#f98604;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                    d="M 0.82682333,12.402343 6.6145833,6.6145833 0.82682333,0.82682333" />
            </svg>
            <span
                :class="containedInSearchResult() ? 'searched dot' : containsSearchedElement() ? 'searchedContainer dot' : ''"
                style="display: inline;"></span>
            <!--Text node-->
            <div class="noEvents name">
                {{ folderData.name }} <small>({{ getter_getNumberOfOpenedTabs(folderData) }})</small>
            </div>
        </div>
        <!--Child container-->
        <div class="folderChildContainer">
            <div v-if="folderData.open && folderData.elements.length > 0">
                <div v-for="element in folderData.elements" :key="element.index">
                    <Item v-if="'itemID' in element" :itemData="element" :allreload="allreload" :parentFolder="folderData"
                        :htmlTarget="htmlTarget" :targetElement="targetElement" :contextData="contextData"
                        :searchResults="searchResults" v-on:save="save" v-on:targetElementChange="targetElementChangePassOn"
                        v-on:renameEnd="renameEnd" v-on:dragend="$emit('dragend', undefined)"></Item>
                    <Folder v-if="'folderID' in element" :eclipseData="eclipseData" :folderData="element"
                        :allreload="allreload" :parentFolder="folderData" :htmlTarget="htmlTarget"
                        :targetElement="targetElement" :contextData="contextData" :searchResults="searchResults"
                        v-on:save="save" v-on:targetElementChange="targetElementChangePassOn" v-on:move="movePassOn"
                        v-on:renameEnd="renameEnd" v-on:dragend="$emit('dragend', undefined)"></Folder>
                </div>
            </div>
        </div>
        <!--renaming functionality-->
        <input v-show="isRenameable" ref="renameInput" type="text" :placeholder="folderData.name"
            :class="(rename ? '' : 'disabled') + ' folder'" @keyup="renameSubmit" />
        <!--Inbetween-->
        <div v-show="modeMove" isInbetween="true" @drop="inbetweenDrop" ref="inbetween">
            <small class="noEvents">Insert Below {{ folderData.name }}</small>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import Item from "@/components/Item.vue"
import { ContextAction, ContextMenuData, KeyCode, Mode } from "@/scripts/interfaces"
import * as defs from "@/scripts/definitions"
import { eclipseStore } from "@/store"
import { TabStructData } from "@/scripts/tabStructData"
import { ElementData, FolderData } from "@/scripts/elementData"

@Options({
    components: { Item },
    props: {
        //eclipseData: Object,
        folderData: Object,
        parentFolder: Object,
        htmlTarget: Object,
        targetElement: Object,
        contextData: Object,
        allreload: Function,
        searchResults: Array
    }
})
export default class Folder extends Vue {
    folderData!: FolderData
    parentFolder!: FolderData
    //eclipseData!: tabStructData
    htmlTarget: HTMLElement | undefined = undefined
    targetElement: ElementData | undefined = undefined
    contextData!: ContextMenuData
    allreload!: Function
    searchResults!: ElementData[]
    icon!: HTMLElement
    renameInput!: HTMLElement
    container!: HTMLElement
    inbetween!: HTMLElement
    dropContainer!: HTMLElement

    oldRename: boolean = false

    store = eclipseStore()

    // oldOpened: Boolean = false

    get eclipseData(): TabStructData {
        return this.store.state.eclipseData
    }

    mounted() {
        this.icon = this.$refs.icon as HTMLElement
        this.renameInput = this.$refs.renameInput as HTMLElement
        this.container = this.$refs.container as HTMLElement
        //if (this.tier != 0) this.container.style.marginLeft = 1.5 + "rem"
        this.inbetween = this.$refs.inbetween as HTMLElement
        this.dropContainer = this.$refs.dropContainer as HTMLElement

        //register drag events
        if (this.isRenameable) {
            this.dropContainer.draggable = true
            this.dropContainer.addEventListener("dragstart", this.dragstart_handler)
            this.dropContainer.addEventListener("drop", this.drop_handler)
            this.dropContainer.addEventListener("dragover", this.dragover_handler)
            this.dropContainer.addEventListener("dropend", this.dropend_handler)
            this.dropContainer.addEventListener("dragend", this.dragend_handler)
            this.dropContainer.addEventListener("dragenter", this.dragenter_handler)
            this.dropContainer.addEventListener("dragleave", this.dragleave_handler)
        }

        this.dropContainer.setAttribute("folderID", this.folderData.folderID)

        this.inbetween.addEventListener("dragover", e => {
            e.preventDefault()
        })

        // this.oldOpened = this.folderData.open
    }

    updated() {
        if (!this.oldRename && this.rename) {
            this.renameInput.focus()
        }
        this.oldRename = this.rename
    }

    renameSubmit(event: any) {
        if (event.keyCode == KeyCode.enter) {
            event.preventDefault()
            var value = event.originalTarget.value
            if (value != "") this.folderData.name = value
            this.renameEnd()
            this.save()
        }
        if (event.keyCode == KeyCode.escape) {
            this.renameEnd()
        }
    }

    get isRenameable() {
        return this.folderData.folderID != defs.pinnedFolderID && this.folderData.folderID != defs.unorderedFolderID
    }

    get rename() {
        return (
            this.contextData.targetElementID == this.folderData.folderID &&
            this.contextData.targetIsFolder == true &&
            this.contextData.actionPerformed == ContextAction.rename
        )
    }

    get delete() {
        return (
            this.contextData.targetElementID == this.folderData.folderID &&
            this.contextData.targetIsFolder == true &&
            this.contextData.actionPerformed == ContextAction.delete
        )
    }

    get modeMove() {
        return this.eclipseData.mode == Mode.Move
    }

    containedInSearchResult(): boolean {
        for (const element of this.searchResults) {
            if ("folderID" in element) {
                const f = element as FolderData
                if (f.folderID == this.folderData.folderID) return true
                //if (f.parentFolderID == this.folderData.folderID) return true
            }
            //if (folderOrChildrenContainsElement(element, this.folderData.elements)) return true
            /* if ("itemID" in element) {
                const i = element as itemData
                if (i.parentFolderID == this.folderData.folderID) return true
            } */
        }
        return false
    }

    containsSearchedElement(): boolean {
        for (const element of this.searchResults) {
            if (this.folderData.containsElement(element)) return true
        }
        return false
    }

    sendTargetElementChange() {
        this.$emit("targetElementChange", this.folderData, this.parentFolder)
    }

    targetElementChangePassOn(element: ElementData, parent: FolderData) {
        this.$emit("targetElementChange", element, parent)
    }

    folderClick(e: any) {
        if (e.explicitOriginalTarget == this.dropContainer || e.originalTarget == this.dropContainer) {
            this.folderData.open = !this.folderData.open
            this.save()
        }
    }

    save() {
        this.$emit("save")
    }

    renameEnd() {
        this.$emit("renameEnd")
    }

    dragstart_handler(event: any) {
        if (event.explicitOriginalTarget == this.dropContainer) {
            this.container.classList.add("hover")
            this.sendTargetElementChange()
            this.$emit("dragstart", event)
        }
    }

    drop_handler(event: any) {
        this.container.classList.remove("hover")
        if (event.explicitOriginalTarget == this.dropContainer) this.$emit("move", this.folderData)
    }

    movePassOn(targetFolder: FolderData) {
        this.$emit("move", targetFolder)
    }

    dragover_handler(e: any) {
        e.preventDefault()
    }

    dropend_handler() {
        //empty
        this.$emit("dragend", undefined)
    }

    dragend_handler() {
        this.container.classList.remove("hover")
    }

    dragenter_handler() {
        if (this.targetElement != this.folderData) {
            // this.oldOpened = this.folderData.open
            // this.folderData.open = true
            this.container.classList.add("hover")
        }
    }

    dragleave_handler() {
        if (this.targetElement != this.folderData) {
            this.container.classList.remove("hover")
            // this.folderData.open = this.oldOpened
        }
    }

    inbetweenDrop() {
        if (this.targetElement == undefined) return
        if (this.targetElement.parentFolderID != this.folderData.parentFolderID) {
            this.store.state.eclipseData.moveElement(
                this.targetElement!,
                this.store.state.eclipseData.findFolderByID(this.folderData.parentFolderID)!
            )
        }
        this.targetElement.index = +this.folderData.index + 1
        this.save()
        this.allreload()
    }

    getter_getNumberOfOpenedTabs(folder: FolderData) {
        return folder.getNumberOfOpenTabs()
    }
}
</script>

<style>
.folderChildContainer {
    margin-left: 1.5rem;
}
</style>