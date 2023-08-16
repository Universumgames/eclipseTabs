<template>
    <div id="export">
        <pre id="jsonContent"></pre>
    </div>
</template>

<script lang="ts">
import { TabStructData } from "@/scripts/tabStructData"
import { Vue } from "vue-class-component"

export default class Export extends Vue {
    mounted() {
        this.exportData()
        this.downloadData()
    }

    async exportData() {
        const json = document.getElementById("jsonContent")
        if (json != undefined) {
            const data = await TabStructData.loadFromStorage()
            json.innerHTML = JSON.stringify(data, undefined, 2)
        }

    }

    async downloadData() {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(await TabStructData.loadFromStorage())));
        // format date in YYYY-MM-DD
        const formattedDate = new Date().toISOString().slice(0, 10)
        element.setAttribute('download', `eclipseData-${formattedDate}.json`);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}
</script>

<style src="@/assets/style/export.css"></style>
