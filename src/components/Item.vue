<template>
    <div ref="container" @click="this.click" class="overflow listItem">
        <img :src="this.itemData.favIconURL" class="favicon" />
        <div class="noEvents name">{{ this.itemData.title }}</div>
        <br />
        <input type="text" class="disabled" placeholder="New Name" @keyup="this.renameSubmit" />
        <div v-if="this.modeMove" @drop="this.inbetweenDrop" ref="inbetween">
            <small class="noEvents">Insert Below {{ this.itemData.title }}</small>
        </div>
    </div>
</template>

<script lang="ts">
import { itemData, Mode, tabStructData } from "@/scripts/interfaces"
import { Options, Vue } from "vue-class-component"

@Options({
    components: {},
    props: {
        eclipseData: Object,
        itemData: Object,
        tier: Number,
        allreload: Function
    }
})
export default class Item extends Vue {
    itemData!: itemData
    eclipseData!: tabStructData
    tier: number = 0
    allreload!: Function

    container!: HTMLElement
    inbetween!: HTMLElement

    mounted() {
        this.container = this.$refs.container as HTMLElement
        this.container.style.marginLeft = this.tier * 4 + "px"
        this.inbetween = this.$refs.inbetween as HTMLElement
    }

    get modeMove() {
        return this.eclipseData.mode == Mode.Move
    }

    click() {}

    renameSubmit() {}

    dragstart_handler() {}
    drop_handler() {}
    dragend_handler() {}

    inbetweenDrop() {}
}
</script>
