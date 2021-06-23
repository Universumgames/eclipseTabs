<template>
    <div ref="contextMenu" id="contextMenu" :class="'disabled ' + this.colorClass">
        <div class="noEvents" id="contextTitle">eclipseTabMenu</div>
        <div id="contextMenuList">
            <div id="contextMenu_generic">
                <div id="contextMenu_generic_collapseAll">Collapse All</div>
                <div id="contextMenu_generic_expandAll">Expand All</div>
            </div>
            <div ref="contextMenu_folder" class="disabled">
                <div id="contextMenu_folder_rename">Rename Folder</div>
                <div id="contextMenu_folder_delete">Delete Folder</div>
            </div>
            <div ref="contextMenu_item" id="contextMenu_item" class="disabled">
                <div id="contextMenu_item_rename">Rename item</div>
                <div id="contextMenu_item_delete">Delete item</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { ColorScheme, tabStructData } from "@/scripts/interfaces"

@Options({
    components: {},
    props: {
        eclipseData: Object
    },
    emits: {}
})
export default class ContextMenu extends Vue {
    eclipseData!: tabStructData

    contextMenu!: HTMLElement
    contextMenu_item!: HTMLElement
    contextMenu_folder!: HTMLElement

    mounted() {
        this.contextMenu = this.$refs.contextMenu as HTMLElement
        this.contextMenu_item = this.$refs.contextMenu_item as HTMLElement
        this.contextMenu_folder = this.$refs.contextMenu_folder as HTMLElement

        document.oncontextmenu = this.contextMenu_handler
        document.onclick = this.contextMenuClose_handler
    }

    get colorClass() {
        return this.eclipseData.colorScheme == ColorScheme.dark ? "darkmode" : "lightmode"
    }

    async contextMenu_handler(event: any) {
        event.preventDefault()
        var target = event.explicitOriginalTarget as HTMLElement
        this.contextMenu.classList.remove("disabled")
        this.contextMenu.style.left = event.clientX + "px"
        this.contextMenu.style.top = event.clientY + "px"
        if (target.getAttribute("folderID") != undefined) this.contextMenu_folder.classList.remove("disabled")

        if (target.getAttribute("itemID") != undefined) this.contextMenu_item.classList.remove("disabled")

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

    async contextMenu_folder_rename_handler() {
        this.$emit("contextFolderRenameStart")
    }

    async contextMenu_folder_delete_handler() {
        this.$emit("contextFolderDelete")
    }

    async contextMenu_item_rename_handler() {
        this.$emit("contextItemRenameStart")
    }

    async contextMenu_item_delete_handler() {
        this.$emit("contextItemDelete")
    }
}
</script>

<style src="@/assets/style/context.css"></style>
