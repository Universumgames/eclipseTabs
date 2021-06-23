module.exports = {
    publicPath: "./",
    filenameHashing: false,
    productionSourceMap: false,
    css: {
        extract: false
    },
    configureWebpack: config => {
        config.devtool = "source-map"
    }
}
