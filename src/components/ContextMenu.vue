<template>
    <div ref="contextMenu" id="contextMenu" v-show="showContextMenu">
        <div class="noEvents" id="contextTitle">eclipseTabMenu</div>
        <div id="contextMenuList">
            <div id="contextMenu_generic">
                <div class="contextElement" id="contextMenu_generic_collapseAll" @click="contextMenu_generic_collapseAll_handler">
                    Collapse All
                </div>
                <div class="contextElement" id="contextMenu_generic_expandAll" @click="contextMenu_generic_expandAll_handler">Expand All</div>
                <div class="contextElement" id="contextMenu_generic_search" @click="contextMenu_generic_search_handler">Search</div>
                <div class="contextElement" @click="reportBug">Submit a bug</div>
            </div>
            <div ref="contextMenu_folder" id="contextMenu_folder" v-show="targetIsFolder">
                <div class="contextElement" id="contextMenu_folder_rename" @click="contextMenu_folder_rename_handler">Rename Folder</div>
                <div class="contextElement" id="contextMenu_folder_delete" @click="contextMenu_folder_delete_handler">Delete Folder</div>
                <div class="contextElement" id="contextMenu_folder_toggle" @click="contextMenu_folder_toggle_handler">
                    Open/Close Folder
                </div>
                <div class="contextElement" id="contextMenu_folder_cascade_toggle" @click="contextMenu_folder_cascade_toggle_handler">
                    Open/Close Folder and Subfolders
                </div>
                <div class="contextElement" id="contextMenu_folder_create_at_loc" @click="contextMenu_folder_create_at_location">
                    Create Folder at location
                </div>
            </div>
            <div ref="contextMenu_item" id="contextMenu_item" v-show="targetIsItem">
                <div class="contextElement" id="contextMenu_item_rename" @click="contextMenu_item_rename_handler">Rename item</div>
                <div class="contextElement" id="contextMenu_item_delete" @click="contextMenu_item_delete_handler">Delete item</div>
                <div
                    v-if="eclipseData.hideOrSwitchTab == false"
                    class="contextElement"
                    id="contextMenu_item_toggle"
                    @click="contextMenu_item_toggle_handler"
                >
                    Show/Hide item
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { ContextAction, ContextMenuData, tabStructData } from "@/scripts/interfaces"
import { pinnedFolderID, unorderedFolderID } from "@/scripts/dataHandler/definitions"
import { getManifest } from "@/scripts/browserHandler"
import { createTab } from "@/scripts/tabHelper"

@Options({
    components: {},
    props: {
        eclipseData: Object
    },
    emits: {
        collapseAll: Object,
        expandAll: Object,
        contextMenuTargetChange: Object,
        contextDataChange: Object,
        search: null
    }
})
export default class ContextMenu extends Vue {
    eclipseData!: tabStructData

    contextMenu!: HTMLElement

    menuData!: ContextMenu

    target!: HTMLElement
    targetID: string | undefined | null
    targetIsFolder: boolean = false
    targetIsItem: boolean = false

    showContextMenu: boolean = false

    mounted() {
        this.contextMenu = this.$refs.contextMenu as HTMLElement

        document.oncontextmenu = this.contextMenu_handler
        document.onclick = this.contextMenuClose_handler
    }

    async contextMenu_handler(event: any) {
        event.preventDefault()
        var target = event.explicitOriginalTarget as HTMLElement
        //console.log(target)
        this.contextMenu.style.left = event.clientX + "px"
        this.contextMenu.style.top = event.clientY + "px"

        this.showContextMenu = true

        if (
            target.getAttribute("folderID") != undefined &&
            target.getAttribute("folderID") != pinnedFolderID &&
            target.getAttribute("folderID") != unorderedFolderID
        ) {
            this.targetID = target.getAttribute("folderID")
            this.targetIsFolder = true
            this.targetIsItem = false
        } else if (
            target.getAttribute("itemID") != undefined &&
            target.getAttribute("parentID") != pinnedFolderID &&
            target.getAttribute("parentID") != unorderedFolderID
        ) {
            this.targetID = target.getAttribute("itemID")
            this.targetIsFolder = false
            this.targetIsItem = true
        }

        this.target = target

        this.$emit("contextMenuTargetChange", target)
    }

    async contextMenuClose_handler() {
        this.showContextMenu = false
        this.targetIsFolder = false
        this.targetIsItem = false
    }

    async contextMenu_generic_collapseAll_handler() {
        this.$emit("collapseAll")
    }

    async contextMenu_generic_expandAll_handler() {
        this.$emit("expandAll")
    }

    async contextMenu_generic_search_handler() {
        this.$emit("search")
    }

    async contextMenu_folder_rename_handler() {
        this.menuDataChangeEmit({
            targetElementID: this.targetID!,
            targetIsFolder: this.targetIsFolder,
            actionPerformed: ContextAction.rename
        })
    }

    async contextMenu_folder_delete_handler() {
        this.menuDataChangeEmit({
            targetElementID: this.targetID!,
            targetIsFolder: this.targetIsFolder,
            actionPerformed: ContextAction.delete
        })
    }

    async contextMenu_folder_toggle_handler() {
        this.menuDataChangeEmit({
            targetElementID: this.targetID!,
            targetIsFolder: this.targetIsFolder,
            actionPerformed: ContextAction.toggle
        })
    }

    async contextMenu_folder_cascade_toggle_handler() {
        this.menuDataChangeEmit({
            targetElementID: this.targetID!,
            targetIsFolder: this.targetIsFolder,
            actionPerformed: ContextAction.cascadeToggle
        })
    }

    async contextMenu_item_rename_handler() {
        this.menuDataChangeEmit({
            targetElementID: this.targetID!,
            targetIsFolder: this.targetIsFolder,
            actionPerformed: ContextAction.rename
        })
    }

    async contextMenu_item_delete_handler() {
        this.menuDataChangeEmit({
            targetElementID: this.targetID!,
            targetIsFolder: this.targetIsFolder,
            actionPerformed: ContextAction.delete
        })
    }

    async contextMenu_item_toggle_handler() {
        this.menuDataChangeEmit({
            targetElementID: this.targetID!,
            targetIsFolder: this.targetIsFolder,
            actionPerformed: ContextAction.toggle
        })
    }

    async contextMenu_folder_create_at_location(){
        this.menuDataChangeEmit({
            targetElementID: this.targetID!,
            targetIsFolder: this.targetIsFolder,
            actionPerformed: ContextAction.createAtLocation
        })
    }

    menuDataChangeEmit(data: ContextMenuData) {
        this.$emit("contextDataChange", data)
    }

    reportBug() {
        createTab("https://universegame.de/bug/?app=eclipseTabs&v=" + this.extensionVersion)
    }

    get extensionVersion() {
        return getManifest().version
    }
}
</script>

<style src="@/assets/style/context.css"></style>
