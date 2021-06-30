<template>
    <router-view :eclipseData="this.eclipseData" :allreload="this.allReload" v-on:save="this.save" />
</template>

<script lang="ts">
import { reactive } from "vue"
import { Vue } from "vue-class-component"
import { createEmptyData } from "./scripts/dataHandler/adder"
import { getDataStructFromFirefox, saveDataInFirefox } from "./scripts/dataHandler/getter"
import { updateTabs, updateTabsOnStartUp } from "./scripts/dataHandler/updater"
import { getManifest, registerListener, startupHandler } from "./scripts/firefoxHandler"
import { ColorScheme, tabStructData } from "./scripts/interfaces"
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
            }
        })
    }

    setColorScheme() {
        const body = document.getElementsByTagName("body")[0]
        body.classList.add(this.eclipseData.colorScheme == ColorScheme.dark ? "darkmode" : "lightmode")
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
        if (this.eclipseData.version == undefined) {
            this.eclipseData.version = "1.0.5"
            this.displayHowTo()
            this.save()
        }
        if (this.eclipseData.version != getManifest().version) {
            this.eclipseData.version = getManifest().version
            this.displayHowTo()
            this.save()
        }
        this.setColorScheme()
        const that = this
        tabHelper.getTabs().then(async function(tabs: any) {
            updateTabsOnStartUp(that.eclipseData.rootFolder, tabs)
            updateTabs(that.eclipseData, tabs)
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
    }

    displayHowTo() {
        tabHelper.createTab("./index.html#/howto")
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
