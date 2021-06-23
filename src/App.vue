<template>
    <!--<div id="nav" style="position: fixed">
        <router-link to="/">Sidebar</router-link> | <router-link to="/settings">Settings</router-link> | <router-link to="/howto">HowTo</router-link>|
        <router-link to="/export">Export</router-link> |
        <router-link to="/import">Import</router-link>
    </div>-->
    <router-view :eclipseData="this.eclipseData" :allreload="this.allReload" />
</template>

<script lang="ts">
import { Vue } from "vue-class-component"
import { createEmptyData } from "./scripts/dataHandler/adder"
import { getDataStructFromFirefox } from "./scripts/dataHandler/getter"
import { updateTabs, updateTabsOnStartUp } from "./scripts/dataHandler/updater"
import { registerListener } from "./scripts/firefoxHandler"
import { ColorScheme, tabStructData } from "./scripts/interfaces"
import * as tabHelper from "./scripts/tabHelper"

export default class App extends Vue {
    eclipseData: tabStructData = createEmptyData()

    async mounted() {
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

    async allReload() {
        this.eclipseData = (await getDataStructFromFirefox())!
        this.setColorScheme()
        const that = this
        tabHelper.getTabs().then(async function(tabs: any) {
            updateTabsOnStartUp(that.eclipseData.rootFolder, tabs)
            updateTabs(that.eclipseData, tabs)
            that.$forceUpdate()
        })
        console.log("reloaded")
    }

    updateList() {
        this.$forceUpdate()
        console.log("update")
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
