<template>
    <div class="bottom bottomElement" :class="colorMode">
        <div class="bottomElements bottomElement">
            <div id="addFolder" class="bottomElement">
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
            <div id="exportData" class="bottomElement">
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
            <div id="importData" class="bottomElement">
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
            <div id="moveElements" class="bottomElement">
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
            <button id="structCleaner">
                <span title="You * up your data struct? Just reset it to default values to test and try again">Clear Data Struct</span>
            </button>
            <button id="structReloader">
                <span title="You are not sure, the displayed data ist the newest? Reload everything, it's like restarting your browser or the addon"
                    >Reload Data Struct</span
                >
            </button>
            <button id="extensioReloader">
                <span
                    title="Don't want to switch the tab to the debugging window and reload the addon to load the newest creations? Reload the addon from here, unless you * up the whole addon"
                    >Reload Extension</span
                >
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { ColorScheme, tabStructData } from "@/scripts/interfaces"
import { Options, Vue } from "vue-class-component"

@Options({
    props: {
        eclipseData: String
    }
})
export default class BottomMenu extends Vue {
    eclipseData!: tabStructData

    mounted() {}

    get colorMode() {
        return this.eclipseData.colorScheme == ColorScheme.dark ? "darkmode" : "lightmode"
    }

    get coloredSVGPath() {
        return this.eclipseData.colorScheme == ColorScheme.dark ? "icons/dark/" : "icons/light/"
    }
}
</script>

<style src="@/assets/style/bottom.css"></style>
