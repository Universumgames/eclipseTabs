<template>
    <div
        ref="container"
        :class="'overflow listItem ' + (this.hidden ? 'tabHidden' : '')"
        @click="this.click"
        @dragstart="this.dragstart_handler"
        @dropend="this.dropend_handler"
        @dragend="this.dragend_handler"
    >
        <img :src="this.itemData.favIconURL" class="favicon noEvents" />
        <div class="noEvents name">{{ this.itemData.title }}</div>
        <br />
        <input type="text" :class="this.rename ? '' : 'disabled'" placeholder="New Name" @keyup="this.renameSubmit" ref="renameInput" />
        <div v-if="this.modeMove" @drop="this.inbetweenDrop" ref="inbetween">
            <small class="noEvents">Insert Below {{ this.itemData.title }}</small>
        </div>
    </div>
</template>

<script lang="ts">
import { elementData, folderData, itemData, KeyCode, Mode, tabStructData } from "@/scripts/interfaces"
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
    tier: number = 0
    allreload!: Function

    rename: boolean = false

    container!: HTMLElement
    inbetween!: HTMLElement
    renameInput!: HTMLInputElement

    mounted() {
        this.container = this.$refs.container as HTMLElement
        if (this.tier != 0) this.container.style.marginLeft = 1.5 + "rem"
        this.inbetween = this.$refs.inbetween as HTMLElement
        this.renameInput = this.$refs.renameInput as HTMLInputElement

        this.container.draggable = true
        this.container.setAttribute("itemID", this.itemData.itemID)
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
                    await tabHelper.createTab(this.itemData.url)
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
            this.rename = false
        }
        if (event.keyCode == KeyCode.escape) {
            this.rename = false
        }
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
        //this.$emit("dragend", event)
    }

    inbetweenDrop() {}
}
</script>
