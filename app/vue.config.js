const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: "../public",
  configureWebpack: (config) => {
    if (process.env.BUILD_MODE === "dev") {
      return {
        devtool: "source-map",
      };
    }
    delete config.devtool;
    return {
      output: {
        filename: "js/[name].[contenthash:8].js",
        chunkFilename: "js/[name].[contenthash:8].chunk.js",
      },
    };
  },
});
