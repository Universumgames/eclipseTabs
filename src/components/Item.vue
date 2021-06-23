<template>
    <div
        ref="container"
        :class="'overflow listItem ' + (this.hidden ? 'tabHidden' : '')"
        @click="this.click"
        @dragstart="this.dragstart_handler"
        @dropend="this.dropend_handler"
        @dragend="this.dragend_handler"
    >
        <img :src="this.itemData.favIconURL" class="favicon" />
        <div class="noEvents name">{{ this.itemData.title }}</div>
        <br />
        <input type="text" :class="this.rename ? '' : 'disabled'" placeholder="New Name" @keyup="this.renameSubmit" ref="renameInput" />
        <div v-if="this.modeMove" @drop="this.inbetweenDrop" ref="inbetween">
            <small class="noEvents">Insert Below {{ this.itemData.title }}</small>
        </div>
    </div>
</template>

<script lang="ts">
import { saveDataInFirefox } from "@/scripts/dataHandler/getter"
import { itemData, KeyCode, Mode, tabStructData } from "@/scripts/interfaces"
import * as tabHelper from "@/scripts/tabHelper"
import { Options, Vue } from "vue-class-component"

@Options({
    components: {},
    props: {
        eclipseData: Object,
        itemData: Object,
        tier: Number,
        allreload: Function
    }
})
export default class Item extends Vue {
    itemData!: itemData
    eclipseData!: tabStructData
    tier: number = 0
    allreload!: Function

    rename: boolean = false

    container!: HTMLElement
    inbetween!: HTMLElement
    renameInput!: HTMLInputElement

    mounted() {
        this.container = this.$refs.container as HTMLElement
        this.container.style.marginLeft = this.tier * 4 + "px"
        this.inbetween = this.$refs.inbetween as HTMLElement
        this.renameInput = this.$refs.renameInput as HTMLInputElement
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
            if (!this.itemData.hidden) {
                if (this.eclipseData.hideOrSwitchTab == false) {
                    if ((await tabHelper.tabExists(tabID)) && (await tabHelper.hideTab(tabID))) {
                        tabElement.setAttribute("hiddenTab", true + "")
                        this.itemData.hidden = true
                        tabElement.classList.add("tabHidden")
                    }
                } else tabHelper.focusTab(tabID)
            } else {
                if (await tabHelper.tabExists(tabID)) {
                    if (!(await tabHelper.showTab(tabID))) {
                        tabHelper.createTab(this.itemData.url)
                    }
                    tabHelper.focusTab(tabID)
                    tabElement.setAttribute("hiddenTab", false + "")
                    this.itemData.hidden = false
                    tabElement.classList.remove("tabHidden")
                } else {
                    await tabHelper.createTab(this.itemData.url)
                }
            }
        } else {
            tabHelper.focusTab(tabID)
        }
        await saveDataInFirefox(this.eclipseData)
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

    dragstart_handler() {}
    drop_handler() {}
    dragend_handler() {}

    inbetweenDrop() {}
}
</script>
