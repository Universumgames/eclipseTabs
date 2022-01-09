<template>
    <div ref="contextMenu" id="contextMenu" class="disabled">
        <div class="noEvents" id="contextTitle">eclipseTabMenu</div>
        <div id="contextMenuList">
            <div id="contextMenu_generic">
                <div class="contextElement" id="contextMenu_generic_collapseAll" @click="this.contextMenu_generic_collapseAll_handler">
                    Collapse All
                </div>
                <div class="contextElement" id="contextMenu_generic_expandAll" @click="this.contextMenu_generic_expandAll_handler">Expand All</div>
                <div class="contextElement" id="contextMenu_generic_search" @click="this.contextMenu_generic_search_handler">Search</div>
            </div>
            <div ref="contextMenu_folder" id="contextMenu_folder" class="disabled">
                <div class="contextElement" id="contextMenu_folder_rename" @click="this.contextMenu_folder_rename_handler">Rename Folder</div>
                <div class="contextElement" id="contextMenu_folder_delete" @click="this.contextMenu_folder_delete_handler">Delete Folder</div>
                <div class="contextElement" id="contextMenu_folder_toggle" @click="this.contextMenu_folder_toggle_handler">
                    Open/Close Folder
                </div>
                <div class="contextElement" id="contextMenu_folder_cascade_toggle" @click="this.contextMenu_folder_cascade_toggle_handler">
                    Open/Close Folder and Subfolders
                </div>
            </div>
            <div ref="contextMenu_item" id="contextMenu_item" class="disabled">
                <div class="contextElement" id="contextMenu_item_rename" @click="this.contextMenu_item_rename_handler">Rename item</div>
                <div class="contextElement" id="contextMenu_item_delete" @click="this.contextMenu_item_delete_handler">Delete item</div>
                <div
                    v-if="this.eclipseData.hideOrSwitchTab == false"
                    class="contextElement"
                    id="contextMenu_item_toggle"
                    @click="this.contextMenu_item_toggle_handler"
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
    contextMenu_item!: HTMLElement
    contextMenu_folder!: HTMLElement

    menuData!: ContextMenu

    target!: HTMLElement
    targetID: string | undefined | null
    targetIsFolder: boolean = false

    mounted() {
        this.contextMenu = this.$refs.contextMenu as HTMLElement
        this.contextMenu_item = this.$refs.contextMenu_item as HTMLElement
        this.contextMenu_folder = this.$refs.contextMenu_folder as HTMLElement

        document.oncontextmenu = this.contextMenu_handler
        document.onclick = this.contextMenuClose_handler
    }

    async contextMenu_handler(event: any) {
        event.preventDefault()
        var target = event.explicitOriginalTarget as HTMLElement
        //console.log(target)
        this.contextMenu.style.left = event.clientX + "px"
        this.contextMenu.style.top = event.clientY + "px"

        this.contextMenu.classList.remove("disabled")
        this.contextMenu_folder.classList.add("disabled")
        this.contextMenu_item.classList.add("disabled")

        if (
            target.getAttribute("folderID") != undefined &&
            target.getAttribute("folderID") != pinnedFolderID &&
            target.getAttribute("folderID") != unorderedFolderID
        ) {
            this.contextMenu_folder.classList.remove("disabled")
            this.targetID = target.getAttribute("folderID")
            this.targetIsFolder = true
        } else if (
            target.getAttribute("itemID") != undefined &&
            target.getAttribute("parentID") != pinnedFolderID &&
            target.getAttribute("parentID") != unorderedFolderID
        ) {
            this.contextMenu_item.classList.remove("disabled")
            this.targetID = target.getAttribute("itemID")
            this.targetIsFolder = false
        }

        this.target = target

        this.$emit("contextMenuTargetChange", target)
    }

    async contextMenuClose_handler() {
        this.contextMenu.classList.add("disabled")
        this.contextMenu_folder.classList.add("disabled")
        this.contextMenu_item.classList.add("disabled")
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

    menuDataChangeEmit(data: ContextMenuData) {
        this.$emit("contextDataChange", data)
    }
}
</script>

<style src="@/assets/style/context.css"></style>
