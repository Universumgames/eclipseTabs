<template>
    <div ref="container">
        <div ref="dropContainer" :folderID="folderData.folderID" :index="folderData.index">
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
        </div>
        <!--Child container-->
        <div v-show="this.folderData.open" v-if="this.folderData.elements.length > 0">
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
                    :contextData="this.contextData"
                    v-on:save="this.save"
                    v-on:targetElementChange="this.targetElementChangePassOn"
                    v-on:renameEnd="this.renameEnd"
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
                    :contextData="this.contextData"
                    v-on:save="save"
                    v-on:targetElementChange="this.targetElementChangePassOn"
                    v-on:move="this.movePassOn"
                    v-on:renameEnd="this.renameEnd"
                ></Folder>
            </div>
        </div>
        <!--renaming functionality-->
        <input
            v-show="this.isRenameable"
            ref="renameInput"
            type="text"
            placeholder="New Name"
            :class="this.rename ? '' : 'disabled'"
            @keyup="this.renameSubmit"
        />
        <!--Inbetween-->
        <div v-show="this.modeMove" isInbetween="true" @drop="this.inbetweenDrop" ref="inbetween">
            <small class="noEvents">Insert Below {{ this.folderData.name }}</small>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import Item from "@/components/Item.vue"
import { ContextAction, ContextMenuData, elementData, folderData, KeyCode, Mode, tabStructData } from "@/scripts/interfaces"
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
        contextData: Object,
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
    contextData!: ContextMenuData
    tier: number = 0
    allreload!: Function

    icon!: HTMLElement
    renameInput!: HTMLElement
    container!: HTMLElement
    inbetween!: HTMLElement
    dropContainer!: HTMLElement

    oldRename: boolean = false

    mounted() {
        this.icon = this.$refs.icon as HTMLElement
        this.renameInput = this.$refs.renameInput as HTMLElement
        this.container = this.$refs.container as HTMLElement
        if (this.tier != 0) this.container.style.marginLeft = 1.5 + "rem"
        this.inbetween = this.$refs.inbetween as HTMLElement
        this.dropContainer = this.$refs.dropContainer as HTMLElement

        //register drag events
        if (this.isRenameable) this.dropContainer.draggable = true
        this.dropContainer.addEventListener("dragstart", this.dragstart_handler)
        this.dropContainer.addEventListener("drop", this.drop_handler)
        this.dropContainer.addEventListener("dragover", this.dragover_handler)
        this.dropContainer.addEventListener("dropend", this.dropend_handler)
        this.dropContainer.addEventListener("dragend", this.dragend_handler)
        this.dropContainer.addEventListener("dragenter", this.dragenter_handler)
        this.dropContainer.addEventListener("dragleave", this.dragleave_handler)
        //on click
        this.dropContainer.onclick = this.folderClick

        this.dropContainer.setAttribute("folderID", this.folderData.folderID)

        this.inbetween.addEventListener("dragover", e => {
            e.preventDefault()
        })
    }

    updated() {
        if (!this.oldRename && this.rename) {
            this.renameInput.focus()
        }
        this.oldRename = this.rename
    }

    renameSubmit(event: any) {
        if (event.keyCode == KeyCode.enter) {
            event.preventDefault()
            var value = event.originalTarget.value
            if (value != "") this.folderData.name = value
            this.renameEnd()
            this.save()
        }
        if (event.keyCode == KeyCode.escape) {
            this.renameEnd()
        }
    }

    get isRenameable() {
        return this.folderData.folderID != defs.pinnedFolderID && this.folderData.folderID != defs.unorderedFolderID
    }

    get rename() {
        return (
            this.contextData.targetElementID == this.folderData.folderID &&
            this.contextData.targetIsFolder == true &&
            this.contextData.actionPerformed == ContextAction.rename
        )
    }

    get delete() {
        return (
            this.contextData.targetElementID == this.folderData.folderID &&
            this.contextData.targetIsFolder == true &&
            this.contextData.actionPerformed == ContextAction.delete
        )
    }

    get modeMove() {
        return this.eclipseData.mode == Mode.Move
    }

    sendTargetElementChange() {
        this.$emit("targetElementChange", this.folderData, this.parentFolder)
    }

    targetElementChangePassOn(element: elementData, parent: folderData) {
        this.$emit("targetElementChange", element, parent)
    }

    folderClick(e: any) {
        if (e.explicitOriginalTarget == this.dropContainer) {
            this.folderData.open = !this.folderData.open
            this.save()
        }
    }

    save() {
        this.$emit("save")
    }

    renameEnd() {
        this.$emit("renameEnd")
    }

    dragstart_handler(event: any) {
        if (event.explicitOriginalTarget == this.dropContainer) {
            this.container.classList.add("hover")
            this.sendTargetElementChange()
            this.$emit("dragstart", event)
        }
    }

    drop_handler(event: any) {
        this.container.classList.remove("hover")
        if (event.explicitOriginalTarget == this.dropContainer) this.$emit("move", this.folderData)
    }

    movePassOn(targetFolder: folderData) {
        this.$emit("move", targetFolder)
    }

    dragover_handler(e: any) {
        e.preventDefault()
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
        if (this.targetElement == undefined) return
        if (this.targetElement.parentFolderID != this.folderData.parentFolderID) {
            moveElement(
                this.targetElement!,
                getFolderJSONObjectByID(this.targetElement.parentFolderID!, this.eclipseData.rootFolder)!,
                getFolderJSONObjectByID(this.folderData.parentFolderID!, this.eclipseData.rootFolder)!
            )
        }
        this.targetElement.index = +this.folderData.index + 1
        this.save()
        this.allreload()
    }
}
</script>
