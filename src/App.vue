<template>
    <router-view :eclipseData="eclipseData" :allreload="allReload" v-on:save="save" />
</template>

<script lang="ts">
import { reactive } from "vue"
import { Vue } from "vue-class-component"
import { createEmptyData } from "./scripts/dataHandler/adder"
import { getDataStructFromFirefox, saveDataInFirefox } from "./scripts/dataHandler/getter"
import { updateTabs, updateTabsOnStartUp } from "./scripts/dataHandler/updater"
import { getManifest, getTheme, registerListener, startupHandler } from "./scripts/browserHandler"
import { ColorScheme, FirefoxTheme, tabStructData } from "./scripts/interfaces"
import { upgradeHandler } from "./scripts/eclipseHandler"
import * as tabHelper from "./scripts/tabHelper"
import { resetAllFavIconRefCounter } from "./scripts/dataHandler/changer"

export default class App extends Vue {
    eclipseData = reactive<tabStructData>(createEmptyData())
    loadedOnce: Boolean = false

    created() {
        // this.startup()
    }

    async mounted() {
        startupHandler({ startup: this.startup })

        this.$router.beforeEach(to => {
            document.title = to.meta.title != undefined ? (to.meta.title as string) : "404 Page not found"
        })

        await this.getEclipseData()
        await this.updateVersion()

        const theme = await getTheme()
        this.setColorScheme(theme)

        registerListener({
            updateList: () => {
                this.updateList()
            },
            setColorScheme: async () => {
                this.setColorScheme(await getTheme())
            }
        })
    }

    async getEclipseData() {
        const temp = await getDataStructFromFirefox()
        if (temp == undefined) {
            this.eclipseData = createEmptyData()
            this.save()
            console.log("Data cleared or extension is newly installed, created new storage structure: ", this.eclipseData)
        } else this.eclipseData = temp
    }

    async updateVersion() {
        /* if (this.eclipseData.version == undefined || this.eclipseData.version == "") {
            this.eclipseData.version = "1.1.0"
            await this.save()
        } */
        upgradeHandler(this.eclipseData as tabStructData)
        const manifest = getManifest()
        if (this.eclipseData.version != manifest.version) {
            this.eclipseData.version = manifest.version
            await this.save()
            this.displayHowTo()
        }
    }

    // eslint-disable-next-line no-unused-vars
    setColorScheme(theme: FirefoxTheme) {
        const body = document.getElementsByTagName("body")[0]
        body.classList.add(this.eclipseData.colorScheme == ColorScheme.dark ? "darkmode" : "lightmode")
    }

    async startup() {
        const that = this
        const temp = await getDataStructFromFirefox()
        if (temp != undefined) this.eclipseData = temp
        else this.eclipseData = createEmptyData()
        tabHelper.getTabs().then(async function(tabs: any) {
            updateTabsOnStartUp(that.eclipseData as tabStructData, that.eclipseData.rootFolder, tabs)
            that.save()
        })
        // console.log("Called startup")
    }

    async allReload() {
        await this.getEclipseData()
        const that = this
        tabHelper.getTabs().then(async function(tabs: any) {
            resetAllFavIconRefCounter(that.eclipseData as tabStructData)
            await updateTabsOnStartUp(that.eclipseData as tabStructData, that.eclipseData.rootFolder, tabs)
            await updateTabs(that.eclipseData as tabStructData, tabs)
            that.$forceUpdate()
            that.save()
            that.updateVersion()
        })
        console.log("EclipseData", this.eclipseData)

        // console.log("reloaded")
    }

    updateList() {
        this.allReload()
    }

    async save() {
        await saveDataInFirefox(JSON.parse(JSON.stringify(this.eclipseData)))
        // console.log("Data: ", this.eclipseData)
    }

    displayHowTo() {
        if (this.loadedOnce) return
        this.loadedOnce = true
        // console.error("display howto")
        tabHelper.createTabIfNotExist("./index.html#howto")
    }
}
</script>

<style>
#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
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
