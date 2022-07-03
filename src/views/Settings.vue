<template>
    <form id="settingsContainer">
        <br />
        <div id="developerMode">
            <span title="Active Developer View to use important developer tools like resetting the data struct or reloading the addon"
                >Developer View</span
            >
            <label class="switch">
                <input type="checkbox" ref="developerMode_checkbox" />
                <span class="slider round"></span>
            </label>
        </div>
        <div id="darkmodeSW">
            <span title="You are not a dark-mode fan? Let there be light!">Light Mode</span>
            <label class="switch">
                <input type="checkbox" ref="darkModeSW_checkbox" />
                <span class="slider round"></span>
            </label>
        </div>
        <div id="closeTabsSW">
            <span title="When deleting a folder with open (or hidden) tabs, those will be not closed by default, unless you activate that here"
                >Close Tabs when deleting folder</span
            >
            <label class="switch">
                <input type="checkbox" ref="closeTabsSW_checkbox" />
                <span class="slider round"></span>
            </label>
        </div>
        <div id="hideOrSwitchSW">
            <span title="Decide wether you hide/show a tab on click or to directly jump to it">Hide/Show tabs or switch on click</span>
            <label class="switch">
                <input type="checkbox" ref="hideOrSwitchSW_checkbox" />
                <span class="slider round"></span>
            </label>
        </div>
        <br />
        <!--<label>Border color <input type="text" id="color" /></label>-->
        <button type="submit" @click="saveOptions">Save</button><br />
        <button type="submit" @click="openHowTo">Open HowTo Page</button><br />
        <button @click="clearStruct">
            <span title="You * up your data struct? Just reset it to default values to test and try again">Clear Data Struct</span></button
        ><br />
    </form>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { getDataStructFromFirefox, saveDataInFirefox } from "@/scripts/dataHandler/getter"
import { ColorScheme, tabStructData } from "@/scripts/interfaces"
import { reloadExtension } from "@/scripts/helper"
import * as tabHelper from "@/scripts/tabHelper"
import { createEmptyData } from "@/scripts/dataHandler/adder"

@Options({
    props: {
        allreload: Function
    }
})
export default class Settings extends Vue {
    devModeSW!: HTMLInputElement
    darkModeSW!: HTMLInputElement
    closeTabsDeletingFolderSW!: HTMLInputElement
    hideOrSwitchSW!: HTMLInputElement

    allreload!: Function

    mounted() {
        this.devModeSW = this.$refs.developerMode_checkbox as HTMLInputElement
        this.darkModeSW = this.$refs.darkModeSW_checkbox as HTMLInputElement
        this.closeTabsDeletingFolderSW = this.$refs.closeTabsSW_checkbox as HTMLInputElement
        this.hideOrSwitchSW = this.$refs.hideOrSwitchSW_checkbox as HTMLInputElement
        this.restoreOptions()
    }

    unmounted() {
        document.body.classList.remove("darkmode")
    }

    async saveOptions(e: any) {
        e.preventDefault()
        const data = await getDataStructFromFirefox()
        if (data == undefined) return
        // console.log(data)
        data.devMode = this.devModeSW.checked
        data.closeTabsInDeletingFolder = this.closeTabsDeletingFolderSW.checked
        data.colorScheme = this.darkModeSW.checked ? ColorScheme.light : ColorScheme.dark
        data.hideOrSwitchTab = this.hideOrSwitchSW.checked
        saveDataInFirefox(data)
        reloadExtension()
    }

    restoreOptions() {
        const that = this
        function setCurrentChoices(storage: tabStructData) {
            that.devModeSW.checked = storage.devMode as boolean
            that.closeTabsDeletingFolderSW.checked = storage.closeTabsInDeletingFolder as boolean
            that.darkModeSW.checked = storage.colorScheme == ColorScheme.light
            that.hideOrSwitchSW.checked = storage.hideOrSwitchTab as boolean

            if (storage.colorScheme == ColorScheme.dark) document.body.classList.add("darkmode")
        }

        getDataStructFromFirefox().then(eclipseStorage => {
            setCurrentChoices(eclipseStorage!)
        })
    }

    openHowTo() {
        tabHelper.createTabIfNotExist("./index.html#/howto")
    }

    async clearStruct() {
        await saveDataInFirefox(createEmptyData())
    }
}
</script>

<style src="@/assets/style/settings.css"></style>
<style src="@/assets/style/switch.css"></style>
