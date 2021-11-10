<template>
    <router-view :eclipseData="this.eclipseData" :allreload="this.allReload" v-on:save="this.save" />
</template>

<script lang="ts">
import { reactive } from "vue"
import { Vue } from "vue-class-component"
import { createEmptyData } from "./scripts/dataHandler/adder"
import { getDataStructFromFirefox, saveDataInFirefox } from "./scripts/dataHandler/getter"
import { updateTabs, updateTabsOnStartUp } from "./scripts/dataHandler/updater"
import { getManifest, getTheme, registerListener, startupHandler } from "./scripts/firefoxHandler"
import { ColorScheme, FirefoxTheme, tabStructData } from "./scripts/interfaces"
import * as tabHelper from "./scripts/tabHelper"

export default class App extends Vue {
    eclipseData = reactive<tabStructData>(createEmptyData())

    created() {
        this.startup()
    }

    async mounted() {
        startupHandler({ startup: this.startup })

        this.$router.beforeEach(to => {
            document.title = to.meta.title != undefined ? (to.meta.title as string) : "404 Page not found"
        })
        await this.allReload()

        registerListener({
            updateList: () => {
                this.updateList()
            },
            setColorScheme: async () => {
                this.setColorScheme(await getTheme())
            }
        })
    }

    // eslint-disable-next-line no-unused-vars
    setColorScheme(theme: FirefoxTheme) {
        const body = document.getElementsByTagName("body")[0]
        body.classList.add(this.eclipseData.colorScheme == ColorScheme.dark ? "darkmode" : "lightmode")
        // const root = document.documentElement
        // root.style.setProperty("--bg-color", theme.colors.sidebar)
        // root.style.setProperty("--context-bg-color", theme.colors.popup)
        // root.style.setProperty("--text-color", theme.colors.sidebar_text)
        // root.style.setProperty("--color-hidden", theme.colors.frame)
        // // root.style.setProperty("--folder-closed-text-color", "blue")
        // root.style.setProperty("--divider-color", theme.colors.sidebar_border)
        // root.style.setProperty("--button-background-active", theme.colors.button_background_active)
        // root.style.setProperty("--button-background-hover", theme.colors.button_background_hover)
        // root.style.setProperty("--folder-arrow-color", theme.colors.icons)
    }

    async startup() {
        const that = this
        const temp = await getDataStructFromFirefox()
        if (temp != undefined) this.eclipseData = temp
        else this.eclipseData = createEmptyData()
        tabHelper.getTabs().then(async function(tabs: any) {
            updateTabsOnStartUp(that.eclipseData.rootFolder, tabs)
            that.save()
        })
        // console.log("Called startup")
    }

    async allReload() {
        const temp = await getDataStructFromFirefox()
        if (temp == undefined) {
            this.eclipseData = createEmptyData()
            this.save()
            console.log("Data cleared or extension is newly installed, created new storage structure: ", this.eclipseData)
        } else this.eclipseData = temp
        if (this.eclipseData.version == undefined || this.eclipseData.version == "") {
            this.eclipseData.version = "1.1.0"
            this.save()
        }
        if (this.eclipseData.version != getManifest().version) {
            this.eclipseData.version = getManifest().version
            await this.save()
            await this.displayHowTo()
        }
        const theme = await getTheme()
        this.setColorScheme(theme)
        const that = this
        tabHelper.getTabs().then(async function(tabs: any) {
            await updateTabsOnStartUp(that.eclipseData.rootFolder, tabs)
            await updateTabs(that.eclipseData as tabStructData, tabs)
            that.$forceUpdate()
            that.save()
        })
        // console.log(this.eclipseData)

        // console.log("reloaded")
    }

    updateList() {
        this.allReload()
    }

    async save() {
        await saveDataInFirefox(JSON.parse(JSON.stringify(this.eclipseData)))
        console.log(this.eclipseData)
    }

    async displayHowTo() {
        await tabHelper.createTabIfNotExist("./index.html#/howto")
    }
}
</script>

<style>
#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
}

#nav {
    padding: 30px;
}

#nav a {
    font-weight: bold;
    color: #2c3e50;
}

#nav a.router-link-exact-active {
    color: #42b983;
}
</style>

<style src="@/assets/style/style.css"></style>
<style src="@/assets/style/scrollbar.css"></style>
