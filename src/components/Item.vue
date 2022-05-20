<template>
    <div
        ref="container"
        :class="'overflow listItem element ' + (hidden ? 'tabHidden' : '') + ' ' + (containedInSearchResult() ? 'highlighted' : '')"
        @click="click"
        @keyup.enter="click"
        @dragstart="dragstart_handler"
        @dropend="dropend_handler"
        @dragend="dragend_handler"
        tabindex="0"
        :title="itemData.url"
    >
        <div ref="dropContainer" :itemID="itemData.itemID" :index="itemData.index" :parentID="itemData.parentFolderID">
            <img :src="itemData.favIconURL" class="favicon noEvents" alt="FavIcon of website" />
            <div class="noEvents name">{{ itemData.title }}</div>
        </div>
        <input type="text" :class="rename ? '' : 'disabled'" :placeholder="itemData.title" @keyup="renameSubmit" ref="renameInput" />
        <div v-show="modeMove" @drop="inbetweenDrop" ref="inbetween">
            <small class="noEvents">Insert Below {{ itemData.title }}</small>
        </div>
    </div>
</template>

<script lang="ts">
import { moveElement } from "@/scripts/dataHandler/changer"
import { getFolderJSONObjectByID } from "@/scripts/dataHandler/getter"
import { ContextAction, ContextMenuData, elementData, folderData, itemData, KeyCode, Mode, tabStructData } from "@/scripts/interfaces"
import * as tabHelper from "@/scripts/tabHelper"
import { Options, Vue } from "vue-class-component"

@Options({
    components: {},
    props: {
        eclipseData: Object,
        itemData: Object,
        parentFolder: Object,
        htmlTarget: Object,
        targetElement: Object,
        contextData: Object,
        tier: Number,
        allreload: Function,
        searchResults: Array
    }
})
export default class Item extends Vue {
    itemData!: itemData
    parentFolder!: folderData
    eclipseData!: tabStructData
    htmlTarget: HTMLElement | undefined = undefined
    targetElement: elementData | undefined = undefined
    contextData!: ContextMenuData
    tier: number = 0
    allreload!: Function
    searchResults!: elementData[]

    container!: HTMLElement
    dropContainer!: HTMLElement
    inbetween!: HTMLElement
    renameInput!: HTMLInputElement

    oldRename: boolean = false

    mounted() {
        this.container = this.$refs.container as HTMLElement
        if (this.tier != 0) this.container.style.marginLeft = 1.5 + "rem"
        this.inbetween = this.$refs.inbetween as HTMLElement
        this.renameInput = this.$refs.renameInput as HTMLInputElement
        this.dropContainer = this.$refs.dropContainer as HTMLElement

        this.dropContainer.draggable = true
        this.dropContainer.setAttribute("itemID", this.itemData.itemID)
        this.dropContainer.setAttribute("parentID", this.itemData.parentFolderID)

        this.inbetween.addEventListener("dragover", e => {
            e.preventDefault()
        })
    }

    get rename() {
        return (
            this.contextData.targetElementID == this.itemData.itemID &&
            this.contextData.targetIsFolder == false &&
            this.contextData.actionPerformed == ContextAction.rename
        )
    }

    updated() {
        if (!this.oldRename && this.rename) {
            this.renameInput.focus()
        }
        this.oldRename = this.rename
    }

    save() {
        this.$emit("save")
    }

    get modeMove() {
        return this.eclipseData.mode == Mode.Move
    }

    get hidden() {
        return this.itemData.hidden
    }

    containedInSearchResult(): boolean {
        for (const element of this.searchResults) {
            if ("itemID" in element && (element as itemData).itemID == this.itemData.itemID) return true
        }
        return false
    }

    async click(e: any) {
        if (
            e.explicitOriginalTarget != this.dropContainer &&
            e.originalTarget != this.dropContainer &&
            e.explicitOriginalTarget != this.container &&
            e.originalTarget != this.container
        )
            return
        var tabElement = e.originalTarget as HTMLHtmlElement
        var tabID = this.itemData.tabID
        const tabList = await tabHelper.getTabs()
        var tabs = tabHelper.getTabByTabIDSync(tabID, tabList)
        var tab =
            tabs != undefined
                ? tabs
                : {
                      pinned: false
                  }
        // var currentTab = tabHelper.getCurrentTab();
        if (!tab.pinned) {
            const tabExists = tabHelper.tabExistsSync(tabID, tabList)
            if (!this.itemData.hidden) {
                if (this.eclipseData.hideOrSwitchTab == false) {
                    const next = tabHelper.getNeighbourTabSync(tabID, tabList)
                    tabHelper.focusTab(next)
                    tabHelper.hideTab(tabID)
                    if (tabExists) {
                        this.itemData.hidden = true
                        tabElement.classList.add("tabHidden")
                    }
                } else tabHelper.focusTab(tabID)
            } else {
                if (tabExists) {
                    if (!(await tabHelper.showTab(tabID))) {
                        await tabHelper.createTab(this.itemData.url)
                    }
                    tabHelper.focusTab(tabID)
                } else {
                    const fireTab = await tabHelper.createTab(this.itemData.url)
                    this.itemData.tabID = fireTab.id.toString()
                }
                this.itemData.hidden = false
                tabElement.classList.remove("tabHidden")
            }
        } else {
            tabHelper.focusTab(tabID)
        }
        this.save()
    }

    async renameSubmit(event: any) {
        if (event.keyCode == KeyCode.enter) {
            event.preventDefault()
            var value = event.originalTarget.value
            if (value != "") this.itemData.title = value
            this.renameEnd()
            this.save()
        }
        if (event.keyCode == KeyCode.escape) {
            this.renameEnd()
        }
    }

    renameEnd() {
        this.$emit("renameEnd")
    }

    sendTargetElementChange() {
        this.$emit("targetElementChange", this.itemData, this.parentFolder)
    }

    dragstart_handler(event: any) {
        this.container.classList.add("hover")
        this.sendTargetElementChange()
        this.$emit("dragstart", event)
    }

    dropend_handler() {}

    dragend_handler() {
        this.container.classList.remove("hover")
        this.$emit("dragend", undefined)
    }

    inbetweenDrop() {
        if (this.targetElement == undefined) return
        if (this.targetElement.parentFolderID != this.itemData.parentFolderID) {
            moveElement(
                this.targetElement!,
                getFolderJSONObjectByID(this.targetElement.parentFolderID!, this.eclipseData.rootFolder)!,
                getFolderJSONObjectByID(this.itemData.parentFolderID!, this.eclipseData.rootFolder)!
            )
        }
        this.targetElement.index = +this.itemData.index + 1
        this.save()
        this.allreload()
    }
}
</script>

<style scoped>
span {
    margin: 0;
}
</style>
