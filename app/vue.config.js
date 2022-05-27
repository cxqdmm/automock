const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: "../public",
  configureWebpack: (config) => {
    delete config.devtool;
  },
});
