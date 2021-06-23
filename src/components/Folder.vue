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
            <path style="fill:none;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="M 0.0,0.0 6,8.0 12.0,0.0" />
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
                ></Item>
                <Folder
                    v-if="'folderID' in element"
                    :eclipseData="this.eclipseData"
                    :folderData="element"
                    :tier="this.tier + 1"
                    :allreload="this.allreload"
                ></Folder>
            </div>
        </div>
        <!--renaming functionality-->
        <input
            v-show="this.isRenameable && this.renamingOpen"
            ref="renaming"
            type="text"
            placeholder="New Name"
            class="dsiabled"
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
import { folderData, KeyCode, Mode, tabStructData } from "@/scripts/interfaces"
import * as defs from "@/scripts/dataHandler/definitions"

@Options({
    components: { Item },
    props: {
        eclipseData: Object,
        folderData: Object,
        tier: Number,
        allreload: Function
    }
})
export default class Folder extends Vue {
    folderData!: folderData
    eclipseData!: tabStructData
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

    folderClick(e: any) {
        if (e.explicitOriginalTarget == this.container) this.folderData.open = !this.folderData.open
    }

    dragstart_handler() {}
    drop_handler() {}
    dragover_handler() {}
    dropend_handler() {}
    dragend_handler() {}
    dragenter_handler() {}
    dragleave_handler() {}

    inbetweenDrop() {}
}
</script>
