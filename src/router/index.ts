import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import Home from "../views/Home.vue"

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "Sidebar",
        component: () => import("../views/Sidebar.vue"),
        meta: {
            title: "eclipseTab"
        }
    },
    {
        path: "/settings",
        name: "Settings",
        component: () => import("../views/Settings.vue"),
        meta: {
            title: "Settings - eclipseTab"
        }
    },
    {
        path: "/howto",
        name: "HowTo",
        component: () => import("../views/HowTo.vue"),
        meta: {
            title: "HowTo - eclipseTab"
        }
    },
    {
        path: "/export",
        name: "Export",
        component: () => import("../views/Export.vue"),
        meta: {
            title: "Export your data - eclipseTab"
        }
    },
    {
        path: "/import",
        name: "Import",
        component: () => import("../views/Import.vue"),
        meta: {
            title: "Import data - eclipseTab"
        }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
