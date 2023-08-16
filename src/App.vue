<template>
    <router-view :allreload="allReload" v-on:save="save" />
</template>

<script lang="ts">
//import { reactive } from "vue"
import { Options, Vue } from "vue-class-component"
import { getManifest, getTheme, registerListener, startupHandler } from "./scripts/browserHandler"
import { ColorScheme, FirefoxTab, FirefoxTheme } from "./scripts/interfaces"
import { upgradeHandler } from "./scripts/eclipseHandler"
import * as tabHelper from "./scripts/tabHelper"
import Sidebar from "./views/Sidebar.vue"
import { eclipseStore } from "./store"
import { TabStructData } from "./scripts/tabStructData"

@Options({
    components: {
        Sidebar
    }
})
export default class App extends Vue {
    loadedOnce: Boolean = false
    store = eclipseStore()

    async created() {
    }

    async mounted() {
        await this.startup()

        await startupHandler({ startup: this.startup })

        this.$router.beforeEach(to => {
            document.title = to.meta.title != undefined ? (to.meta.title as string) : "404 Page not found"
        })

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

    async updateVersion() {
        /* if (this.eclipseData.version == undefined || this.eclipseData.version == "") {
            this.eclipseData.version = "1.1.0"
            await this.save()
        } */
        upgradeHandler(this.store.state.eclipseData as TabStructData)
        const manifest = getManifest()
        if (this.store.state.eclipseData!.version != manifest.version) {
            this.store.state.eclipseData!.version = manifest.version
            await this.save()
            this.displayHowTo()
        }
    }

    // eslint-disable-next-line no-unused-vars
    setColorScheme(theme: FirefoxTheme) {
        const body = document.getElementsByTagName("body")[0]
        body.classList.add(this.store.state.eclipseData!.colorScheme == ColorScheme.dark ? "darkmode" : "lightmode")
    }

    async startup() {
        const that = this

        this.store.state.eclipseData = await TabStructData.loadFromStorage()
        tabHelper.getTabs().then(async function (tabs: FirefoxTab[]) {
            that.store.state.eclipseData.updateTabs(tabs)
            that.save()
        })
        console.log("Called startup")
    }

    async allReload() {
        const that = this
        tabHelper.getTabs().then(async function (tabs: any) {
            that.store.state.eclipseData.updateTabs(tabs)
            that.store.state.eclipseData.validateFavIconCache()
            that.$forceUpdate()
            that.save()
            that.updateVersion()
        })
        console.log("reloaded")
    }

    updateList() {
        this.allReload()
    }

    async save() {
        await this.store.state.eclipseData.save()
        this.store.state.eclipseData.sort()

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
