<template>
    <div id="export">
        <pre id="jsonContent"></pre>
    </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component"
import { tabStructData } from "@/scripts/interfaces"
import { getDataStructFromFirefox } from "@/scripts/dataHandler/getter"

export default class Export extends Vue {
    mounted() {
        this.exportData()
    }

    async exportData() {
        const json = document.getElementById("jsonContent")
        if (json != undefined) {
            const data: tabStructData = (await getDataStructFromFirefox())!
            json.innerHTML = JSON.stringify(data, undefined, 2)
        }
    }
}
</script>

<style src="@/assets/style/export.css"></style>
