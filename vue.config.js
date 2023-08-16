const { defineConfig } = require("@vue/cli-service")

module.exports = defineConfig({
    publicPath: "./",
    productionSourceMap: false,
    css: {
        extract: false,
    },
    configureWebpack: (config) => {
        config.devtool = "source-map"
    },
})
