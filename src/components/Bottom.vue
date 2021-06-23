<template>
    <div class="bottom bottomElement" :class="colorMode">
        <div class="bottomElements bottomElement">
            <div id="addFolder" class="bottomElement" @click="addFolderClick">
                <span title="Need order? Create a new folder, name it and move it to andy subdirectory you want">
                    <object
                        class="bottomElementPic noEvents"
                        :data="coloredSVGPath + 'addFolder.svg'"
                        filename="addFolder.svg"
                        type="image/svg+xml"
                    ></object>
                </span>
            </div>

            <div id="delete" class="bottomElement">
                <span title="Just drag stuff over here to erase it from existence" class="noEvents">
                    <object class="bottomElementPic noEvents" :data="coloredSVGPath + 'bin.svg'" filename="bin.svg" type="image/svg+xml"></object>
                </span>
            </div>
            <div id="exportData" class="bottomElement" @click="exportClick">
                <span
                    title="You create a backup from time to time, especially before updating the addon. Click this and the corresponding json ill be displayed in a new tab"
                    class="noEvents"
                >
                    <object
                        class="bottomElementPic noEvents"
                        :data="coloredSVGPath + 'export.svg'"
                        filename="export.svg"
                        type="image/svg+xml"
                    ></object>
                </span>
            </div>
            <div id="importData" class="bottomElement" @click="importClick">
                <span
                    title="Old data got deleted or you transferred your exported data from an other pc to this one? Click here to import your json data"
                    class="noEvents"
                >
                    <object
                        class="bottomElementPic noEvents"
                        :data="coloredSVGPath + 'import.svg'"
                        filename="import.svg"
                        type="image/svg+xml"
                    ></object>
                </span>
            </div>
            <div id="moveElements" class="bottomElement" @click="moveClick" ref="moveBtn">
                <span
                    title="Not happy with the order? Use this to change the view so you can properly change the order of your folders or items"
                    class="noEvents"
                >
                    <object class="bottomElementPic noEvents" :data="coloredSVGPath + 'move.svg'" filename="move.svg" type="image/svg+xml"></object>
                </span>
            </div>
        </div>
        <br />
        <div v-show="this.eclipseData.devMode" id="debugElements">
            <button @click="clearStruct">
                <span title="You * up your data struct? Just reset it to default values to test and try again">Clear Data Struct</span>
            </button>
            <button @click="reloadStruct">
                <span title="You are not sure, the displayed data ist the newest? Reload everything, it's like restarting your browser or the addon"
                    >Reload Data Struct</span
                >
            </button>
            <button @click="reloadAddon">
                <span
                    title="Don't want to switch the tab to the debugging window and reload the addon to load the newest creations? Reload the addon from here, unless you * up the whole addon"
                    >Reload Extension</span
                >
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { ColorScheme, Mode, tabStructData } from "@/scripts/interfaces"
import { Options, Vue } from "vue-class-component"
import * as helper from "@/scripts/helper"
import { createTab } from "@/scripts/tabHelper"

@Options({
    props: {
        eclipseData: Object,
        allreload: Function
    },
    emits: {}
})
export default class BottomMenu extends Vue {
    eclipseData!: tabStructData
    allreload!: Function
    moveBtn!: HTMLElement

    mounted() {
        this.allreload()
        this.moveBtn = this.$refs.moveBtn as HTMLElement
    }

    get colorMode() {
        return this.eclipseData.colorScheme == ColorScheme.dark ? "darkmode" : "lightmode"
    }

    get coloredSVGPath() {
        return this.eclipseData.colorScheme == ColorScheme.dark ? "icons/dark/" : "icons/light/"
    }

    addFolderClick(event: any) {
        this.$emit("folderClick", event)
    }

    binDrop(event: any) {
        this.$emit("binDrop", event)
    }

    exportClick() {
        createTab("./index.html#/export")
    }

    importClick() {
        createTab("./index.html#/import")
    }

    moveClick() {
        switch (this.eclipseData.mode) {
            case Mode.Default:
                this.moveBtn.classList.add("selected")
                break
            case Mode.Move:
                this.moveBtn.classList.remove("selected")
                break
            default:
                break
        }
        this.$emit("moveClick")
    }

    reloadAddon() {
        helper.reloadExtension()
    }

    clearStruct() {
        this.$emit("clearStructClick")
    }

    reloadStruct() {
        this.allreload()
    }
}
</script>

<style src="@/assets/style/bottom.css"></style>
