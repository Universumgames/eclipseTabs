<template>
    <div><BottomMenu :eclipseData="this.eclipseData" /></div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import BottomMenu from "@/components/Bottom.vue"
import { tabStructData } from "@/scripts/interfaces"

@Options({
    components: { BottomMenu },
    props: {
        eclipseData: String
    }
})
export default class Sidebar extends Vue {
    eclipseData!: tabStructData

    mounted() {
        console.log(this.eclipseData)
    }
}
</script>
