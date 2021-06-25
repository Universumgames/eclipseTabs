<template>
    <div :folderID="folderData.folderID" :index="folderData.index" ref="container">
        <!--Dropdown icon-->
        <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="-2 -2 15 15"
            :class="'arrow noEvents ' + (this.folderData.open ? '' : 'rotated')"
            :id="this.folderData.folderID + '_image'"
            ref="icon"
            preserveAspectRatio="none"
        >
            <path style="fill:none;stroke-width:2px;stroke-linecap:butt;stroke-line:join:miter;stroke-opacity:1" d="M 0.0,0.0 6,8.0 12.0,0.0" />
        </svg>
        <!--Text node-->
        <div class="noEvents name">{{ this.folderData.name }}</div>
        <!--Child container-->
        <div v-show="this.folderData.open">
            <div v-for="element in this.folderData.elements" :key="element.index">
                <Item
                    v-if="'itemID' in element"
                    :eclipseData="this.eclipseData"
                    :itemData="element"
                    :tier="this.tier + 1"
                    :allreload="this.allreload"
                    :parentFolder="this.folderData"
                    :htmlTarget="this.htmlTarget"
                    :targetElement="this.targetElement"
                    v-on:save="this.save"
                    v-on:targetElementChange="this.targetElementChange"
                ></Item>
                <Folder
                    v-if="'folderID' in element"
                    :eclipseData="this.eclipseData"
                    :folderData="element"
                    :tier="this.tier + 1"
                    :allreload="this.allreload"
                    :parentFolder="this.folderData"
                    :htmlTarget="this.htmlTarget"
                    :targetElement="this.targetElement"
                    v-on:save="save"
                    v-on:targetElementChange="this.targetElementChange"
                ></Folder>
            </div>
        </div>
        <!--renaming functionality-->
        <input
            v-show="this.isRenameable && this.renamingOpen"
            ref="renaming"
            type="text"
            placeholder="New Name"
            class="disabled"
            @keyup="this.renameSubmit"
        />
        <!--Inbetween-->
        <div v-if="this.modeMove" isInbetween="true" @drop="this.inbetweenDrop" ref="inbetween">
            <small class="noEvents">Insert Below {{ this.folderData.name }}</small>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import Item from "@/components/Item.vue"
import { elementData, folderData, KeyCode, Mode, tabStructData } from "@/scripts/interfaces"
import * as defs from "@/scripts/dataHandler/definitions"
import { moveElement } from "@/scripts/dataHandler/changer"
import { getFolderJSONObjectByID } from "@/scripts/dataHandler/getter"

@Options({
    components: { Item },
    props: {
        eclipseData: Object,
        folderData: Object,
        parentFolder: Object,
        htmlTarget: Object,
        targetElement: Object,
        tier: Number,
        allreload: Function
    }
})
export default class Folder extends Vue {
    folderData!: folderData
    parentFolder!: folderData
    eclipseData!: tabStructData
    htmlTarget: HTMLElement | undefined = undefined
    targetElement: elementData | undefined = undefined
    tier: number = 0
    allreload!: Function

    icon!: HTMLElement
    renaming!: HTMLElement
    container!: HTMLElement
    inbetween!: HTMLElement

    renamingOpen: Boolean = false

    mounted() {
        this.icon = this.$refs.icon as HTMLElement
        this.renaming = this.$refs.renaming as HTMLElement
        this.container = this.$refs.container as HTMLElement
        this.container.style.marginLeft = this.tier * 4 + "px"
        this.inbetween = this.$refs.inbetween as HTMLElement

        //register drag events
        if (this.isRenameable) this.container.draggable = true
        this.container.addEventListener("dragstart", this.dragstart_handler)
        this.container.addEventListener("drop", this.drop_handler)
        this.container.addEventListener("dragover", this.dragover_handler)
        this.container.addEventListener("dropend", this.dropend_handler)
        this.container.addEventListener("dragend", this.dragend_handler)
        this.container.addEventListener("dragenter", this.dragenter_handler)
        this.container.addEventListener("dragleave", this.dragleave_handler)
        //on click
        this.container.onclick = this.folderClick
    }

    renameSubmit(event: any) {
        if (event.keyCode == KeyCode.enter) {
            event.preventDefault()
            var value = event.originalTarget.value
            if (value != "") this.folderData.name = value
            this.renamingOpen = false
        }
        if (event.keyCode == KeyCode.escape) {
            this.renamingOpen = false
        }
    }

    get isRenameable() {
        return this.folderData.folderID != defs.pinnedFolderID && this.folderData.folderID != defs.unorderedFolderID
    }

    get modeMove() {
        return this.eclipseData.mode == Mode.Move
    }

    sendTargetElementChange() {
        this.$emit("targetElementChange", this.folderData, this.parentFolder)
    }

    targetElementChange(element: elementData, parent: folderData) {
        this.$emit("targetElementChange", element, parent)
    }

    folderClick(e: any) {
        if (e.explicitOriginalTarget == this.container) {
            this.folderData.open = !this.folderData.open
            this.save()
        }
    }

    save() {
        this.$emit("save")
    }

    dragstart_handler(event: any) {
        if (event.explicitOriginalTarget == this.container) {
            this.container.classList.add("hover")
            this.sendTargetElementChange()
            this.$emit("dragstart", event)
        }
    }

    drop_handler() {
        // TODO missing drop handler
        moveElement(this.targetElement!, getFolderJSONObjectByID(this.targetElement!.parentFolderID, this.eclipseData.rootFolder)!, this.folderData)
    }

    dragover_handler() {
        //empty
    }

    dropend_handler() {
        //empty
    }

    dragend_handler() {
        this.container.classList.remove("hover")
    }

    dragenter_handler() {
        if (this.targetElement != this.folderData) {
            this.container.classList.add("hover")
        }
    }

    dragleave_handler() {
        if (this.targetElement != this.folderData) {
            this.container.classList.remove("hover")
        }
    }

    inbetweenDrop() {
        // TODO missing implementation for dropping in between
    }
}
</script>
