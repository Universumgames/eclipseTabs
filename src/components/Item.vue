<template>
    <div
        ref="container"
        :class="'overflow listItem ' + (this.hidden ? 'tabHidden' : '')"
        @click="this.click"
        @dragstart="this.dragstart_handler"
        @dropend="this.dropend_handler"
        @dragend="this.dragend_handler"
    >
        <div ref="dropContainer" :itemID="this.itemData.itemID" :index="this.itemData.index">
            <img :src="this.itemData.favIconURL" class="favicon noEvents" />
            <div class="noEvents name">{{ this.itemData.title }}</div>
        </div>
        <input type="text" :class="this.rename ? '' : 'disabled'" placeholder="New Name" @keyup="this.renameSubmit" ref="renameInput" />
        <div v-if="this.modeMove" @drop="this.inbetweenDrop" ref="inbetween">
            <small class="noEvents">Insert Below {{ this.itemData.title }}</small>
        </div>
    </div>
</template>

<script lang="ts">
import { ContextMenuData, elementData, folderData, itemData, KeyCode, Mode, tabStructData } from "@/scripts/interfaces"
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
        allreload: Function
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
    }

    get rename() {
        return (
            this.contextData.targetElementID == this.itemData.itemID &&
            this.contextData.targetIsFolder == false &&
            this.contextData.actionPerformed == 0
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

    async click(e: any) {
        if (e.explicitOriginalTarget != this.dropContainer) return
        var tabElement = e.originalTarget as HTMLHtmlElement
        var tabID = this.itemData.tabID
        var tabs = await tabHelper.getTabByTabID(tabID)
        var tab = (await tabHelper.tabExists(tabID))
            ? tabs
            : {
                  pinned: false
              }
        // var currentTab = tabHelper.getCurrentTab();
        if (!tab.pinned) {
            const tabExists = await tabHelper.tabExists(tabID)
            if (!this.itemData.hidden) {
                if (this.eclipseData.hideOrSwitchTab == false) {
                    if (tabExists && (await tabHelper.hideTab(tabID))) {
                        this.itemData.hidden = true
                        tabElement.classList.add("tabHidden")
                    }
                } else tabHelper.focusTab(tabID)
            } else {
                if (tabExists) {
                    if (!(await tabHelper.showTab(tabID))) {
                        await tabHelper.createTab(this.itemData.url)
                    }
                    await tabHelper.focusTab(tabID)
                } else {
                    const fireTab = await tabHelper.createTab(this.itemData.url)
                    this.itemData.tabID = fireTab.id.toString()
                }
                this.itemData.hidden = false
                tabElement.classList.remove("tabHidden")
            }
        } else {
            await tabHelper.focusTab(tabID)
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
    }

    inbetweenDrop() {
        // TODO missing implementation for dropping in between
    }
}
</script>
