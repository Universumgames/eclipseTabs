<template>
    <div id="importContainer">
        <textarea id="jsonInput" ref="jsonInputRef"
            placeholder="put the exported json in here, old data will be deleted in the process"></textarea>
        <br /><br />


        <label for="fileUpload">or Import from file</label><br />
        <input type="file" id="fileUpload" ref="fileUpload" /><br /><br /><br />

        <label for="opentabs">Open imported tabs </label>
        <input type="checkbox" id="opentabs" v-model="openTabs" /><br /><br /><br />

        <button id="inputJSONReplace" @click="onClickReplace">Replace Data</button>
        <button id="inputJSONCombine" @click="onClickCombine">Combine Data</button>
        <button id="inputBookmarkImport" @click="onBookmarkClick">Import Bookmarks</button>
    </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component"
import { getBookmarks } from "@/scripts/browserHandler"
import { importBookmarks, importData } from "@/scripts/importer"

export default class Import extends Vue {
    jsonInput!: HTMLTextAreaElement
    fileUpload!: HTMLInputElement
    openTabs: boolean = true

    mounted() {
        this.jsonInput = this.$refs.jsonInputRef as HTMLTextAreaElement
        this.fileUpload = this.$refs.fileUpload as HTMLInputElement
    }

    async onClickReplace() {
        document.body.style.cursor = "wait";
        let text: string = this.jsonInput.value
        const file: File | null | undefined = await this.fileUpload.files?.item(0)
        if (file?.name.endsWith(".json")) {
            text = await file.text()
            this.jsonInput.value = text
        }
        else alert("Only .json files are supported")
        if (confirm("Are you sure you want to replace all data? The data to import is " + text.length + " characters long."))
            importData(text, { overwrite: true, testRun: false, openTabs: this.openTabs })
        document.body.style.cursor = "unset";
    }

    async onClickCombine() {
        document.body.style.cursor = "wait";
        let text: string = this.jsonInput.value
        const file: File | null | undefined = await this.fileUpload.files?.item(0)
        if (file?.name.endsWith(".json")) {
            text = await file.text()
            this.jsonInput.value = text
        }
        else alert("Only .json files are supported")
        if (confirm("Are you sure you want to replace all data? The data to import is " + text.length + " characters long."))
            importData(text, { overwrite: false, testRun: false, openTabs: this.openTabs })
        document.body.style.cursor = "unset";
    }

    async onBookmarkClick() {
        importBookmarks(await getBookmarks())
    }
}
</script>

<style src="@/assets/style/import.css"></style>
