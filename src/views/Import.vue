<template>
    <div id="importContainer">
        <textarea id="jsonInput" ref="jsonInputRef" placeholder="put the exported json in here, old data will be deleted in the process"></textarea>
        <br /><br />
        <label for="opentabs">Open imported tabs</label>
        <input type="checkbox" id="opentabs" v-model="openTabs" /><br />
        <button id="inputJSONReplace" @click="onClickReplace">Replace Data</button>
        <button id="inputJSONCombine" @click="onClickCombine">Combine Data</button>
        <button id="inputBookmarkImport" @click="onBookmarkClick">Import Bookmarks</button>
    </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component"
import { getBookmarks } from "@/scripts/browserHandler"
import { importBookmarks, importData } from "@/scripts/dataHandler/importer"

export default class Import extends Vue {
    jsonInput!: HTMLTextAreaElement
    openTabs: boolean = true

    mounted() {
        this.jsonInput = this.$refs.jsonInputRef as HTMLTextAreaElement
    }

    onClickReplace() {
        const text: string = this.jsonInput.value
        importData(text, { overwrite: true, testRun: false, openTabs: this.openTabs })
    }

    onClickCombine() {
        const text: string = this.jsonInput.value
        importData(text, { overwrite: false, testRun: false, openTabs: this.openTabs })
    }

    async onBookmarkClick() {
        importBookmarks(await getBookmarks())
    }
}
</script>

<style src="@/assets/style/import.css"></style>
